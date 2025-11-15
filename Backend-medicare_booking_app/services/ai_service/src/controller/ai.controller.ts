// src/controller/ai.controller.ts
import { Request, Response } from "express";
import { dispatchByIntent } from "src/services/ai.registry";
import { parseIntent } from "src/validations/ai.intent";
import type { UploadedImage as UImage } from "src/types/ai.runtime";
import { MODEL_AI } from "src/config/gemini";

export const chatController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const file = (req as any).file as UImage | undefined;
    const { prompt = "" } = (req.body || {}) as { prompt?: string };

    // Có ảnh → ép intent image
    if (file) {
      const image: UImage = {
        ...file,
        base64: file.buffer.toString("base64"),
      };

      const result = await dispatchByIntent(
        {
          intent: "recommend_specialty_image",
          args: { symptoms: prompt },
        } as any,
        { image, prompt, modelImage: MODEL_AI }
      );

      if ((result as any)?.error) {
        res.status(400).json({
          success: false,
          intent: "recommend_specialty_image",
          error: (result as any).error,
        });
        return;
      }

      res.json({
        success: true,
        intent: "recommend_specialty_image",
        model: MODEL_AI,
        text: result?.content ?? "",
        data: result?.data ?? null,
      });
      return;
    }

    // TEXT → intent → handler
    if (!prompt) {
      res.status(400).json({ success: false, error: "message is required" });
      return;
    }

    const parsed = await parseIntent(prompt);
    const result = await dispatchByIntent(parsed, { prompt });

    res.json({
      success: true,
      intent: (result as any)?.intent ?? parsed.intent,
      model: MODEL_AI,
      text: result?.content ?? "",
      data: result?.data ?? null,
    });
    return;
  } catch (e: any) {
    // Log chi tiết
    console.error("[AI] chatController error:", {
      message: e?.message,
      code: e?.code,
      status: e?.status,
      details: e?.response?.data ?? e?.response ?? e,
    });

    const msg = e?.message || "";

    if (msg.includes("The model is overloaded")) {
      res.status(503).json({
        success: false,
        error: {
          code: "AI_MODEL_OVERLOADED",
          message:
            "Hệ thống AI của nhà cung cấp đang quá tải, bạn vui lòng thử lại sau ít phút nhé! 🙏",
        },
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: {
        code: "AI_INTERNAL_ERROR",
        message:
          "Xin lỗi, hệ thống AI đang gặp sự cố. Bạn vui lòng thử lại sau hoặc liên hệ bộ phận hỗ trợ.",
      },
    });
    return;
  }
};
