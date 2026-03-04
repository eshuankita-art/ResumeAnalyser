"use client";

import { useFormState, useFormStatus } from "react-dom";
import { uploadResumeAction, type UploadResult } from "@/app/(dashboard)/dashboard/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect, DragEvent } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Uploading..." : "Upload PDF"}
    </Button>
  );
}

export function ResumeUploadCard() {
  const router = useRouter();
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [state, formAction] = useFormState<UploadResult | null, FormData>(
    uploadResumeAction,
    null
  );

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    if (state?.success) {
      toast.success("Resume uploaded and parsed successfully.");
      router.refresh();
    } else if (state && !state.success) {
      toast.error(state.error);
    }
  }, [state, router]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setFileName(file.name);
      setFileSize(file.size);
    }
  }

  function handleDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const input = document.getElementById(
        "resume-file"
      ) as HTMLInputElement | null;
      if (input) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setFileName(file.name);
        setFileSize(file.size);
      }
    }
  }

  function handleDragOver(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload your resume</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <label
            htmlFor="resume-file"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-muted-foreground/40 bg-muted/40 px-4 py-10 text-center text-sm text-muted-foreground"
          >
            {fileName ? (
              <>
                <span className="text-sm font-medium text-foreground">
                  {fileName}
                </span>
                {fileSize !== null && (
                  <span className="mt-1 text-xs">
                    {(fileSize / (1024 * 1024)).toFixed(2)} MB • PDF
                  </span>
                )}
                {previewUrl && (
                  <div className="mt-4 h-64 w-full max-w-md overflow-hidden rounded-md border bg-background">
                    <iframe
                      src={previewUrl}
                      className="h-full w-full"
                      title="Resume preview"
                    />
                  </div>
                )}
                <span className="mt-3 text-xs">
                  Click or drop here to change file
                </span>
              </>
            ) : (
              <>
                <span>
                  Drag & drop your PDF here, or click to browse
                </span>
                <span className="mt-2 text-xs">
                  Max size 5MB. PDF files only.
                </span>
              </>
            )}
          </label>
          <input
            id="resume-file"
            name="file"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          {fileName && (
            <p className="text-xs text-muted-foreground">
              Selected file: {fileName}
            </p>
          )}
          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}

