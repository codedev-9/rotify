export default async function handler(req, res) {
  const url = req.query.url
  if (!url) return res.status(400).send("Missing URL")

  try {
    const img = await fetch(url)
    const buffer = await img.arrayBuffer()

    res.setHeader("Content-Type", img.headers.get("content-type"))
    res.send(Buffer.from(buffer))
  } catch (err) {
    res.status(500).send("Failed to fetch image")
  }
}
