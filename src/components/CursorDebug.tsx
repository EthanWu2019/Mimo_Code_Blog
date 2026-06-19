'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const DOT_SIZE = 22;
const IBEAM_W = 5;
const IBEAM_H = 34;

export default function CursorDebug() {
  const dotRef = useRef<HTMLDivElement>(null);
  const [log, setLog] = useState<string[]>([]);
  const [state, setState] = useState({ w: DOT_SIZE, h: DOT_SIZE, isText: false });

  const addLog = (msg: string) => {
    setLog(prev => [...prev.slice(-20), `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  useEffect(() => {
    const shape = { w: DOT_SIZE, h: DOT_SIZE };
    let isText = false;

    const render = () => {
      if (dotRef.current) {
        dotRef.current.style.width = `${shape.w}px`;
        dotRef.current.style.height = `${shape.h}px`;
      }
      setState({ w: Math.round(shape.w * 10) / 10, h: Math.round(shape.h * 10) / 10, isText });
    };

    addLog('Debug cursor mounted');

    // Test 1: Direct style set
    const testDirect = () => {
      if (dotRef.current) {
        dotRef.current.style.width = '5px';
        dotRef.current.style.height = '34px';
        addLog(`TEST direct: width=${dotRef.current.style.width}, height=${dotRef.current.style.height}, computed: ${getComputedStyle(dotRef.current).width} x ${getComputedStyle(dotRef.current).height}`);
      }
    };

    // Test 2: GSAP animation
    const testGSAP = () => {
      shape.w = DOT_SIZE;
      shape.h = DOT_SIZE;
      render();
      addLog('TEST gsap: starting animation...');
      gsap.to(shape, {
        w: IBEAM_W, h: IBEAM_H,
        duration: 0.5,
        ease: 'power2.inOut',
        onUpdate() {
          if (dotRef.current) {
            dotRef.current.style.width = `${shape.w}px`;
            dotRef.current.style.height = `${shape.h}px`;
          }
          addLog(`TEST gsap onUpdate: w=${shape.w.toFixed(1)}, h=${shape.h.toFixed(1)}`);
        },
        onComplete() {
          const cs = getComputedStyle(dotRef.current!);
          addLog(`TEST gsap done: computed=${cs.width} x ${cs.height}, inline=${dotRef.current!.style.width} x ${dotRef.current!.style.height}`);
        },
      });
    };

    // Run tests after 1 second
    setTimeout(testDirect, 1000);
    setTimeout(testGSAP, 3000);
    // Reset after 5s
    setTimeout(() => {
      if (dotRef.current) {
        dotRef.current.style.width = `${DOT_SIZE}px`;
        dotRef.current.style.height = `${DOT_SIZE}px`;
      }
      addLog('Reset to dot');
    }, 5000);

    return () => { /* cleanup */ };
  }, []);

  return (
    <div style={{
      position: 'fixed', top: 10, left: 10, zIndex: 9999,
      background: 'rgba(0,0,0,0.9)', color: '#0f0', padding: 16,
      borderRadius: 8, fontFamily: 'monospace', fontSize: 12,
      maxHeight: '80vh', overflow: 'auto', width: 420,
      border: '1px solid #0f0',
    }}>
      <div style={{ marginBottom: 8, color: '#ff0', fontWeight: 'bold' }}>
        CURSOR DEBUG PANEL
      </div>

      <div style={{ marginBottom: 8, padding: 8, background: 'rgba(0,255,0,0.1)', borderRadius: 4 }}>
        <div>Current state: w={state.w} h={state.h} isText={state.isText.toString()}</div>
        <div>Shape: {state.w === state.h ? '⚪ CIRCLE' : state.h > state.w ? '📏 TALL PILL' : '📐 WIDE'}</div>
        <div style={{ marginTop: 4, color: state.h > state.w + 5 ? '#0f0' : '#f00' }}>
          {state.h > state.w + 5 ? '✅ I-BEAM ACTIVE (tall pill)' : '❌ DOT MODE (circle)'}
        </div>
      </div>

      {/* Visual preview */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 8 }}>
        <div style={{ color: '#888' }}>Preview:</div>
        <div style={{
          width: state.w, height: state.h,
          borderRadius: '50%', background: '#0f0',
          transition: 'all 0.3s ease',
        }} />
        <div style={{ color: '#888' }}>
          ({state.w}×{state.h})
        </div>
      </div>

      {/* Real cursor element */}
      <div ref={dotRef} style={{
        position: 'fixed', top: 100, left: 200,
        width: DOT_SIZE, height: DOT_SIZE,
        borderRadius: '50%', background: 'red',
        zIndex: 10000, pointerEvents: 'none',
      }} />

      <div style={{ color: '#888', marginBottom: 4 }}>Log (tests auto-run at 1s and 3s):</div>
      {log.map((l, i) => (
        <div key={i} style={{
          color: l.includes('ERROR') ? '#f00' : l.includes('TEST') ? '#ff0' : '#0f0',
          lineHeight: 1.6,
        }}>{l}</div>
      ))}
    </div>
  );
}
