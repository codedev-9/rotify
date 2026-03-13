let redirect_uri = "https://rotify.xyz/api/callback"
import admin from "firebase-admin";
import { lessThan } from "firebase/firestore/pipelines";
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    })
  });
}
const db = admin.firestore();
export default async function handler(req, res) {
  if (req.method === "GET") {
    if (!req.query.user_id) {
      return res.status(200).json({ message: "missing uuid" })
    }
    const uuid = req.query.user_id
    const bool = (await db.collection("users").doc(uuid).get()).exists
    return res.json({ bool })
  }
}