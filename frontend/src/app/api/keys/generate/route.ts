import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { database } from "@/lib/firebase";
import { ref, set } from "firebase/database";
import admin from "firebase-admin";

// Initialize Firebase Admin if not already done
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "moxie-ai-d8063",
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://moxie-ai-d8063-default-rtdb.firebaseio.com/",
  });
}

/**
 * POST /api/keys/generate
 * Generates a new API key for the authenticated user.
 */
export async function POST(request: NextRequest) {
  try {
    // Get Firebase auth token from Authorization header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authorization header required" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    
    // Verify the token and get user
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    // 1. Generate a raw key: moxie-XXXX-XXXX-XXXX-XXXX
    const bytes = crypto.randomBytes(16).toString("hex");
    const chunks = bytes.match(/.{1,4}/g);
    const rawKey = `moxie-${chunks?.join("-")}`;

    // 2. Hash the key with SHA-256
    const hashedKey = crypto.createHash("sha256").update(rawKey).digest("hex");

    // 3. Store the hash in Firebase
    await set(ref(database, `api_keys/${hashedKey}`), {
      userId: userId,
      createdAt: Date.now(),
      active: true,
      lastUsed: null,
    });

    // 4. Return the RAW key to the user (ONLY THIS ONCE)
    return NextResponse.json({
      key: rawKey,
      note: "Save this key now. It will not be shown again."
    });
  } catch (error) {
    console.error("Key generation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
