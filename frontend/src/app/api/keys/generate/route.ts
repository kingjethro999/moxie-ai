import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { database } from "@/lib/firebase";
import { ref, set } from "firebase/database";
import admin from "firebase-admin";

// Initialize Firebase Admin if not already done
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: "moxie-ai-d8063",
      clientEmail: "firebase-adminsdk-fbsvc@moxie-ai-d8063.iam.gserviceaccount.com",
      privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC4uQgKlqexPYri\n7ZeJz9FptSfvj6TxwaKS7T5p7JMJo5prrHSrhHITZyUEYxxl8X7xLYf4facvYR+8\nSCZ8i6GpMlEY9amWuk0pGC84uRxwOLbtyHlbHQtvWnvy7KWAIPtccSrj/vKPVUA9\n6GN+Ss+MaXXc3r8JLM+QdSiQZCCJ2nnVYvtKP8gtd3euTM4FVrLLhS53vqarY1JE\nOh+SmQ2u+/5txV/59JMzoo4s3K9wTVr8QrJ3jSvM2DXbzbtLe5v24UZCQSsgFqQ0\n+6u5Kz0/eC/fOB/c71OCNGpGl7ayx695GiKCbx6mK8SGX4mJB/LXE3o4JMTrizGC\nAiJFDqZJAgMBAAECggEADqHmlYsjT7aJq8npCvs9sgdN+WuqI9XkOkoFe4fISndN\nlkmoCMWiMTAGlkNBFsCzXuityITwkz/Y7xXSiaNYbBIOq0DbfRN3JQITzIUaT/fo\nIqwSk+F4PEsBPkgZYI3MR4F15a9WeLzmrLi9t912dR+N/O/el1wXuZBURSLPUogL\nviYA8suIlXiY6AhXEFGd6xCIxCMnu44PjyhRHuZ1iuml7jOmhbusmCgZ7mbaURJj\nMEdbtxk6MBK+ZJ7pWuopLZ23T+C+2jB1aiKbbS/JBxau//J/834kkcGeRYk8287V\njWCW7LIi+GMHmE+uf2wu/tfuUizvUFaAkGvSkdYF4QKBgQDozvNHz/NQvvB6trF7\nAxvehfHHybX4XRVyMm+uD9LEApVAjn8f5SwTwnvlhhnTJMJ4i6ApW2Y18tzSOeFC\nNLfjPDe1RwjIMpqkvaWf64TW1ORUbujV7Vp673pzepqfK5NwmHiFXBe+8csUaJxw\nFL7kFEMYGes8aG2h4ZGEbfjvIQKBgQDLH87NP083K8xoZPazrAdY9oL4SQI4n5gE\nahdO1u29m4CbkgKNNjatP9dUO/xHyB1OKtr2N1UYvNXh6pVFZkFu6Cu2PqJEhHIT\nJkozrsUXvPl/k0W4lM+UkedMpgejPZ7HrCMjDNTUQoVqFO8QmPV1Wry/rvNeQAwQ\n6mumFgcaKQKBgE9ff4JUW9iDwOmVsB0Iik/ryusa0nfDBLTSjVEDBBDf8JL6Ak2V\njNmPzT4L4nIibks7D3gKOWbbTn4+TZaM8sT+mt+rQEtBNYhFQFqtqbS1EMPYrHmD\nWv3e+Bi3DFCIQtR4p16Qb2gid+KVaACukgahAd8Nty35TKeMiFhmRiEBAoGAUEiH\nJWqDdcvy48QcGhHBabEtPNMmdJjnrb787WVX3BxNLa/9IDEwVTOpeRqocPqwUofv\nuWdPVBK2+q8MRrzO2fYb6NFCs5Ahwl3c8CaAsgw4FOtxoC35CcDNSedJl4SwcD0i\nOiVFLYwJTU9u2gGK6tJtTdnpSPRJkJoG6ENGlVkCgYEAuYfDhvQGv9HDrLPlNphe\nSp/pxdWhZcSTz73FfE3Vg4CADa5129KMjFPZfcJqrvRAnVZx4oyBpxPuBc4r8O65\nh8086vCV/xIh2Q/8+j4UBXs6oZ70eoa1SsupCfQZX3UmSmMCB1hyQ7/RUTn1N77h\nF9bxnfYVFe8rIg1Sxd8lQb0=\n-----END PRIVATE KEY-----",
    }),
    databaseURL: "https://moxie-ai-d8063-default-rtdb.firebaseio.com/",
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
