export default async function handler(req, res) {
  // 1. Get a fresh access token
  //const refreshResponse = await fetch("https://rotify1.vercel.app/api/refresh")
  //const refreshData = await refreshResponse.json()

  //const access_token = refreshData.access_token

  //if (!access_token) {
  //  return res.status(500).json({ error: "Failed to refresh access token" })
  //}

  const access_token = process.env.SPOTIFY_ACCESS_TOKEN

  // 2. Call Spotify's Now Playing API
  const nowPlayingResponse = await fetch(
    "https://api.spotify.com/v1/me/player/currently-playing",
    {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    }
  )

  // If nothing is playing
  if (nowPlayingResponse.status === 204) {
    return res.status(200).json({ is_playing: false })
  }

  const data = await nowPlayingResponse.json()

  // 3. Format clean JSON for Roblox
  const item = data.item

  res.status(200).json({
    is_playing: data.is_playing,
    song: item?.name,
    artist: item?.artists?.map(a => a.name).join(", "),
    album: item?.album?.name,
    art: item?.album?.images?.[0]?.url,
    progress_ms: data.progress_ms,
    duration_ms: item?.duration_ms
  })
}
