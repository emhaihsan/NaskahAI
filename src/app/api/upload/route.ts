import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { getPineconeStore } from "@/lib/langchain";
import { v4 as uuidv4 } from "uuid";
import { getStorage } from "firebase-admin/storage";
import { getFirestore } from "firebase-admin/firestore";
import * as admin from "firebase-admin";

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Replace escaped newlines in the private key
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 1. Upload file to Firebase Storage
    const storage = getStorage();
    const bucket = storage.bucket();
    const fileId = uuidv4();
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const storageRef = bucket.file(`users/${userId}/documents/${fileId}.pdf`);

    await storageRef.save(fileBuffer, {
      metadata: {
        contentType: "application/pdf",
      },
    });

    const downloadUrl = await storageRef.getSignedUrl({
      action: "read",
      expires: "03-01-2500", // Long expiration for demo
    });

    // 2. Process PDF and generate embeddings
    // Create a Blob from the file buffer to load with LangChain
    const blob = new Blob([fileBuffer], { type: "application/pdf" });
    const loader = new PDFLoader(blob);
    const docs = await loader.load();

    // Chunk the text
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    
    const chunkedDocs = await textSplitter.splitDocuments(docs);
    
    // Add metadata to each chunk
    const chunkedDocsWithMetadata = chunkedDocs.map((doc: any) => {
      doc.metadata = {
        ...doc.metadata,
        fileId,
        userId,
        fileName: file.name,
      };
      return doc;
    });

    // Generate and store embeddings in Pinecone
    const pineconeStore = await getPineconeStore(fileId);
    await pineconeStore.addDocuments(chunkedDocsWithMetadata);

    // 3. Save metadata to Firestore
    const db = getFirestore();
    const docData = {
      id: fileId,
      userId,
      name: file.name,
      url: downloadUrl[0],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      size: file.size,
    };

    await db.collection("users").doc(userId).collection("documents").doc(fileId).set(docData);

    return NextResponse.json({ 
      success: true, 
      document: docData 
    });
    
  } catch (error) {
    console.error("Error processing document:", error);
    return NextResponse.json(
      { error: "Failed to process document" },
      { status: 500 }
    );
  }
}
