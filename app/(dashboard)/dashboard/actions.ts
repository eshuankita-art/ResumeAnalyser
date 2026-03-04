"use server";

import { put } from "@vercel/blob";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import {
  insertResume,
  getResumeByIdForUser,
  updateResumeAnalysis
} from "@/lib/db";
import { extractTextFromPdf } from "@/lib/pdf";
import { analyzeResumeText } from "@/lib/ai";
import { checkAnalyzeRateLimit } from "@/lib/rate-limit";

const uploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine(file => file.type === "application/pdf", {
      message: "Only PDF files are allowed"
    })
    .refine(file => file.size <= 5 * 1024 * 1024, {
      message: "File must be 5MB or smaller"
    })
});

export type UploadResult =
  | { success: true; resumeId: string }
  | { success: false; error: string };

export async function uploadResumeAction(
  _prevState: UploadResult | null,
  formData: FormData
): Promise<UploadResult> {
  try {
    const user = await requireUser();
    const file = formData.get("file");
    const parsed = uploadSchema.safeParse({ file });
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors[0]?.message ?? "Invalid file"
      };
    }

    const pdfFile = parsed.data.file;
    const blobPath = `resumes/${user.id}/${Date.now()}-${pdfFile.name}`;

    // Upload the File directly to Vercel Blob
    const { url } = await put(blobPath, pdfFile, {
      access: "public",
    });

    // Read the file buffer for PDF text extraction
    const arrayBuffer = await pdfFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const parsedText = await extractTextFromPdf(buffer);

    const resume = await insertResume({
      userId: user.id,
      fileUrl: url,
      parsedText
    });

    return { success: true, resumeId: resume.id };
  } catch (error) {
    console.error("uploadResumeAction error", error);
    const message =
      process.env.NODE_ENV === "development" && error instanceof Error
        ? error.message
        : "Failed to upload and process resume";

    return {
      success: false,
      error: message
    };
  }
}

const analyzeSchema = z.object({
  resumeId: z.string().uuid()
});

export type AnalyzeResult =
  | { success: true; resumeId: string }
  | { success: false; error: string };

export async function analyzeResumeAction(
  _prevState: AnalyzeResult | null,
  formData: FormData
): Promise<AnalyzeResult> {
  try {
    const user = await requireUser();
    if (!checkAnalyzeRateLimit(user.id)) {
      return {
        success: false,
        error: "You have reached the hourly analysis limit. Please try again later."
      };
    }
    const resumeId = formData.get("resumeId");
    const parsed = analyzeSchema.safeParse({ resumeId });
    if (!parsed.success) {
      return {
        success: false,
        error: "Invalid resume"
      };
    }

    const resume = await getResumeByIdForUser(
      parsed.data.resumeId,
      user.id
    );
    if (!resume) {
      return {
        success: false,
        error: "Resume not found"
      };
    }

    const analysis = await analyzeResumeText(resume.parsed_text);

    await updateResumeAnalysis({
      resumeId: resume.id,
      userId: user.id,
      aiScore: analysis.score,
      aiFeedback: analysis
    });

    return { success: true, resumeId: resume.id };
  } catch {
    return {
      success: false,
      error: "Failed to analyze resume. Please try again."
    };
  }
}
