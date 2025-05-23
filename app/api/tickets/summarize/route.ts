import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(request: NextRequest) {
  try {
    const { description } = await request.json();

    if (!description || typeof description !== "string") {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API is not configured" },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: description,
      config: {
        systemInstruction:
          "Please provide a concise summary of the following ticket description. Format your response using Markdown, bullet points, and formatting to highlight key information. Include the following sections: 'Summary', 'Key Points', and 'Action Items' (if any). Keep the summary clear, professional, and well-structured. Make sure to use markdown formatting.",
      },
    });

    const summary = response.text;

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Error summarizing ticket:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
