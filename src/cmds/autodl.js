const fs = require("fs"), axios = require("axios");
const { capcut } = require("betabotz-tools");
const getFBInfo = require("@xaviabot/fb-downloader");
const ytdl = require('ytdl-core');
const link = "https://tikwm.com";
let fbvid = __dirname + "/cache/fbvid.mp4",
  pathaudio = __dirname + "/cache/audio.mp3",
  tiktok = __dirname + "/cache/tiktok.mp4",
  v = __dirname + "/cache/capcut.mp4",
  path = __dirname + "/cache/video.mp4";

module.exports = {
  config: {
    name: "autodl",
    description: "auto download YouTube/Facebook/Tiktok",
    usage: "dl <link>",
    cooldown: 5,
    prefix: false,
    role: 0,
  },
  auto: async function ({ api, event, text, reply }) {
    const regexcc = /https:\/\/www\.capcut\.com\/\S+/;
    const matchcc = text.match(regexcc);
    const urlcc = matchcc ? matchcc[0] : null;
    const regexyt = /(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/(watch\?v=|v\/)?[a-zA-Z0-9_-]{11}/;
    const matchyt = text.match(regexyt);
    const urlyt = matchyt ? matchyt[0] : null;
    const regexfb = /https:\/\/www\.facebook\.com\/\S+/;
    const matchfb = text.match(regexfb);
    const urlfb = matchfb ? matchfb[0] : null;
    const regexTt = /https:\/\/vt\.tiktok\.com\/[A-Za-z0-9]+\/?/;
    const matchTt = text.match(regexTt);
    const urlTt = matchTt ? matchTt[0] : null;

    // 𝗔𝘂𝘁𝗼𝗱𝗼𝘄𝗻 𝗧𝗶𝗸𝗧𝗼𝗸
    if (matchTt) {
      try {
        const img = [];
        const tt = (await axios.get(link + '/api?url=' + urlTt + '&web=1&hd=1&count=0')).data;
        const title = tt.data.title || "No title"; // TikTok video title
        if (tt.data.images) {
          for (let i = 0; i < tt.data.images.length; i++) {
            let imgPath = __dirname + `/cache/${i}.png`;
            let getimg = (await axios.get(tt.data.images[i], { responseType: "arraybuffer" })).data;
            fs.writeFileSync(imgPath, Buffer.from(getimg, "utf-8"));
            img.push(fs.createReadStream(imgPath));
          }
          api.sendMessage({ body: `𝗧𝗶𝗸𝗧𝗼𝗸 Video Title: ${title}`, attachment: img }, event.threadID, event.messageID);
        } else {
          let vid = encodeURI(link + '/video/media/hdplay/' + tt.data.id + '.mp4');
          const tvid = (await axios.get(vid, { responseType: "arraybuffer" })).data;
          fs.writeFileSync(tiktok, Buffer.from(tvid, "utf-8"));
          api.sendMessage({ body: `𝗧𝗶𝗸𝗧𝗼𝗸 Video Title: ${title}`, attachment: fs.createReadStream(tiktok) }, event.threadID, event.messageID);
        }
      } catch (e) {
        console.log(e.message);
      }
    }

    // 𝗔𝘂𝘁𝗼𝗱𝗼𝘄𝗻 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸
    if (matchfb) {
      const results = await getFBInfo(urlfb);
      const title = results.title || "No title"; // Facebook video title
      let vid = (await axios.get(encodeURI(results.sd), { responseType: 'arraybuffer' })).data;
      fs.writeFileSync(fbvid, Buffer.from(vid, "utf-8"));
      api.sendMessage({ body: `𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸 Video Title: ${title}`, attachment: fs.createReadStream(fbvid) }, event.threadID, event.messageID);
    }

    // 𝗔𝘂𝘁𝗼𝗱𝗼𝘄𝗻 𝗬𝗼𝘂𝗧𝘂𝗯𝗲
    if (matchyt) {
      const info = await ytdl.getInfo(urlyt);
      const title = info.videoDetails.title; // YouTube video title
      const streams = ytdl(urlyt, { filter: 'audioonly' });
      streams.pipe(fs.createWriteStream(pathaudio)).on('finish', () => {
        api.sendMessage({ body: `𝗬𝗼𝘂𝗧𝘂𝗯𝗲 Audio Title: ${title}`, attachment: fs.createReadStream(pathaudio) }, event.threadID, event.messageID);
      });

      const stream = ytdl(urlyt, { filter: 'audioandvideo', quality: 'highestvideo', format: 'mp4' });
      stream.pipe(fs.createWriteStream(path)).on('finish', () => {
        api.sendMessage({ body: `𝗬𝗼𝘂𝗧𝘂𝗯𝗲 Video Title: ${title}`, attachment: fs.createReadStream(path) }, event.threadID, () => fs.unlinkSync(path), event.messageID);
      });
    }

    // 𝗔𝘂𝘁𝗼𝗱𝗼𝘄𝗻 𝗖𝗮𝗽𝗰𝘂𝘁
    if (matchcc) {
      const rescap = await capcut(urlcc);
      const title = rescap.result.title || "No title"; // Capcut video title
      const desc = rescap.result.description || "No Description";
      const url1 = encodeURI(rescap.result.video_ori);
      const msg = `[ 𝗖𝗮𝗽𝗰𝘂𝘁 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱𝗲𝗿 ]\n\n𝗧𝗶𝘁𝗹𝗲: ${title}\n𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻: ${desc}`;
      const vid = (await axios.get(url1, { responseType: 'arraybuffer' })).data;
      fs.writeFileSync(v, Buffer.from(vid, "utf-8"));
      reply({ body: msg, attachment: fs.createReadStream(v) });
    }
  }
};
