"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";

export function PdfUploader() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const { isOverFileLimit, loading: subLoading } = useSubscription();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    if (isOverFileLimit) {
      toast.error("Batas dokumen gratis tercapai. Upgrade ke Pro untuk menambah dokumen.");
      router.push("/dashboard/upgrade");
      return;
    }
    
    const file = acceptedFiles[0];
    
    // Check if it's a PDF
    if (file.type !== "application/pdf") {
      setUploadStatus("error");
      setErrorMessage("Please upload a PDF file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setUploadStatus("error");
      setErrorMessage("File size exceeds 10MB limit");
      return;
    }

    setIsUploading(true);
    setUploadStatus("uploading");
    
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload file");
      }

      const data = await response.json();
      
      setUploadStatus("success");
      
      // Redirect to the chat page for this document
      setTimeout(() => {
        router.push(`/dashboard/chat/${data.document.id}`);
      }, 1500);

    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  }, [router]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-200 ease-in-out",
        isDragActive
          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20"
          : "border-slate-300 bg-slate-50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-800",
        isUploading && "opacity-50 cursor-not-allowed pointer-events-none"
      )}
    >
      <input {...getInputProps()} />
      
      {uploadStatus === "uploading" ? (
        <div className="flex flex-col items-center justify-center text-indigo-600 dark:text-indigo-400">
          <Loader2 className="h-10 w-10 animate-spin mb-4" />
          <p className="text-sm font-medium">Uploading and processing your document...</p>
          <p className="text-xs text-slate-500 mt-2">This may take a minute or two</p>
        </div>
      ) : uploadStatus === "success" ? (
        <div className="flex flex-col items-center justify-center text-green-600 dark:text-green-400">
          <CheckCircle2 className="h-12 w-12 mb-4" />
          <p className="text-base font-medium">Document ready!</p>
          <p className="text-sm text-slate-500 mt-1">Redirecting to chat...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 mb-4">
            <Upload className={cn(
              "h-8 w-8 text-indigo-600 dark:text-indigo-400 transition-transform duration-200",
              isDragActive ? "-translate-y-1" : ""
            )} />
          </div>
          <p className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
            {isDragActive ? "Drop your PDF here" : "Click to upload or drag and drop"}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
            PDF files up to 10MB are supported
          </p>
          {uploadStatus === "error" && (
            <div className="mt-4 flex items-center text-red-500 text-sm">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errorMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
