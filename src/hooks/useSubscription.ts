"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { FREE_LIMIT, PRO_LIMIT } from "@/lib/constants";

export interface SubscriptionState {
  hasActiveMembership: boolean;
  isOverFileLimit: boolean;
  documentsCount: number;
  loading: boolean;
}

export function useSubscription(): SubscriptionState {
  const { user } = useUser();
  const [hasActiveMembership, setHasActiveMembership] = useState(false);
  const [documentsCount, setDocumentsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Listen to user's subscription status
  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, "users", user.id);
    const unsubscribe = onSnapshot(
      userRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setHasActiveMembership(data?.isPro === true);
        } else {
          setHasActiveMembership(false);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error listening to subscription:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Fetch documents count
  useEffect(() => {
    if (!user) return;

    const fetchCount = async () => {
      try {
        const res = await fetch("/api/documents");
        if (res.ok) {
          const data = await res.json();
          setDocumentsCount(data.documents?.length || 0);
        }
      } catch (error) {
        console.error("Error fetching document count:", error);
      }
    };

    fetchCount();
  }, [user]);

  const limit = hasActiveMembership
    ? PRO_LIMIT.maxDocuments
    : FREE_LIMIT.maxDocuments;

  return {
    hasActiveMembership,
    isOverFileLimit: documentsCount >= limit,
    documentsCount,
    loading,
  };
}
