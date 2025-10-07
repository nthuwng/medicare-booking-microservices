import { Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import {
  handleAIService,
  handleGenerateScopedText,
  handleRecommendSpecialtyFromImage,
} from "src/services/ai.service";

type UploadedImage = { buffer: Buffer; mimetype: string };

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
const model = process.env.GEMINI_IMAGE_MODEL_NAME!;

const AIServiceController = async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body || {};
    if (!prompt) res.status(400).json({ error: "prompt is required" });

    const systemInstruction = await handleGenerateScopedText();

    const result = await handleAIService(systemInstruction, model, prompt);

    if (!result) {
      res.status(400).json({ error: "AI error" });
      return;
    }

    res.json({
      success: true,
      model,
      text: result,
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message || "AI error" });
  }
};

const recommendSpecialtyFromImage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const file = (req as any).file as UploadedImage | undefined;
    const { prompt = "" } = (req.body || {}) as {
      prompt?: string;
      model?: string;
    };

    if (!file) {
      res
        .status(400)
        .json({ error: "image file is required (field name: image)" });
      return;
    }

    const supportedMimeTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
      "image/heic",
      "image/heif",
    ];
    if (!supportedMimeTypes.includes(file.mimetype)) {
      res.status(400).json({ error: "unsupported image type" });
      return;
    }

    const base64 = file.buffer.toString("base64");

    const systemInstruction =
      "You are a triage assistant. Given a patient-provided image of visible symptoms and optional text, recommend the most appropriate medical specialty. " +
      "Respond in strict JSON with keys: specialty (vn), confidence (0-1), reasoning (vn).";

    const userPrompt =
      `Ảnh triệu chứng của bệnh nhân. Thông tin bổ sung: ${
        prompt || "không có"
      }.\n` +
      "Hãy đề xuất chuyên khoa phù hợp nhất bằng tiếng Việt. Chỉ trả về JSON.";

    const result = await handleRecommendSpecialtyFromImage(
      systemInstruction,
      model,
      userPrompt,
      file,
      base64
    );

    if (!result) {
      res.status(400).json({ error: "AI error" });
      return;
    }

    res.json({ success: true, model, text: result });
  } catch (e: any) {
    res.status(500).json({ error: e.message || "AI error" });
  }
};

export { AIServiceController, recommendSpecialtyFromImage };
