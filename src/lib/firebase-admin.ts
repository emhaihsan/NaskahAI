import * as admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

function initFirebaseAdmin() {
  if (admin.apps.length) {
    return admin.app();
  }

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

function getAdminApp() {
  return initFirebaseAdmin();
}

const adminDb = new Proxy({} as FirebaseFirestore.Firestore, {
  get(_target, prop) {
    const db = getFirestore(getAdminApp());
    return (db as any)[prop];
  },
});

const adminStorage = new Proxy({} as admin.storage.Storage, {
  get(_target, prop) {
    const storage = getStorage(getAdminApp());
    return (storage as any)[prop];
  },
});

export { adminDb, adminStorage };
export { admin };
