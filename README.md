# SponsorBlock Lookup
WebWorker to return youtube link with videoID, requiredSegment and startTime given [SponsorBlock](https://sponsor.ajay.app) segmentUUID

```
https://sb.mchang.xyz/:UUID?api=false
https://sb.mchang.xyz/:UUID/:option?api=false
https://sb.mchang.xyz/:videoID/:UUID/?:time/?api=false
```
`UUID`: 64/65 character UUID of the SponsorBlock segment  
`videoID`: 11 character youtube videoID  
`time`: time in seconds of the segment (optional)  

`option`:
 - `video` - redirects to youtube video
 - `info` - redirects to the /segementinfo api endpoints
 - `db` - redirects to sb.ltn.fi uuid page
api: if truthy, return json instead of redirect

API is licenced under CC BY-NC-SA 4.0 https://sponsor.ajay.app