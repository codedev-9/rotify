const client_id = process.env.SPOTIFY_CLIENT_ID
let redirect_uri = "https://rotify.xyz/api/callback"
const scopes = [
  "user-read-playback-state",
  "user-read-currently-playing",
  "user-read-private"
].join(" ")
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
  let uuid = req.body.user_id
  if (req.method === "POST") {
    // If user is new -> add new datastore doc
    const user_id = req.body.user_id
    if (!req.body.user_id) {
      return res.status(400).json({ message: "missing user_id" })
    }
    const is_user_in_database = await db.collection("users").doc(uuid).get()
    if (!is_user_in_database.exists) {
      //uuid = crypto.randomUUID()
      await db.collection("users").doc(uuid).set({
        access_token: "",
        refresh_token: "",
        expires_in: 0
      })
    }
  }

  if (req.headers.host.startsWith("127.0.0.1")) {
      redirect_uri = "http://127.0.0.1:3000/api/callback"
  }
  const params = new URLSearchParams({
    client_id,
    response_type: "code",
    redirect_uri,
    scope: scopes,
    state: uuid
  })

  res.json({
    auth_url: "https://accounts.spotify.com/authorize?" + params.toString()
  })
}
