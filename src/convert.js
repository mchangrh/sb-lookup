// consts
const apiURL = "https://sponsor.ajay.app/api/segmentInfo"
const uuidRegex = new RegExp(/^[a-f0-9]{64,65}$/)
const videoRegex = new RegExp(/^[a-zA-Z0-9_-]{11}$/)

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

function createLink(videoID, UUID, time) {
  const startTime = Number(time) - 2
  const timeParam = startTime > 0 ? `&t=${Math.floor(startTime)}s` : ""
  return `https://www.youtube.com/watch?v=${videoID}${timeParam}#requiredSegment=${UUID}`
}

const getDeArrowData = (videoID) =>
  fetch(`https://sponsor.ajay.app/api/branding?videoID=${videoID}`)
  .then(res => res.json())

const getYtData = (videoID) =>
  fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoID}&format=json`)
  .then(res => res.json())

async function getDeArrow (videoID) {
  const data = await getDeArrowData(videoID)
  const ytData = await getYtData(videoID)
  const timestamp = data.thumbnails?.[0]?.timestamp
  const thumbnail = timestamp
    ? `https://dearrow-thumb.ajay.app/api/v1/getThumbnail?videoID=${videoID}&time=${timestamp}`
    : `https://i.ytimg.com/vi/${videoID}/maxresdefault.jpg`
  const title = data.titles?.[0]?.title ?? ytData.title
  return { title, thumbnail, ytData }
}

async function generateDeArrowHTML (videoID) {
  const { thumbnail } = await getDeArrow(videoID)
  const result = `<html><head>
<meta name="theme-color" content="#1213bd">
<link rel="alternate" type="application/json+oembed" href="https://sb.mchang.xyz/oembed/${videoID}">
<meta name="twitter:image" content="${thumbnail}">
<meta name="twitter:card" content="player">
<meta name="twitter:player" content="https://www.youtube.com/embed/${videoID}">
<meta name="twitter:player:width" content="1280">
<meta name="twitter:player:height" content="720">
<meta http-equiv="refresh" content="0; url=https://www.youtube.com/watch?v=${videoID}" />
</head>
</html>`
  return new Response(result, { headers: { "content-type": "text/html" } })
}

async function handleRequest(request) {
  const { pathname, searchParams } = new URL(request.url)
  const pathArr = pathname.split("/").filter(x => x)
  let newURL
  const length = pathArr.length
  if (length === 0) return redirect("https://github.com/mchangrh/sb-lookup")
  else if (length === 1) {
    const UUID = pathArr[0]
    if (!UUID.match(uuidRegex)) {
      if ((UUID.length === 11) && UUID.match(videoRegex))
        return generateDeArrowHTML(UUID)
      return handleInvalidUUID(UUID)
    }
    const data = await fetchData(UUID)
    if (!data) return new Response(null, { status: 404 })
    const { videoID, startTime } = data[0]
    newURL = createLink(videoID, UUID, startTime)
  } else if (length === 2 && pathArr[0] == "oembed") {
    const videoID = pathArr[1]
    // get deArrow data
    const { title, thumbnail, ytData } = await getDeArrow(videoID)
    const data = {
      ...ytData,
      title,
      thumbnail_url: thumbnail,
      provider_name: "DeArrow",
      provider_url: "https://github.com/ajayyy/DeArrow",
    }
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    })
  } else if (length === 2 && pathArr[0].match(videoRegex)) {
    // /videoID/UUID short link
    const [videoID, UUID] = pathArr
    newURL = createLink(videoID, UUID, 0)
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
  } else if (length === 3 && pathArr[0].match(videoRegex)) {
    // /videoID/UUID/time short link
    const [videoID, UUID, time] = pathArr
    newURL = createLink(videoID, UUID, time)
  } else {
    return new Response("invalid path", { status: 400 })
  }
  const api = searchParams.get('api')
  return (api) ? new Response(newURL) : redirect(newURL)
}