const client_id = process.env.SPOTIFY_CLIENT_ID
const client_secret = process.env.SPOTIFY_CLIENT_SECRET
let redirect_uri = "https://rotify.xyz/api/callback"
import admin from "firebase-admin";
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
  const code = req.query.code

  if (!code) {
    return res.status(400).json({ error: "Missing code" })
  }
  if (req.headers.host.startsWith("127.0.0.1")) {
      redirect_uri = "http://127.0.0.1:3000/api/callback"
  }


  const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " + Buffer.from(client_id + ":" + client_secret).toString("base64")
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri
    })
  })

  const data = await tokenResponse.json()
 res.setHeader("Content-Type", "text/plain");
 res.send(
  `Access Token: ${data.access_token}\nRefresh Token: ${data.refresh_token}\nExpires in: ${data.expires_in}`
 );

}