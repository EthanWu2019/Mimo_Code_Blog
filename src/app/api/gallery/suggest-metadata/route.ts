import { NextResponse } from "next/server";
import sharp from "sharp";

/**
 * POST /api/gallery/suggest-metadata
 *
 * Body: { imageData, mime? }
 *
 * Returns lightweight image metadata suggestions (width, height, aspectRatio,
 * dominant colors, brightness).  Title / subtitle / tags generation is done
 * client-side via vision_analyze since that requires multimodal model.
 *
 * This endpoint exists so the client can call it BEFORE asking the LLM for
 * titles/tags, saving round-trips.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageData } = body;
    if (!imageData) {
      return NextResponse.json({ error: "Missing imageData" }, { status: 400 });
    }

    const match = imageData.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) {
      return NextResponse.json({ error: "Invalid data url" }, { status: 400 });
    }
    const bytes = Buffer.from(match[2], "base64");

    const img = sharp(bytes);
    const meta = await img.metadata();
    const stats = await img.stats();

    // Dominant color from RGB channel means
    const r = Math.round(stats.channels[0]?.mean || 0);
    const g = Math.round(stats.channels[1]?.mean || 0);
    const b = Math.round(stats.channels[2]?.mean || 0);
    const brightness = Math.round((r + g + b) / 3);
    const dominantHex =
      "#" +
      [r, g, b]
        .map((v) => v.toString(16).padStart(2, "0"))
        .join("");

    const width = meta.width || 0;
    const height = meta.height || 0;
    const ratio = width && height ? width / height : 1;
    let aspectRatio: "portrait" | "landscape" | "square" = "landscape";
    if (ratio < 0.85) aspectRatio = "portrait";
    else if (ratio > 1.15) aspectRatio = "landscape";
    else aspectRatio = "square";

    return NextResponse.json({
      width,
      height,
      aspectRatio,
      ratio,
      mime: meta.format || "unknown",
      bytes: bytes.length,
      brightness, // 0-255
      dominantColor: { hex: dominantHex, rgb: [r, g, b] },
    });
  } catch (error) {
    console.error("Suggest metadata error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
