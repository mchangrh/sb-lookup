// consts
const apiURL = "https://sponsor.ajay.app/api/segmentInfo"

addEventListener("fetch", (event) => {
  event.respondWith(
    handleRequest(event.request).catch(
      (err)=> new Response(err.stack, { status: 500 })
    )
  );
});

const getData = async (UUID) => {
  const res = await fetch(`${apiURL}?UUID=${UUID}`)
  return res.json()
}

const redirect = (url) => new Response(url, {
  status: 301, headers: { 'Location': url }
});

async function handleRequest(request) {
  const { pathname, searchParams } = new URL(request.url)
  const UUID = pathname.substring(1)
  const api = searchParams.get('api')
  const data = await getData(UUID)
  const { videoID, startTime } = data[0]
  const newURL = `https://www.youtube.com/watch?v=${videoID}&t=${Math.max(0, startTime.toFixed(0)-2)}s#requiredSegment=${UUID}`
  return (api) ? new Response(newURL) : redirect(newURL)
}