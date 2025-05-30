const axios = require('axios');
const yts = require('yt-search');
const { createDecipheriv } = require('crypto');
const cheerio = require('cheerio');
const formData = require('form-data');
const { lookup } = require('mime-types');

const extractVideoId = (url) => {
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|v\/|embed\/|user\/[^\/\n\s]+\/)?(?:watch\?v=|v%3D|embed%2F|video%2F)?|youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/|youtube\.com\/playlist\?list=)([a-zA-Z0-9_-]{11})/;
  const result = url.match(regex);
  return result ? result[1] : null;
};

const audioQualities = [32, 64, 96, 128, 160, 192, 256, 320];
const videoQualities = [144, 240, 360, 480, 720, 1080, 1440];

const decryptInfo = (encoded) => {
  const secret = 'C5D58EF67A7584E4A29F6C35BBC4EB12';
  const buffer = Buffer.from(encoded, 'base64');
  const iv = buffer.slice(0, 16);
  const encrypted = buffer.slice(16);
  const key = Buffer.from(secret, 'hex');

  const decipher = createDecipheriv('aes-128-cbc', key, iv);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return JSON.parse(decrypted.toString());
};

const fetchDownload = async (url, quality, type) => {
  try {
    const { data: cdnData } = await axios.get('https://media.savetube.me/api/random-cdn');
    const cdnUrl = `https://${cdnData.cdn}`;

    const { data: infoEnc } = await axios.post(`${cdnUrl}/v2/info`, { url }, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Android)',
        'Referer': 'https://yt.savetube.me/1kejjj1?id=362796039'
      }
    });

    const info = decryptInfo(infoEnc.data);

    const { data: downloadRes } = await axios.post(`${cdnUrl}/download`, {
      downloadType: type,
      quality: String(quality),
      key: info.key
    }, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Android)',
        'Referer': 'https://yt.savetube.me/start-download?from=1kejjj1%3Fid%3D362796039'
      }
    });

    let size = null;
    try {
      const { headers } = await axios.head(downloadRes.data.downloadUrl);
      size = headers['content-length'] ? Number(headers['content-length']) : null;
    } catch (e) {
      console.warn('Gagal mengambil ukuran file:', e.message);
    }

    return {
      status: true,
      url: downloadRes.data.downloadUrl,
      quality: `${quality}${type === 'audio' ? 'kbps' : 'p'}`,
      availableQuality: type === 'audio' ? audioQualities : videoQualities,
      size,
      filename: `${info.title} (${quality}${type === 'audio' ? 'kbps).mp3' : 'p).mp4'}`
    };

  } catch (err) {
    console.error('Download error:', err.message);
    return { status: false, message: 'Download gagal' };
  }
};

const ytmp3 = async (link, quality = 128) => {
  const id = extractVideoId(link);
  if (!id) return { status: false, message: 'URL YouTube tidak valid' };

  const finalQuality = audioQualities.includes(+quality) ? +quality : 128;
  const videoUrl = `https://youtube.com/watch?v=${id}`;

  try {
    const info = await yts(videoUrl);
    const result = await fetchDownload(videoUrl, finalQuality, 'audio');
    return {
      status: true,
      creator: 'hydra_scraper',
      metadata: info.all[0],
      download: result
    };
  } catch (e) {
    return { status: false, message: e.message };
  }
};

const ytmp4 = async (link, quality = 360) => {
  if (!link.includes('youtube.com') && !link.includes('youtu.be')) {
    return { status: false, message: 'URL YouTube tidak valid' };
  }

  try {
    const info = await yts(link);
    const videoUrl = await axios.get(`https://api.ryzumi.vip/api/downloader/ytmp4?url=${link}&quality=${quality}`);
    
    return {
      status: true,
      creator: 'hydra_scraper',
      metadata: info.all[0],
      download: {
        url: videoUrl.data.url,
        quality: quality,
        filename: `${videoUrl.data.title} (${quality}p).mp4`,
      },
    };
  } catch (e) {
    return { status: false, message: e.message };
  }
};

const transcript = async (url) => {
  try {
    let res = await axios.get('https://yts.kooska.xyz/', {
      params: { url: url },
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36',
        'Referer': 'https://kooska.xyz/'
      }
    }).then(i=>i.data)
    return {
      status: true,
      creator: "hydra_scraper",
      video_id: res.video_id,
      summarize: res.ai_response,
      transcript: res.transcript
    }
  } catch(e) {
    return {
      status: false,
      msg: `Gagal mendapatkan respon, dengan pesan: ${e.message}`
    }
  }
}

const playmp3 = async (query, quality = 128) => {
  try {
    const searchResult = await search(query);
    if (!searchResult.status || !searchResult.results.length)
      return { status: false, message: 'Video tidak ditemukan' };

    const results = [];
    for (let video of searchResult.results.slice(0, 5)) {
      const downloadInfo = await fetchDownload(video.url, quality, 'audio');
      results.push({
        title: video.title,
        author: video.author.name,
        duration: video.timestamp,
        url: video.url,
        thumbnail: video.thumbnail,
        download: downloadInfo
      });
    }

    return {
      status: true,
      creator: 'hydra_scraper',
      type: 'audio',
      results
    };
  } catch (err) {
    return { status: false, message: err.message };
  }
};

