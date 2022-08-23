const dotenv = require('dotenv');
const path = require('path');
const Discord = require('discord.js');
const { GatewayIntentBits } = require('discord.js');
const { SlashCreator, GatewayServer } = require('slash-create');
const mongo = require("mongoose");
const TikTokScraper = require('tiktok-scraper');
var { tall } = require('tall')

dotenv.config();

const client = new Discord.Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
  });

  const creator = new SlashCreator({
    applicationID: process.env.DISCORD_CLIENT_ID,
    publicKey: process.env.DISCORD_CLIENT_PUBKEY,
    token: process.env.DISCORD_CLIENT_TOKEN,
  });

  client.logger = require('./logging.js');

  client.on("ready", () => {
      console.log(`${client.user.username}#${client.user.discriminator} est en ligne! (${client.guilds.cache.size} Guilds)`);
      client.user.setPresence({
          status: 'online'
      });
    creator
    .withServer(
      new GatewayServer(
        (handler) => client.ws.on('INTERACTION_CREATE', handler)
      )
    )
    .registerCommandsIn(path.join(__dirname, 'commands'))
    .syncCommands();
  });

  const options = {
    sessionList: ['sid_tt=21312213'],
    asyncDownload: 5,
    filepath: `CURRENT_DIR`,
    fileName: `CURRENT_DIR`,
    filetype: `na`,
    noWaterMark: true,
    hdVideo: true,
    verifyFp: '',
    useTestEndpoints: false
};


  async function verifyURL(url, message){
    if(url.includes('https://vm.tiktok.com')) {
      tall(url)
      .then(function(unshortenedUrl) {
        console.log('Tall url', unshortenedUrl)
        return urlOK(unshortenedUrl, message)
      })
      .catch(function(err) {
        console.error('Error: ', err)
      })
    } else if(url.includes('https://www.tiktok.com/@')) {
    return urlOK(url, message)
    } else {
      // TODO: manage error
      return 'error';
    }
  }

  async function urlOK(url,message){
    videoMeta = await TikTokScraper.getVideoMeta(url, options);
    let videoName = (videoMeta.collector[0].id + ".mp4")
    let attachment = new Discord.AttachmentBuilder(videoMeta.collector[0].videoUrl, { name: videoName });
    message.reply({files: [attachment]})
    .catch(error => {
      client.logger.error('Error on message.reply (urlOK): ' + error)
    })
  }






  // Detect when a message contain a tiktok url
  client.on("messageCreate", async message => {
    if (/(https?:\/\/)?(www\.)?tiktok.com\/@[a-zA-Z0-9]+/g.test(message.content) || message.content.match(/https:\/\/vm.tiktok.com/)) {
      console.log('Message with tiktok url detected ...')
      let url = /(http|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])/g.exec(message.content)[0]
      await verifyURL(url, message)
    }
  })          



  client.on("error", (err) => {
    client.logger.error('client.on error ' + err);
  });
  
  creator.on('error', m => console.log('slash-create error:', m))
  

client.login(process.env.DISCORD_CLIENT_TOKEN);