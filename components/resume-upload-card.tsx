"use client";

import { useFormState, useFormStatus } from "react-dom";
import { uploadResumeAction, type UploadResult } from "@/app/(dashboard)/dashboard/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, DragEvent } from "react";
import { toast } from "sonner";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Uploading..." : "Upload PDF"}
    </Button>
  );
}

export function ResumeUploadCard() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [state, formAction] = useFormState<UploadResult | null, FormData>(
    uploadResumeAction,
    null
  );

  if (state?.success) {
    toast.success("Resume uploaded and parsed successfully.");
  } else if (state && !state.success) {
    toast.error(state.error);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
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
        setFileName(file.name);
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
            <span>
              Drag & drop your PDF here, or click to browse
            </span>
            <span className="mt-2 text-xs">
              Max size 5MB. PDF files only.
            </span>
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

