import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { userId } = session;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const docSnap = await adminDb
      .collection("users")
      .doc(userId)
      .collection("documents")
      .doc(id)
      .get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const data = docSnap.data();

    return NextResponse.json({
      document: {
        id: data?.id || docSnap.id,
        name: data?.name,
        size: data?.size || 0,
        url: data?.url || "",
        createdAt: data?.createdAt?.toDate?.()?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error("Error fetching document:", error);
    return NextResponse.json(
      { error: "Failed to fetch document" },
      { status: 500 }
    );
  }
}
