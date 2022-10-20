// consts
const apiURL = "https://sponsor.ajay.app/api/segmentInfo"

addEventListener("fetch", event =>
  event.respondWith(
    handleRequest(event.request).catch(
      (err) => new Response(err.stack, { status: 500 })
    )
  )
)

const redirect = (url) => new Response(url, {
  status: 301, headers: { 'Location': url }
});

function handleInvalidUUID(uuid) {
  const customLinks = {
    "abuse": "https://mchangrh.github.io/sb-tools-index/sponsorblock.png",
    "ports": "https://docs.google.com/spreadsheets/d/1vxSx06dPs_X3WCCC0bMztmlxbg_ETzAmp7sL70HFIew/edit",
    "index": "https://github.com/mchangrh/sb-tools-index#readme",
    "flowchart": "https://raw.githubusercontent.com/cole8888/SponsorBlock-Flowchart/main/SB_Flowchart_large.png",
    "status": "https://i.imgur.com/K6UQNMJ.png",
    "id": "https://mchangrh.github.io/sb-idgen/",
  }
  const link = customLinks?.[uuid]
  return link ? redirect(link) : new Response(`Invalid UUID: ${uuid}`, { status: 400 });
}

const fetchData = (UUID) => fetch(`${apiURL}?UUID=${UUID}`)
  .then(res => res.json())
  .catch(err => null)

async function handleRequest(request) {
  const { pathname, searchParams } = new URL(request.url)
  const pathArr = pathname.split("/").filter(x => x)
  let newURL
  const length = pathArr.length
  if (length === 0) return redirect("https://github.com/mchangrh/sb-lookup")
  else if (length === 1) {
    const UUID = pathArr[0]
    if (!UUID.match(/[a-f0-9]{64,65}/)) return handleInvalidUUID(UUID)
    const data = await fetchData(UUID)
    if (!data) return new Response(null, { status: 404 })
    const { videoID, startTime } = data[0]
    const timeParam = startTime > 0 ? `t=${startTime}s` : ""
    newURL = `https://www.youtube.com/watch?v=${videoID}${timeParam}s#requiredSegment=${UUID}`
  } else if (length === 2) {
    const [UUID, option] = pathArr
    // video | db | info
    if (option === "db") {
      newURL = `https://sb.ltn.fi/uuid/${UUID}`
    } else if (option === "info") {
      newURL = `${apiURL}?UUID=${UUID}`
    } else if (option === "video") {
      const data = await fetchData()
      if (!data) return new Response(null, { status: 404 })
      newURL = `https://youtube.com/watch?v=${data[0].videoID}`
    } else {
      return new Response("invalid option, please use db, info, or video", { status: 400 })
    }
  } else {
    return new Response("invalid path", { status: 400 })
  }
  const api = searchParams.get('api')
  return (api) ? new Response(newURL) : redirect(newURL)
}