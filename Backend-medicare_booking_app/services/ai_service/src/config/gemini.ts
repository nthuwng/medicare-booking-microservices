// src/config/gemini.ts
import { GoogleGenAI } from "@google/genai";

export const MODEL_AI = process.env.GEMINI_MODEL_NAME || "gemini-2.5-flash";

export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
  httpOptions: { apiVersion: "v1" },
});
