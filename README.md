# SponsorBlock Lookup
WebWorker to return youtube link with videoID, requiredSegment and startTime given [SponsorBlock](https://sponsor.ajay.app) segmentUUID

```
https://sb.mchang.xyz/:UUID?api=false
https://sb.mchang.xyz/:videoID/:UUID?api=false

videoID: youTube videoID
UUID: 65 character UUID of the sponsorBlock segment
api: if truthy, return json instead of redirect
```

API is licenced uner CC BY-NC-SA 4.0 https://sponsor.ajay.app