import admin from "firebase-admin";
import fetch from "node-fetch";

// Firestore setup
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}
const db = admin.firestore();

export default async function handler(req, res) {
  const user_id = req.body.user_id;
  if (!user_id) return res.status(400).json({ error: "Missing user_id" });

  try {
    // Get user data from Firestore
    const userDoc = await db.collection("users").doc(user_id).get();
    if (!userDoc.exists) return res.status(404).json({ error: "User not found" });

    let { refresh_token, access_token, expires_in } = userDoc.data();
    const now = Date.now();

    // Refresh token only if expired
    if (!access_token || (now + expires_in) >= now) {
      const params = new URLSearchParams();
      params.append("grant_type", "refresh_token");
      params.append("refresh_token", refresh_token);

      const basicAuth = Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString("base64");

      const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) return res.status(500).json({ error: "Failed to refresh token" });

      access_token = tokenData.access_token;
      expires_in = tokenData.expires_in;

      // Update Firestore with new token + expiry
      await db.collection("users").doc(user_id).update({ access_token, expires_in });
    }

    // Call Now Playing
    const nowPlayingRes = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (nowPlayingRes.status === 204) return res.status(200).json({ is_playing: false });

    const data = await nowPlayingRes.json();
    const item = data.item;

    // Return JSON
    res.status(200).json({
      is_playing: data.is_playing,
      track_id: item?.id,
      song: item?.name,
      artist: item?.artists?.map(a => a.name).join(", "),
      album: item?.album?.name,
      art: item?.album?.images?.[0]?.url,
      progress_ms: data.progress_ms,
      duration_ms: item?.duration_ms,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}