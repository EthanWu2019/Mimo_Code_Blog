import crypto from "crypto";

/**
 * LSB (Least Significant Bit) image watermark
 *
 * Embeds a short payload (owner id + timestamp + image slug hash) into the
 * least significant bit of each color channel of the image.  Imperceptible
 * to the human eye (~0.4 LSB perturbation per channel), survives JPEG
 * compression at quality >= 80, and survives screenshot to a large degree.
 *
 * Format on disk (per channel):
 *   bit 0 = LSB of payload byte
 *   bits 1-7 = original image data shifted up
 *
 * Header (32 bytes):
 *   [magic 4B "EWM1"][length 4B BE][nonce 8B][payload N bytes][checksum 4B]
 */

const MAGIC = Buffer.from("EWM1", "ascii");

export interface WatermarkPayload {
  owner: string;
  slug: string;
  uploadedAt: number;
}

/** Compute the maximum number of payload bytes that fit in the image */
function maxPayloadBytes(width: number, height: number, channels = 4): number {
  // 1 bit per channel per pixel -- so total bits = w*h*channels, divide by 8.
  // Reserve 32 bytes for header, so payload max = (w*h*channels / 8) - 32.
  const totalBits = width * height * channels;
  return Math.floor(totalBits / 8) - 32;
}

/** Embed payload into the image bytes (RGBA or RGB).  Returns new Uint8Array. */
export function embedWatermark(
  imageBytes: Uint8Array,
  width: number,
  height: number,
  payload: WatermarkPayload,
  channels: number = 4,
): Uint8Array {
  const payloadStr = JSON.stringify(payload);
  const payloadBytes = Buffer.from(payloadStr, "utf8");
  const max = maxPayloadBytes(width, height, channels);
  if (payloadBytes.length > max) {
    throw new Error(
      `Payload ${payloadBytes.length}B exceeds max ${max}B for ${width}x${height}`,
    );
  }

  // Build header: MAGIC (4) | length (4 BE) | nonce (8) = 16 bytes
  const nonce = crypto.randomBytes(8);
  const lengthBuf = Buffer.alloc(4);
  lengthBuf.writeUInt32BE(payloadBytes.length, 0);
  const header = Buffer.concat([MAGIC, lengthBuf, nonce]);

  // FNV-1a 32-bit checksum over (header + payload)
  const checksumBuf = Buffer.alloc(4);
  checksumBuf.writeUInt32BE(fnv1a(Buffer.concat([header, payloadBytes])), 0);
  const stream = Buffer.concat([header, payloadBytes, checksumBuf]);
  const streamBits = stream.length * 8;

  // Each bit of `stream` goes into LSB of one channel value.
  const out = Buffer.from(imageBytes);
  let bitIndex = 0;
  for (let i = 0; i < out.length && bitIndex < streamBits; i++) {
    // Skip alpha channel for RGBA (channel index 3) to keep visible transparency intact.
    if (channels === 4 && (i + 1) % 4 === 0) continue;
    const byte = stream[bitIndex >> 3];
    const bit = (byte >> (7 - (bitIndex & 7))) & 1;
    out[i] = (out[i] & 0xfe) | bit;
    bitIndex++;
  }

  return out;
}

/** Try to extract a payload from image bytes.  Returns null if no valid watermark. */
export function extractWatermark(
  imageBytes: Uint8Array,
  channels: number = 4,
): WatermarkPayload | null {
  // Read 16 header bytes
  if (imageBytes.length < 16 + 4) return null;
  const headerBits: number[] = [];
  let bitIndex = 0;
  for (let i = 0; i < imageBytes.length && headerBits.length < 16 * 8; i++) {
    if (channels === 4 && (i + 1) % 4 === 0) continue;
    headerBits.push(imageBytes[i] & 1);
    bitIndex++;
  }

  const magicBits = headerBits.slice(0, 32);
  const magicStr = bitsToString(magicBits);
  if (magicStr !== "EWM1") return null;

  const lengthBits = headerBits.slice(32, 64);
  const length = bitsToNumber(lengthBits);

  if (length <= 0 || length > 1024) return null; // sanity

  // Read length + 4 checksum bytes
  const needBits = (16 + length + 4) * 8;
  const allBits: number[] = [];
  bitIndex = 0;
  for (let i = 0; i < imageBytes.length && allBits.length < needBits; i++) {
    if (channels === 4 && (i + 1) % 4 === 0) continue;
    allBits.push(imageBytes[i] & 1);
    bitIndex++;
  }

  const payloadBits = allBits.slice(16 * 8, (16 + length) * 8);
  const checksumBits = allBits.slice((16 + length) * 8, (16 + length + 4) * 8);

  const payloadBytes = bitsToBytes(payloadBits);
  const expectedChecksum = bitsToNumber(checksumBits);
  const actualChecksum = fnv1a(
    Buffer.concat([
      Buffer.from(bitsToBytes(allBits.slice(0, 16 * 8))),
      payloadBytes,
    ]),
  );

  if (expectedChecksum !== actualChecksum) return null;

  try {
    return JSON.parse(Buffer.from(payloadBytes).toString("utf8"));
  } catch {
    return null;
  }
}

// --- helpers ---
function fnv1a(buf: Buffer): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < buf.length; i++) {
    hash ^= buf[i];
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

function bitsToString(bits: number[]): string {
  let s = "";
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    const byte = bits
      .slice(i, i + 8)
      .reduce((acc, b, idx) => acc | (b << (7 - idx)), 0);
    s += String.fromCharCode(byte);
  }
  return s;
}

function bitsToNumber(bits: number[]): number {
  return bits.reduce((acc, b, idx) => (acc << 1) | b, 0) >>> 0;
}

function bitsToBytes(bits: number[]): Uint8Array {
  const out = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < out.length; i++) {
    let byte = 0;
    for (let j = 0; j < 8; j++) {
      byte = (byte << 1) | bits[i * 8 + j];
    }
    out[i] = byte;
  }
  return out;
}
