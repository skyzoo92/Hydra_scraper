#<h1 align="center">🎬 SCRAPER DOWNLOADER 1.0.2</h1>

<p align="center">
  Scraper downloader easily via simple API.<br>
  <strong>Auto-updated on error fixes</strong> — join our channel for latest info!
</p>

---

## 📢 Stay Connected

📡 **Hydra System Channel**  
Join to get the latest updates, changelogs, and more.

- 🔗 [Join Channel](https://whatsapp.com/channel/0029VadrgqYKbYMHyMERXt0e)  
- 📞 [Contact Admin](https://wa.me/6285173328399)

---

## ⚙️ Installation

Install using npm:

```bash
npm install hydra_ytdl
```

## Usage

```Javascript
const { 
  ttdl,
  search,
  playmp3,
  playmp4,
  ytmp3,
  ytmp4,
  transcript,
  pindl } = require('hydra_scraper');
```

## Quality Available

```Javascript
const audio = [96, 128, 192, 256, 320];
const video = [360, 480, 720, 1080];
```
## Download Youtube Audio (MP3) 🎧

```Javascript
const url = 'https://www.youtube.com/watch?v=YOUR_VIDEO_ID';
const quality = "128";

ytmp3(url, quality)
  .then(result => {
    if (result.status) {
      console.log('Download Link:', result.download);
      console.log('Metadata:', result.metadata);
    } else {
      console.error('Error:', result.result);
    }
  });

// or use default quality (128)
// ytmp3(url)
```

## Download Youtube Video (MP4) 📹

```Javascript
const url = 'https://www.youtube.com/watch?v=YOUR_VIDEO_ID';
const quality = "360";

ytmp4(url, quality)
  .then(result => {
    if (result.status) {
      console.log('Download Link:', result.download);
      console.log('Metadata:', result.metadata);
    } else {
      console.error('Error:', result.result);
    }
  });

// Base Ytmp4 https://github.com/ShirokamiRyzen
// or use default quality (360)
// ytmp4(url)
```

## Search Youtube 🔍
```Javascript
const query = 'your search term';

search(query)
    .then(result => {
        if (result.status) {
            console.log('Search Results:', result.results);
        } else {
            console.error('Error:', result.result);
        }
    });
```
## Tiktok Downloader
```Javascript
const url = 'https://www.tiktok.com/@username/video/1234567890';

ttdl(url)
  .then(result => {
    if (result.status) {
      console.log('Video:', result.data.video);
      console.log('Audio:', result.data.audio);
      console.log('Cover:', result.data.cover);
    } else {
      console.error('Error:', result.message);
    }
  });
```
## Playmp3 & Playmp4
```Javascript
const query = 'Lagu galau';

playmp3(query)
  .then(result => {
    if (result.status) {
      console.log('Download Link:', result.download);
      console.log('Metadata:', result.metadata);
    } else {
      console.error('Error:', result.message);
    }
  });

playmp4(query)
  .then(result => {
    if (result.status) {
      console.log('Download Link:', result.download);
      console.log('Metadata:', result.metadata);
    } else {
      console.error('Error:', result.message);
    }
  });
```

## Pinterest Download
```Javascript
const link = 'https://pin.it/63p8EvKYl';

pindl(link)
  .then(result => {
    if (result.status) {
      if (result.isVideo) {
        console.log('Video URL:', result.video);
      } else {
        console.log('Image URL:', result.image);
      }
      console.log('Info:', result.info);
    } else {
      console.error('Error:', result.mess);
    }
  });
```

[Documentation](https://skyzoo92.github.io/Scraper/)

## 🧑‍💻 Author

**Hydra**
License: [MIT](./LICENSE)

<p align="center"><i>Powered by Hydra System • Fast • Simple • Efficient</i></p>


