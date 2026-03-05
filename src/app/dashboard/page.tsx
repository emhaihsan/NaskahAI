"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { FileText, Plus, Search, Upload, Loader2, Frown, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Document from "@/components/Document";
import { useSubscription } from "@/hooks/useSubscription";

interface DocumentData {
  id: string;
  name: string;
  size: number;
  url: string;
  createdAt: string | null;
}

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { hasActiveMembership, isOverFileLimit } = useSubscription();

  const fetchDocuments = useCallback(async () => {
    try {
      setIsLoadingDocs(true);
      const res = await fetch("/api/documents");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setIsLoadingDocs(false);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      fetchDocuments();
    }
  }, [isLoaded, fetchDocuments]);

  const filteredDocuments = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isLoaded) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Dashboard Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <FileText size={18} />
              </div>
              <span className="hidden sm:inline-block text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Naskah<span className="text-indigo-600 dark:text-indigo-400">AI</span>
              </span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <UserButton />
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Welcome back, {user?.firstName || 'User'}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Manage your documents and start chatting
              </p>
            </div>
            
            <div className="flex gap-3">
              <Link href="/dashboard/upgrade">
                <Button variant="outline" className="w-full sm:w-auto">
                  <Crown className="mr-2 h-4 w-4" />
                  {hasActiveMembership ? "Kelola Langganan" : "Upgrade"}
                </Button>
              </Link>
              <Button
                onClick={() => {
                  if (isOverFileLimit) {
                    router.push("/dashboard/upgrade");
                  } else {
                    router.push("/dashboard/upload");
                  }
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto"
              >
                <Plus className="mr-2 h-4 w-4" />
                Upload PDF
              </Button>
            </div>
          </div>

          <div className="mb-6 flex relative">
            <div className="relative w-full max-w-md">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <Input 
                type="text" 
                placeholder="Search documents..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              />
            </div>
          </div>

          {/* Documents List */}
          {isLoadingDocs ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : filteredDocuments.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Placeholder Document - Add or Upgrade */}
              <div
                onClick={() =>
                  isOverFileLimit
                    ? router.push("/dashboard/upgrade")
                    : router.push("/dashboard/upload")
                }
                className="flex cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-slate-500 transition-all hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:border-indigo-600 dark:hover:bg-indigo-950/20 dark:hover:text-indigo-400 min-h-[76px]"
              >
                {isOverFileLimit ? (
                  <Frown className="h-5 w-5" />
                ) : (
                  <Plus className="h-5 w-5" />
                )}
                <span className="font-semibold">
                  {isOverFileLimit
                    ? "Upgrade untuk menambah dokumen"
                    : "Tambah Dokumen"}
                </span>
              </div>

              {filteredDocuments.map((doc) => (
                <Document
                  key={doc.id}
                  id={doc.id}
                  name={doc.name}
                  size={doc.size}
                  downloadUrl={doc.url}
                />
              ))}
            </div>
          ) : documents.length > 0 && searchQuery ? (
            <div className="mt-8 text-center py-16">
              <p className="text-slate-500 dark:text-slate-400">
                No documents matching &quot;{searchQuery}&quot;
              </p>
            </div>
          ) : (
            <div className="mt-8">
              <Card className="border-dashed border-2 border-slate-200 dark:border-slate-800 bg-transparent shadow-none">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-6">
                    <Upload className="h-10 w-10 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No documents yet</h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6">
                    Upload your first PDF document to start chatting with it using our advanced AI.
                  </p>
                  <Button 
                    onClick={() => router.push("/dashboard/upload")}
                    className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 shadow-sm dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-white dark:border-slate-700"
                  >
                    Select a PDF file
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
