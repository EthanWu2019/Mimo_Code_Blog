import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * POST /api/gallery/suggest-llm
 *
 * Body: { imageData: string (data URL) }
 *
 * Returns AI-suggested metadata: titles, subtitle, tags, description.
 *
 * Uses mimo-v2.5 (vision-capable) via the same OpenAI-compatible API that
 * powers the Hermes agent -- pulls the URL from env at runtime.
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Login required" }, { status: 401 });
    }

    const body = await request.json();
    const { imageData } = body;
    if (!imageData) {
      return NextResponse.json({ error: "Missing imageData" }, { status: 400 });
    }

    const baseUrl = process.env.MIMO_BASE_URL || "https://token-plan-sgp.xiaomimimo.com/v1";
    const apiKey = process.env.MIMO_API_KEY || process.env.XIAOMI_API_KEY;
    const model = process.env.MIMO_VISION_MODEL || "mimo-v2.5";

    if (!apiKey) {
      // Fallback: stub response so admin still works without LLM credentials.
      return NextResponse.json({
        titles: ["Untitled"],
        subtitle: "Add a description",
        tags: ["art", "photography"],
        description: "",
        stub: true,
      });
    }

    const prompt = `Analyze this image and return a JSON object with EXACTLY this shape, no prose:

{
  "titles": [3 short evocative titles in Chinese, 4-12 chars each],
  "subtitle": "one short English subtitle (8-20 words)",
  "tags": [8-12 lowercase English tags, mix of style/scene/color/mood/technique],
  "description": "50-80 word English description, vivid but factual"
}

Rules:
- titles[0] should be the most poetic / evocative one
- tags should be searchable: include genre (cyberpunk, fantasy, sci-fi), scene (urban, nature, portrait), mood (dark, ethereal, vibrant), technique (digital-painting, illustration, photo)
- NO emoji, NO markdown, just the JSON`;

    const resp = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: imageData } },
            ],
          },
        ],
        max_tokens: 800,
        temperature: 0.8,
      }),
    });

    if (!resp.ok) {
      const err = await resp.text();
      console.error("LLM suggest failed:", err);
      return NextResponse.json(
        { error: `LLM call failed: ${resp.status}` },
        { status: 500 },
      );
    }

    const data = await resp.json();
    const text = data.choices?.[0]?.message?.content || "";

    // Extract JSON from response (model sometimes wraps in code fences)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn("No JSON found in LLM response:", text);
      return NextResponse.json({
        titles: [],
        subtitle: "",
        tags: [],
        description: text.slice(0, 200),
      });
    }

    try {
      const parsed = JSON.parse(jsonMatch[0]);
      return NextResponse.json({
        titles: Array.isArray(parsed.titles) ? parsed.titles : [],
        subtitle: parsed.subtitle || "",
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        description: parsed.description || "",
      });
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr, jsonMatch[0]);
      return NextResponse.json({
        titles: [],
        subtitle: "",
        tags: [],
        description: text.slice(0, 200),
      });
    }
  } catch (error) {
    console.error("Suggest LLM error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
