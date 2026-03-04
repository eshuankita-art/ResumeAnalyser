"use server";

import { Buffer } from "buffer";
import { put } from "@vercel/blob";
import { z } from "zod";
import { serverEnv } from "@/lib/env";
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
    // #region agent log
    fetch("http://127.0.0.1:7669/ingest/ed35a363-b5ac-4ce7-a1e6-702928801c4f", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "85d3b0"
      },
      body: JSON.stringify({
        sessionId: "85d3b0",
        runId: "pre-fix",
        hypothesisId: "H_UPLOAD_ENTRY",
        location: "app/(dashboard)/dashboard/actions.ts:32-41",
        message: "uploadResumeAction entry",
        data: {
          hasBlobToken: !!serverEnv.BLOB_READ_WRITE_TOKEN,
          isServer: typeof window === "undefined"
        },
        timestamp: Date.now()
      })
    }).catch(() => {});
    try {
      const fs = await import("node:fs");
      const path = await import("node:path");
      const logLine = JSON.stringify({
        sessionId: "85d3b0",
        runId: "pre-fix",
        hypothesisId: "H_UPLOAD_ENTRY_FS",
        location: "app/(dashboard)/dashboard/actions.ts:32-65",
        message: "uploadResumeAction entry (fs)",
        data: {
          hasBlobToken: !!serverEnv.BLOB_READ_WRITE_TOKEN,
          isServer: typeof window === "undefined"
        },
        timestamp: Date.now()
      });
      const logPath = path.join(process.cwd(), ".cursor", "debug-85d3b0.log");
      fs.appendFileSync(logPath, `${logLine}\n`, { encoding: "utf8" });
    } catch {
      // ignore fs logging errors
    }
    // #endregion

    if (!serverEnv.BLOB_READ_WRITE_TOKEN) {
      return {
        success: false,
        error:
          "File storage is not configured. Please set BLOB_READ_WRITE_TOKEN."
      };
    }

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
    const arrayBuffer = await pdfFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const blobPath = `resumes/${user.id}/${Date.now()}-${pdfFile.name}`;
    // #region agent log
    fetch("http://127.0.0.1:7669/ingest/ed35a363-b5ac-4ce7-a1e6-702928801c4f", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "85d3b0"
      },
      body: JSON.stringify({
        sessionId: "85d3b0",
        runId: "pre-fix",
        hypothesisId: "H_BEFORE_PUT",
        location: "app/(dashboard)/dashboard/actions.ts:59-63",
        message: "Before put() to Vercel Blob",
        data: {
          blobPath,
          bufferLength: buffer.length
        },
        timestamp: Date.now()
      })
    }).catch(() => {});
    // #endregion
    const { url } = await put(blobPath, buffer, {
      access: "public",
    });

    const parsedText = await extractTextFromPdf(buffer);

    const resume = await insertResume({
      userId: user.id,
      fileUrl: url,
      parsedText
    });

    return { success: true, resumeId: resume.id };
  } catch (error) {
    // #region agent log
    fetch("http://127.0.0.1:7669/ingest/ed35a363-b5ac-4ce7-a1e6-702928801c4f", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "85d3b0"
      },
      body: JSON.stringify({
        sessionId: "85d3b0",
        runId: "pre-fix",
        hypothesisId: "H_UPLOAD_ERROR",
        location: "app/(dashboard)/dashboard/actions.ts:117-127",
        message: "uploadResumeAction error",
        data: {
          message: error instanceof Error ? error.message : String(error)
        },
        timestamp: Date.now()
      })
    }).catch(() => {});
    try {
      const fs = await import("node:fs");
      const path = await import("node:path");
      const logLine = JSON.stringify({
        sessionId: "85d3b0",
        runId: "pre-fix",
        hypothesisId: "H_UPLOAD_ERROR_FS",
        location: "app/(dashboard)/dashboard/actions.ts:117-127",
        message: "uploadResumeAction error (fs)",
        data: {
          message: error instanceof Error ? error.message : String(error)
        },
        timestamp: Date.now()
      });
      const logPath = path.join(process.cwd(), ".cursor", "debug-85d3b0.log");
      fs.appendFileSync(logPath, `${logLine}\n`, { encoding: "utf8" });
    } catch {
      // ignore fs logging errors
    }
    // #endregion

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


