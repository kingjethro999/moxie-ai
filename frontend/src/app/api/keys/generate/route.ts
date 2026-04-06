import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { database } from "@/lib/firebase";
import { ref, set } from "firebase/database";

/**
 * POST /api/keys/generate
 * Generates a new API key for the authenticated user.
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
