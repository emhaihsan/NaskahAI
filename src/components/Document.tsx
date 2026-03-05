"use client";

import { useRouter } from "next/navigation";
import { FileText, Download } from "lucide-react";
import byteSize from "byte-size";

interface DocumentProps {
  id: string;
  name: string;
  size: number;
  downloadUrl: string;
}

export default function Document({ id, name, size, downloadUrl }: DocumentProps) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/dashboard/chat/${id}`)}
      className="group flex cursor-pointer items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
        <FileText className="h-6 w-6" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-900 dark:text-white line-clamp-1">
          {name}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {byteSize(size).toString()}
        </p>
      </div>

      <a
        href={downloadUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
      >
        <Download className="h-4 w-4" />
      </a>
    </div>
  );
}