const playmp4 = async (query, quality = 360) => {
  try {
    const searchResult = await search(query);
    if (!searchResult.status || !searchResult.results.length)
      return { status: false, message: 'Video tidak ditemukan' };

    const results = [];
    for (let video of searchResult.results.slice(0, 5)) {
      const downloadInfo = await fetchDownload(video.url, quality, 'video');
      results.push({
        title: video.title,
        author: video.author.name,
        duration: video.timestamp,
        url: video.url,
        thumbnail: video.thumbnail,
        download: downloadInfo
      });
    }

    return {
      status: true,
      creator: 'hydra_scraper',
      type: 'video',
      results
    };
  } catch (err) {
    return { status: false, message: err.message };
  }
};


const ttdl = async (url) => {
    let retries = 0;
    let maxRetries = 10;
    let retryDelay = 4000;

    while (retries < maxRetries) {
        try {
            const res = await axios(`https://tikwm.com/api/?url=${url}`);
            const data = res.data?.data;

            if (!data) throw new Error(res.data?.msg || 'Invalid API response');

            const isPhotoMode = Array.isArray(data.images);

            return {
                status: true,
                creator: "hydra_scraper",
                type: isPhotoMode ? "photo" : "video",
                title: data.title,
                author: {
                    username: data.author?.unique_id,
                    nickname: data.author?.nickname,
                    avatar: data.author?.avatar
                },
                ...(isPhotoMode
                    ? {
                        images: data.images,
                        imageCount: data.images.length
                    }
                    : {
                        duration: data.duration,
                        video_no_watermark: data.play,
                        video_watermark: data.wmplay,
                        music_url: data.music,
                        music_title: data.music_info?.title,
                        music_play: data.music_info?.play,
                        size: data.size,
                        wm_size: data.wm_size,
                    })
            };

        } catch (error) {
            retries++;
            if (retries >= maxRetries) {
                return {
                    status: false,
                    message: `Failed after ${maxRetries} attempts: ${error.message}`
                };
            }
            await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
    }
};

const pindl = async (url) => {
    try {
        let a = await axios.get(url, {
            headers: {
                'User-Agent': "Mozilla/5.0 (Linux; Android 12; SAMSUNG SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/17.0 Chrome/96.0.4664.104 Mobile Safari/537.36",
                'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
            }
        });

        let $ = cheerio.load(a.data);
        let x = $('script[data-test-id="leaf-snippet"]').text();
        let y = $('script[data-test-id="video-snippet"]').text();

        let g = {
            status: true,
            creator: "hydra_scraper",
            isVideo: !!y,
            info: JSON.parse(x),
            image: JSON.parse(x).image,
            video: y ? JSON.parse(y).contentUrl : ''
        };

        return g;
    } catch (e) {
        return {
            status: false,
            mess: "failed download"
        };
    }
};

const igdl = async (url) => {
    try {
        let result = {
            status: true,
            creator: "hydra_scraper",
            media: []
        }
        const {
            data
        } = await axios(`https://www.y2mate.com/mates/analyzeV2/ajax`, {
            method: "post",
            data: {
                k_query: url,
                k_page: "Instagram",
                hl: "id",
                q_auto: 0
            },
            headers: {
                "content-type": "application/x-www-form-urlencoded",
                "user-agent": "PostmanRuntime/7.32.2"
            }
        })
        await data.links.video.map((video) => result.media.push(video.url))
        return result
    } catch (err) {
        const result = {
            status: false,
            message: `Media not found`
        }
        return result
    }
}

const mfdl = async (url) => {
  try {
    const res = await fetch(`https://rianofc-bypass.hf.space/scrape?url=${encodeURIComponent(url)}`);
    const html = await res.json();
    const $ = cheerio.load(html.html);

    const result = {
      filename: $('.dl-info').find('.intro .filename').text().trim(),
      type: $('.dl-btn-label').find('.filetype > span').text().trim(),
      size: $('.details li:contains("File size:") span').text().trim(),
      uploaded: $('.details li:contains("Uploaded:") span').text().trim(),
      ext: /\.(.*?)/.exec($('.dl-info').find('.filetype > span').eq(1).text())?.[1]?.trim() || 'bin',
      download: $('.input').attr('href')
    };
    result.mimetype = lookup(result.ext.toLowerCase()) || 'application/octet-stream';

    return {
      status: true,
      creator: 'hydra_scraper',
      result
    };
  } catch (err) {
    return {
      status: false,
      message: err.message
    };
  }
}

module.exports = {
  ttdl,
  playmp3,
  playmp4,
  ytmp3,
  ytmp4,
  transcript,
  pindl,
  igdl,
  mfdl
};
