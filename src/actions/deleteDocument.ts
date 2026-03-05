"use server";

import { auth } from "@clerk/nextjs/server";
import { adminDb, adminStorage } from "@/lib/firebase-admin";
import { pineconeIndex } from "@/lib/pinecone";
import { revalidatePath } from "next/cache";

export async function deleteDocument(documentId: string) {
  const session = await auth();
  const { userId } = session;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Delete from Firestore
  await adminDb
    .collection("users")
    .doc(userId)
    .collection("documents")
    .doc(documentId)
    .delete();

  // Delete from Firebase Storage
  await adminStorage
    .bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET)
    .file(`users/${userId}/documents/${documentId}.pdf`)
    .delete()
    .catch((err: any) => {
      console.error("Error deleting from storage:", err);
    });

  // Delete Pinecone embeddings for this document namespace
  const index = pineconeIndex;
  const ns = index.namespace(documentId);
  await ns.deleteAll().catch((err: any) => {
    console.error("Error deleting Pinecone namespace:", err);
  });

  // Revalidate dashboard
  revalidatePath("/dashboard");

  return { success: true };
}
