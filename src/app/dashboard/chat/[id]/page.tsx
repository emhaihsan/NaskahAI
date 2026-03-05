"use client";

import { Send, User, Bot, Loader2, FileText, ArrowLeft, PanelLeftClose, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Markdown from "markdown-to-jsx";
import { useCallback, useEffect, useRef, useState, FormEvent } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { PdfViewer } from "@/components/pdf/PdfViewer";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface DocumentInfo {
  id: string;
  name: string;
  url: string;
}

export default function ChatPage() {
  const { id } = useParams();
  const documentId = id as string;
  const { user } = useUser();
  const router = useRouter();
  const bottomOfChatRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documentInfo, setDocumentInfo] = useState<DocumentInfo | null>(null);
  const [showPdf, setShowPdf] = useState(true);

  // Fetch document info
  useEffect(() => {
    async function fetchDocument() {
      try {
        const res = await fetch(`/api/documents/${documentId}`);
        if (res.ok) {
          const data = await res.json();
          setDocumentInfo(data.document);
        }
      } catch (err) {
        console.error("Error fetching document info:", err);
      }
    }
    fetchDocument();
  }, [documentId]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomOfChatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!input.trim() || isLoading) return;

      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: input.trim(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((m) => ({
              role: m.role,
              content: m.content,
            })),
            documentId,
          }),
        });

        if (response.status === 403) {
          const data = await response.json();
          toast.error(data.message || "Batas pesan tercapai", {
            action: {
              label: "Upgrade",
              onClick: () => router.push("/dashboard/upgrade"),
            },
          });
          return;
        }

        if (!response.ok) {
          throw new Error(await response.text());
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error("No response stream available");
        }

        const assistantMessageId = (Date.now() + 1).toString();
        setMessages((prev) => [
          ...prev,
          { id: assistantMessageId, role: "assistant", content: "" },
        ]);

        let done = false;
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMessageId
                  ? { ...m, content: m.content + chunk }
                  : m
              )
            );
          }
        }
      } catch (err) {
        console.error("Chat error:", err);
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, messages, documentId]
  );

  return (
    <div className="flex h-screen flex-col bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b bg-white px-4 shadow-sm dark:bg-slate-900 sm:px-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
              <FileText className="h-3.5 w-3.5" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">
                {documentInfo?.name || "Chat dengan Dokumen"}
              </h1>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hidden md:flex"
          onClick={() => setShowPdf(!showPdf)}
          title={showPdf ? "Hide PDF" : "Show PDF"}
        >
          {showPdf ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
        </Button>
      </header>

      {/* Main Content: PDF Viewer + Chat */}
      <div className="flex flex-1 overflow-hidden">
        {/* PDF Viewer - Left Panel */}
        {showPdf && documentInfo?.url && (
          <div className="hidden md:flex w-1/2 border-r dark:border-slate-800">
            <div className="flex-1">
              <PdfViewer url={documentInfo.url} />
            </div>
          </div>
        )}

        {/* Chat Area - Right Panel */}
        <div className="flex flex-1 flex-col overflow-hidden bg-white dark:bg-slate-900/50">
          <ScrollArea className="flex-1 p-4 sm:p-6">
            <div className="mx-auto flex max-w-3xl flex-col gap-6 pb-20">
              {/* Welcome message */}
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                    <Bot className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">
                    Tanyakan apapun tentang dokumen ini
                  </h2>
                  <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">
                    Dokumen sudah diproses. Ajukan pertanyaan dan AI akan menemukan jawabannya dari isi dokumen.
                  </p>
                </div>
              )}

              {/* Messages */}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex w-full gap-4 ${
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <Avatar className="h-8 w-8 shrink-0 border border-slate-200 dark:border-slate-800">
                    {message.role === "user" ? (
                      <>
                        <AvatarImage src={user?.imageUrl} />
                        <AvatarFallback className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-indigo-600 text-white">
                        <Bot className="h-4 w-4" />
                      </div>
                    )}
                  </Avatar>

                  <div
                    className={`flex max-w-[80%] flex-col gap-1 ${
                      message.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {message.role === "user" ? "You" : "NaskahAI"}
                    </div>
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm ${
                        message.role === "user"
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-200"
                      }`}
                    >
                      {message.role === "user" ? (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      ) : (
                        <div className="prose prose-sm dark:prose-invert max-w-none break-words">
                          <Markdown>{message.content || " "}</Markdown>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && messages.length > 0 && messages[messages.length - 1].role === "user" && (
                <div className="flex w-full flex-row gap-4">
                  <Avatar className="h-8 w-8 shrink-0 border border-slate-200 dark:border-slate-800">
                    <div className="flex h-full w-full items-center justify-center bg-indigo-600 text-white">
                      <Bot className="h-4 w-4" />
                    </div>
                  </Avatar>
                  <div className="flex max-w-[80%] flex-col items-start gap-1">
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400">NaskahAI</div>
                    <div className="flex items-center rounded-2xl bg-slate-100 px-4 py-3 dark:bg-slate-800">
                      <Loader2 className="h-4 w-4 animate-spin text-indigo-600 dark:text-indigo-400" />
                      <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error state */}
              {error && (
                <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  <p className="font-semibold">Something went wrong</p>
                  <p className="mt-1">{error}</p>
                </div>
              )}

              {/* Scroll anchor */}
              <div ref={bottomOfChatRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t bg-white p-4 dark:bg-slate-900 dark:border-slate-800 sm:p-6">
            <form
              onSubmit={handleSubmit}
              className="mx-auto flex max-w-3xl items-end gap-2"
            >
              <div className="relative flex-1">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Tanyakan sesuatu tentang dokumen..."
                  className="pr-12 py-6 rounded-full bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 dark:bg-slate-800 dark:border-slate-700"
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !input.trim()}
                className="h-12 w-12 shrink-0 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
                <span className="sr-only">Send</span>
              </Button>
            </form>
            <div className="mx-auto mt-2 max-w-3xl text-center text-xs text-slate-400 dark:text-slate-500">
              AI dapat membuat kesalahan. Periksa kembali informasi penting.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
