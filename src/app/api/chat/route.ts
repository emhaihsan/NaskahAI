import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getPineconeStore } from "@/lib/langchain";
import OpenAI from "openai";
import { getFirestore } from "firebase-admin/firestore";
import * as admin from "firebase-admin";

export const maxDuration = 60;

const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  } catch (error) {
    console.error("Firebase admin initialization error", error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const { userId } = session;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { messages, documentId } = await req.json();

    if (!documentId) {
      return new NextResponse("Document ID is required", { status: 400 });
    }

    // Verify document belongs to user
    const db = getFirestore();
    const docRef = db.collection("users").doc(userId).collection("documents").doc(documentId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return new NextResponse("Document not found", { status: 404 });
    }

    const documentData = docSnap.data();

    // Get the latest user message
    const lastMessage = messages[messages.length - 1];

    // Retrieve relevant context from Pinecone
    const pineconeStore = await getPineconeStore(documentId);
    const relevantDocs = await pineconeStore.similaritySearch(lastMessage.content, 5);

    const contextText = relevantDocs.map((doc: any) => doc.pageContent).join("\n\n");

    // Construct the system prompt with the context
    const systemPrompt = `You are a helpful AI assistant tasked with answering questions about a PDF document called "${documentData?.name}".

You must answer the user's question based ONLY on the following context extracted from the document.
If the answer cannot be found in the context, you must state that you cannot answer based on the provided document.
Do not invent or hallucinate information.

CONTEXT:
---
${contextText}
---`;

    // Build OpenAI messages array
    const openaiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    // Stream the response using OpenAI SDK directly
    const stream = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: openaiMessages,
      stream: true,
    });

    // Convert the OpenAI stream to a ReadableStream for the response
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            controller.enqueue(encoder.encode(content));
          }
        }
        controller.close();
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });

  } catch (error) {
    console.error("Error in chat API:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
