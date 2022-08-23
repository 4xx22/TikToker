const { SlashCommand, CommandOptionType } = require('slash-create');
const Discord = require('discord.js');
const moment = require("moment");
const chalk = require('chalk');
var {client} = require("../index.js");
const TikTokScraper = require('tiktok-scraper');
const https = require('follow-redirects').https;
const fs = require("fs")
var { tall } = require('tall')

module.exports = class tiktokCommand extends SlashCommand {
  constructor(creator) {
    super(creator, {
      name: 'tiktok',
      description: "Get the direct video of a tiktok.",
      defaultPermission: true,
      options: [{
        required: true,
        type: CommandOptionType.STRING,
        name: 'link',
        description: "Link to the tiktok.",
      }
      ]
    });

    this.filePath = __filename;
  }

  async run(ctx) {
    await ctx.defer();
    const options = {
        // Set session: {string[] default: ['']}
        // Authenticated session cookie value is required to scrape user/trending/music/hashtag feed
        // You can put here any number of sessions, each request will select random session from the list
        sessionList: ['sid_tt=21312213'],
        // How many post should be downloaded asynchronously. Only if {download:true}: {int default: 5}
        asyncDownload: 5,

        // File path where all files will be saved: {string default: 'CURRENT_DIR'}
        filepath: `CURRENT_DIR`,
        fileName: `CURRENT_DIR`,
    
        // Output with information can be saved to a CSV or JSON files: {string default: 'na'}
        // 'csv' to save in csv
        // 'json' to save in json
        // 'all' to save in json and csv
        // 'na' to skip this step
        filetype: `na`,
    
        noWaterMark: true,
        hdVideo: true,
    
        // verifyFp is used to verify the request and avoid captcha
        // When you are using proxy then there are high chances that the request will be
        // blocked with captcha
        // You can set your own verifyFp value or default(hardcoded) will be used
        verifyFp: '',
        useTestEndpoints: false
    };




    try {
        var videoMeta = null
        // Verify if url is vm.tiktok.com
        async function verifyURL(url){
          if(url.includes('https://vm.tiktok.com')) {
            tall(url)
            .then(function(unshortenedUrl) {
              console.log('Tall url', unshortenedUrl)
              return urlOK(unshortenedUrl)
            })
            .catch(function(err) {
              console.error('Error: ', err)
            })
          } else if(url.includes('https://tiktok.com/@')) {
          return urlOK(url)
          } else {
            // TODO: manage error
            return error;
          }
        }
        
        await verifyURL(ctx.options.link)
        async function urlOK(url){
          videoMeta = await TikTokScraper.getVideoMeta(url, options);
          let videoName = (videoMeta.collector[0].id + ".mp4")
          let file = fs.createWriteStream(videoName)
          https.get(videoMeta.collector[0].videoUrl, response => {
            response.pipe(file)
            response.on('end', () => {
                videoOK(videoName);
              });            
          })
        }


        async function videoOK(videoName){
          await ctx.send({
                file: {
                    name: videoName,
                    file: fs.readFileSync(videoName)
                  }
            })
            fs.unlinkSync(videoName)
        }
  
    } catch (error) {
        console.log(error);
        ctx.send({
            content: 'An error occured',
            ephemeral: true
          });    
    }




        let time = moment(Date.now()).format("HH:mm:ss");
            if (typeof (ctx.guildID) === 'undefined') {
                console.log(`${chalk.cyan(`[CMD] Utilisation du /adddomain domain:${ctx.options.domain} par ${ctx.user.username}#${ctx.user.discriminator} (${ctx.user.id}) in DM ${time}`)}`);
            } else {
                let guild = client.guilds.cache.get(ctx.guildID)
                console.log(`${chalk.cyan(`[CMD] Utilisation du /adddomain domain:${ctx.options.domain} par ${ctx.user.username}#${ctx.user.discriminator} (${ctx.user.id}) ${guild.name} (${guild.id}) ${time}`)}`);
              }
    }
        catch (error) {
            console.log((error))
            return "Une erreur est survenu, merci de contacter Skye!";
        }  
}