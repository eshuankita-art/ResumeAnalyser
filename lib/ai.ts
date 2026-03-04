import OpenAI from "openai";
import { z } from "zod";
import { serverEnv } from "@/lib/env";

const ResumeAnalysisSchema = z.object({
  skills: z.array(z.string()),
  missing_skills: z.array(z.string()),
  score: z.number().min(0).max(100),
  suggestions: z.array(z.string()),
  ats_feedback: z.string()
});

export type ResumeAnalysis = z.infer<typeof ResumeAnalysisSchema>;

const client = new OpenAI({
  apiKey: serverEnv.OPENAI_API_KEY ?? ""
});

export async function analyzeResumeText(
  parsedText: string
): Promise<ResumeAnalysis> {
  const trimmed = parsedText.slice(0, 8000);

  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are an expert career coach and ATS specialist. Analyze resumes and respond with STRICT JSON only."
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text:
              "Analyze the following resume text. Extract skills, identify missing industry-relevant skills, score the resume from 0 to 100, " +
              "provide improvement suggestions, and give ATS compatibility feedback. Return a JSON object with the shape:\n" +
              "{ \"skills\": string[], \"missing_skills\": string[], \"score\": number (0-100), \"suggestions\": string[], \"ats_feedback\": string }.\n" +
              "Resume text:\n" +
              trimmed
          }
        ]
      }
    ]
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("AI response was empty");
  }

  let json: unknown;
  try {
    json = JSON.parse(content);
  } catch {
    throw new Error("AI response was not valid JSON");
  }

  return ResumeAnalysisSchema.parse(json);
}

