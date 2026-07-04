import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const command = message.toLowerCase().trim();
    let systemInstruction = "You are a highly advanced Smart Home AI assistant named Gemini. Reply concisely, cool, and a bit futuristic (max 2 sentences).";

    if (command === "plase on" || command === "please on") {
      systemInstruction += " The user just asked to turn ON the home lights. Acknowledge that the smart lights are now illuminated, sensors are active, and the house is bright in Indonesian.";
    } else if (command === "plase off" || command === "please off") {
      systemInstruction += " The user just asked to turn OFF the home lights. Acknowledge that the smart lights are shutting down, the house is entering sleep mode, and it is now dark and secure in Indonesian.";
    } else {
      systemInstruction += " The user sent an unrecognized command. Inform them to type 'plase on' to activate or 'plase off' to deactivate in Indonesian.";
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: systemInstruction,
    });

    // normalize possible response shapes from the SDK
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const responseAny = response as any;
    const text = responseAny.text ?? responseAny.outputText ??
      responseAny.candidates?.[0]?.content ??
      responseAny.candidates?.[0]?.output ?? JSON.stringify(response);

    return NextResponse.json({ text });
  } catch (error) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch AI response' }, { status: 500 });
  }
}
