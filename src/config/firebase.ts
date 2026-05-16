import admin from "firebase-admin"
import type { ServiceAccount } from "firebase-admin"
import serviceAccount from "./ekmarkServiceAccountKey.json" with { type: "json" }

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as ServiceAccount)
})

export const db = admin.firestore()