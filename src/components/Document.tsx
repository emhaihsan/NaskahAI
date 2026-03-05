"use client";

import { useRouter } from "next/navigation";
import { FileText, Download, Trash2 } from "lucide-react";
import byteSize from "byte-size";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { deleteDocument } from "@/actions/deleteDocument";
import { toast } from "sonner";

interface DocumentProps {
  id: string;
  name: string;
  size: number;
  downloadUrl: string;
}

export default function Document({ id, name, size, downloadUrl }: DocumentProps) {
  const router = useRouter();
  const [isDeleting, startTransition] = useTransition();
  const { hasActiveMembership } = useSubscription();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();

    const confirmed = window.confirm(
      "Apakah Anda yakin ingin menghapus dokumen ini? Tindakan ini tidak dapat dibatalkan."
    );
    if (!confirmed) return;

    startTransition(async () => {
      try {
        await deleteDocument(id);
        toast.success("Dokumen berhasil dihapus");
        router.refresh();
      } catch (error) {
        console.error("Error deleting document:", error);
        toast.error("Gagal menghapus dokumen");
      }
    });
  };

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

      <div className="flex items-center gap-1">
        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
        >
          <Download className="h-4 w-4" />
        </a>

        <Button
          variant="outline"
          size="icon"
          disabled={isDeleting || !hasActiveMembership}
          onClick={handleDelete}
          className="h-9 w-9 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 text-slate-400 hover:text-red-600 hover:border-red-200 dark:hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
          title={hasActiveMembership ? "Hapus dokumen" : "Fitur Pro"}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
