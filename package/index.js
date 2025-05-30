const { ytmp3, ttdl, igdl, ytmp4, transcript, pindl, mfdl } = require("./api/downloader.js")
const { tiktoks, pinterest, search, GoogleImage } = require("./api/search.js")
const { githubStalk, tiktokStalk, ytStalk, genshinStalk, igStalk } = require("./api/stalking.js")

module.exports = {
  search,
  ytmp3,
  ytmp4,
  transcript,
  pindl,
  tiktoks,
  pinterest,
  githubStalk,
  tiktokStalk,
  ytStalk,
  GoogleImage,
  ttdl,
  igdl,
  genshinStalk,
  mfdl,
  igStalk
}
