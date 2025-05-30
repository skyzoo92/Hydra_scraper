const axios = require('axios');
const cheerio = require('cheerio');

async function githubStalk(user) {
  try {
    const { data } = await axios.get(`https://api.github.com/users/${user}`);

    const hasil = {
      username: data.login,
      name: data.name,
      bio: data.bio,
      id: data.id,
      nodeId: data.node_id,
      profile_pic: data.avatar_url,
      html_url: data.html_url,
      type: data.type,
      admin: data.site_admin,
      company: data.company,
      blog: data.blog,
      location: data.location,
      email: data.email,
      public_repo: data.public_repos,
      public_gists: data.public_gists,
      followers: data.followers,
      following: data.following,
      created_at: data.created_at,
      updated_at: data.updated_at
    };

    return {
      status: true,
      creator: 'hydra_scraper',
      results: hasil
    };
  } catch (err) {
    return {
      status: false,
      message: err.response?.data?.message || 'Pengguna tidak ditemukan atau terjadi kesalahan.'
    };
  }
}

async function tiktokStalk(username) {
  try {
    const response = await axios.get(`https://www.tiktok.com/@${username}?_t=ZS-8tHANz7ieoS&_r=1`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    });

    const html = response.data;
    const $ = cheerio.load(html);
    const scriptData = $('#__UNIVERSAL_DATA_FOR_REHYDRATION__').html();
    const parsedData = JSON.parse(scriptData);
    const userDetail = parsedData.__DEFAULT_SCOPE__?.['webapp.user-detail'];

    if (!userDetail) {
      return {
        status: false,
        message: 'User tidak ditemukan atau data tidak tersedia.'
      };
    }

    const userInfo = userDetail.userInfo?.user;
    const stats = userDetail.userInfo?.stats;

    const hasil = {
      id: userInfo?.id || null,
      username: userInfo?.uniqueId || null,
      nama: userInfo?.nickname || null,
      avatar: userInfo?.avatarLarger || null,
      bio: userInfo?.signature || null,
      region: userInfo?.region || 'Tidak diketahui',
      verifikasi: userInfo?.verified || false,
      totalfollowers: stats?.followerCount || 0,
      totalmengikuti: stats?.followingCount || 0,
      totaldisukai: stats?.heart || 0,
      totalvideo: stats?.videoCount || 0,
      totalteman: stats?.friendCount || 0
    };

    return {
      status: true,
      creator: 'hydra_scraper',
      results: hasil
    };
  } catch (error) {
    return {
      status: false,
      message: error.message || 'Terjadi kesalahan saat mengambil data.'
    };
  }
}

async function ytStalk(teks) {
  try {
    const response = await axios.get(`https://api.ryzumi.vip/api/stalk/youtube?username=${teks}`);

    return {
      status: true,
      creator: "hydra_scraper",
      result: response.data.channelMetadata
    };
  } catch (error) {
    return {
      status: false,
      message: error.message
    };
  }
}

async function genshinStalk(uid) {
  try {
    const res = await axios.get(`https://fastrestapis.fasturl.cloud/stalk/genshin/advanced?uid=${uid}`);
    return {
      status: true,
      creator: "hydra_scraper",
      results: res.data.result
    };
  } catch (e) {
    return {
      status: false,
      message: e.message
    };
  }
}

async function igStalk(user) {
  try {
    const response = await axios.post(
      "https://privatephotoviewer.com/wp-json/instagram-viewer/v1/fetch-profile",
      {
        find: user,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
          "X-Requested-With": "XMLHttpRequest",
        },
      }
    );

    const $ = cheerio.load(response.data.html);

    const profilePicture = $("#profile-insta img").attr("src");
    const nickname = $(".col-md-8 h4").text().trim();
    const username = $(".col-md-8 h5").text().trim();
    const posts = $(".col-md-8 .text-center").eq(0).find("strong").text().trim();
    const followers = $(".col-md-8 .text-center").eq(1).find("strong").text().trim();
    const following = $(".col-md-8 .text-center").eq(2).find("strong").text().trim();
    const bio = $(".col-md-8 p").html()?.replace(/<br\s*\/?>/g, "\n").trim();

    const hasil = {
      profilePicture,
      nickname,
      username,
      posts,
      followers,
      following,
      bio,
    };

    return {
      status: true,
      creator: "hydra_scraper",
      results: hasil,
    };
  } catch (e) {
    console.error("Error in igStalk:", e.message);
    throw e;
  }
}

module.exports = {
    githubStalk,
    tiktokStalk,
    ytStalk,
    genshinStalk,
    igStalk
  }
