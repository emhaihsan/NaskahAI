"use client";

import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PdfUploader } from "@/components/pdf/PdfUploader";
import Link from "next/link";

export default function UploadPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <FileText size={18} />
              </div>
              <span className="hidden sm:inline-block text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Naskah<span className="text-indigo-600 dark:text-indigo-400">AI</span>
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Upload Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Upload Dokumen
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Drag dan drop file PDF kamu atau klik untuk memilih file.
            </p>
          </div>

          <PdfUploader />

          <div className="text-center text-xs text-slate-400 dark:text-slate-500">
            File PDF maksimal 10MB. Dokumen akan diproses dan siap untuk di-chat.
          </div>
        </div>
      </main>
    </div>
  );
}
