const client_id = process.env.SPOTIFY_CLIENT_ID
const client_secret = process.env.SPOTIFY_CLIENT_SECRET
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
  if (req.method === "POST") {
    const refresh_token = req.body.refresh_token
    const uuid = req.body.user_id
    if (!(await db.collection("users").doc(uuid).get()).exists) { // check if the user doesnt has a UUID
      return res.status(400).send("missing doc")
    }
    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
     method: "POST",
     headers: {
       "Content-Type": "application/x-www-form-urlencoded",
       Authorization:
        " Basic " + Buffer.from(client_id + ":" + client_secret).toString("base64")
     },
     body: new URLSearchParams({
       grant_type: "refresh_token",
       refresh_token
     })
    })
    const data = await tokenResponse.json()
    await db.collection("users").doc(uuid).update({
      access_token: "BQAeBl6Og8MjF04UOVafkrS939Z6yNMNEAOt_1f_kekbkMY6d9YCZk7EfkKagR239nBchDDcRZS3ZfF6CA7TKFaYUa4QU3AOri3siFGrtl_0SzHr7AGEiRyY2dq6QVyczC9FF6r4m-MxGh64ksQ5drdlKg-aHYz3YDfGgZ8NrWvI_UUQ7lp8Vi895YmKUw8CBVsQKOAEKBZLc7C5JYSKBZ17_JE9sS_bbW8PZ9yMXyy-QNHkqtvpzO4mUnC2108SyVN3cSXO"
    })
    res.status(200).json({ success: true })
  }
}
