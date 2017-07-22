const botSettings = require("./settings.json");
const Discord = require("discord.js");
const YTDL = require("ytdl-core");
const Token = botSettings.token;
const Prefix = botSettings.prefix;
const fetch = require('node-fetch');
const parseString = require('xml2js').parseString;
const util = require('util');


const client = new Discord.Client({
  disableEveryone: true
});

process.on('unhandledRejection', (reason) => {
  console.error(reason);
  process.exit(1);
});

let MusicStore = {
  queue: []
};


function play(connection, message) {

  MusicStore.dispatcher = connection.playStream(YTDL(MusicStore.queue[0], {filter: "audioonly"}));

  MusicStore.queue.shift();

  MusicStore.dispatcher.on("end", () => {
    if (MusicStore.queue[0]) {
      play(connection, message);
    }  else {
      connection.disconnect();
      }
  });
}

client.on("ready", async () => {
  console.log(`Bot is ready! ${client.user.username}`);

    try {
      let link = await client.generateInvite(["ADMINISTRATOR"]);
      console.log(link);
    } catch (e) {
      console.log(e.stack);
    }
});

//GUILD EVENTS

client.on("guildMemberAdd", member => {
  member.guild.defaultChannel.send(`Welcome ${member.user} to this server!`);
});

client.on("guildMemberRemove", member => {
  member.guild.defaultChannel.send(`Say goodbye to pleb aka ${member.user.username}!`);
});

client.on("guildBanAdd", (guild, user) => {
  guild.defaultChannel.send(`${user.username} was just banned!`);
});

client.on("guildBanRemove", (guild, user) => {
  guild.defaultChannel.send(`${user.username} was just unbanned!`);
});

//CHANNEL EVENTS

client.on("channelCreate", channel => {
  if (channel.type === "text") {
  channel.guild.defaultChannel.send(`A ${channel.type} channel by the name of ${channel.name} have been created!`);
  }
});

client.on("channelDelete", channel => {
  channel.guild.defaultChannel.send(`A ${channel.type} by the name of ${channel.name} have been deleted!`);
});

//COMMANDS

client.on("message", async message => {
  if(message.author.bot) return;
  if (message.channel.type === "dm") return;

  let args = message.content.substring(Prefix.length).split(" ");

  switch (args[0].toLowerCase()) {

    case "help":
      let embed = new Discord.RichEmbed()
      .setTitle("LIST OF ALL COMMANDS")
      .setDescription(AllCommands)
      .setColor("#800080")
      message.channel.send({embed});
    break;

    case "urban":
    if (!args[1]) message.channel.send("You forgot the word!");
    if (args[1]) var urban1 = args[1];
    if (args[2]) var urban2 = args[2];
    if (args[3]) var urban3 = args[3];

    if (urban1 && !urban2) var UrbanLink = `http://api.urbandictionary.com/v0/define?term=${urban1}`;
    if (urban1 && urban2 && !urban3) var UrbanLink = `http://api.urbandictionary.com/v0/define?term=${urban1}+${urban2}`;
    if (urban1 && urban2 && urban3) var UrbanLink= `http://api.urbandictionary.com/v0/define?term=${urban1}+${urban2}+${urban3}`;

    if (UrbanLink) {
        fetch(UrbanLink)
          .then(response => response.json())
            .then(data => {
              if (typeof data.list[0].word !== "undefined") { var urbanword = data.list[0].word } else { var urbanword = "none"; }
              if (typeof data.list[0].definition !== "undefined") { var urbandefinition = data.list[0].definition } else { var urbandefinition = "none"; }
              if (typeof data.list[0].example !== "undefined") { var urbanexample = data.list[0].example } else { var urbanexample = "none"; }
              if (typeof data.list[0].permalink !== "undefined") { var urbanartlink = data.list[0].permalink } else { var urbanartlink = "none"; }

              let embed = new Discord.RichEmbed()
                .setTitle(urbanword)
                .setDescription(urbandefinition)
                .addField(urbanexample, urbanartlink)
                .setColor("#800080")
                message.channel.send({embed});
            })
            .catch(e => {
              console.log(e);
              message.channel.send("Damn son! Something went wrong, where did u find this word?");
            });
      }
    break;

    case "8ball":
      var ballsearch = args[1];
      let BallLink = `https://8ball.delegator.com/magic/JSON/${ballsearch}`;
        fetch(BallLink)
          .then(response => response.json())
            .then(data => {
              let answer = data.magic.answer;
              message.channel.send(`${answer}`);
            })
            .catch(e => {
              console.log(e);
            });
    break;

    case "randomgif":
    let RandomGifLink = 'https://api.giphy.com/v1/gifs/random?api_key=c0740c6e776646d198513230febadb5c';
      fetch(RandomGifLink)
        .then(response => response.json())
          .then(data => {
            let image = data.data.fixed_height_downsampled_url;
            message.channel.send({files: [image]});
          })
          .catch(e => {
            console.log(e);
          });
    break;

    case "randomanimepic":
    let RandomPicLink = 'https://ibsear.ch/api/v1/images.json?q=random%3A&limit=1&key=24DCBED17732E19F0A8C50C7EF6C8B3D9ED4D3CC';
      fetch(RandomPicLink)
        .then(response => response.json())
          .then(data => {
            let server = data[0].server;
            let path = data[0].path;
            let imagelink = `https://${server}.ibsear.ch/${path}`;
            message.channel.send({files: [imagelink]});
          })
          .catch((e) => {
            console.log(e);
          });
    break;

    case "animepic":
      if (args[1]) {
        let search = args[1];
        let PicLink = `https://ibsear.ch/api/v1/images.json?q=${search}&limit=100&shuffle=50&key=24DCBED17732E19F0A8C50C7EF6C8B3D9ED4D3CC`;
          fetch(PicLink)
            .then(response => response.json())
              .then(data => {
                let x = 1;
                let y = data.length;
                let result = Math.floor(Math.random() * ((y-x)+1) + x);

                let server = data[result].server;
                let path = data[result].path;
                let imagelink = `https://${server}.ibsear.ch/${path}`;
                message.channel.send({files: [imagelink]});
              })
              .catch((e) => {
                console.log(e);
                message.channel.send("Oops! Something went wrong, please try again or try another query input");
              });
      } else if (!args[1]) {
          message.channel.send("You haven't provided any tag for search, use $randomanimepic then");
      }
    break;

    case "weather":
    if (args[1]) {
      let City = args[1].toLowerCase();
      let WeatherLink = `http://api.openweathermap.org/data/2.5/weather?q=${City}&units=metric&APPID=8a41e7cfcb39cb5d705615ac8f460060`;
        fetch(WeatherLink)
          .then(response => response.json())
            .then(data => {
              //console.log(util.inspect(data, false, null, true));
              let Country = data.sys.country;
              let SunriseEpoch = data.sys.sunrise;
              let SunsetEpoch = data.sys.sunset;

              let ReadableSunrise = new Date(SunriseEpoch * 1000);
              let ReadableSunset = new Date(SunsetEpoch * 1000);

              let embed = new Discord.RichEmbed()
                .setTitle(data.name)
                .setDescription(`Temperature: ${data.main.temp}C \n Pressure: ${data.main.pressure} \n Sunrise: ${ReadableSunrise} \n Sunset: ${ReadableSunset} \n Country: ${Country} `)
                .setColor("#800080")
                message.channel.send({embed});
            })
            .catch((e) => {
              console.log(e);
              message.channel.send("Sorry, something went wrong. Probably problem with input data.");
            });
      } else if (!args[1]) {
            message.channel.send("Baka! You forgot the city!");
      }
    break;

    case "game":
      let x = 40000;
      let y = 50000;
      let result = Math.floor(Math.random() * ((y-x)+1) + x);
      let GameLink = `https://www.giantbomb.com/api/game/3030-${result}/?api_key=74a46caf11c35a6f109beb7db5b6de1fd616a871&field_list=genres,name,deck,image&format=json`;
        fetch(GameLink)
          .then(response => response.json())
            .then(data => {
              //console.log(util.inspect(data, false, null, true));
          try {
              let GameName = data.results.name;
              let GameDeck = data.results.deck;
              let GameImage = data.results.image.medium_url;

              let embed = new Discord.RichEmbed()
                .attachFile(typeof GameImage !== 'undefined'|'null' && GameImage)
                .setTitle(GameName)
                .setDescription(GameDeck)
                .setColor("#800080")
                message.channel.send({embed});
          } catch(e) {
              console.log(e);
              let GameName = data.results.name;
              let GameDeck = data.results.deck;

            let embed = new Discord.RichEmbed()
              .setTitle(GameName)
              .setDescription(GameDeck)
              .setColor("#800080")
              message.channel.sendEmbed({embed});
          }
            });
    break;

    case "neko":
        const NekoLink = 'http://thecatapi.com/api/images/get?format=xml&results_per_page=1';
          fetch(NekoLink)
            .then(response => response.text())
              .then(body => {
                parseString(body, function(err, result) {
                  //console.log(util.inspect(result, false, null, true));
                  let NekoImage = result.response.data[0].images[0].image[0].url[0];
                  message.channel.send({files: [NekoImage]});
                })
              })
            .catch(e => {
              console.log(e);
              message.channel.send("Sorry, something went wrong! Please try again");
            });
    break;

    case "play":
      if (!args[1]) {
        message.channel.send("Where is link huh?");
        return;
      }

      if (!message.member.voiceChannel) {
        message.channel.send("You aint in voice channel");
        return;
      }

      MusicStore.queue.push(args[1]);

      if (!message.guild.voiceConnection) {
        message.member.voiceChannel.join()
          .then(connection => {
            play(connection, message);
          });
      }
    break;

    case "skip":
      if (MusicStore.dispatcher) {
        MusicStore.dispatcher.end();
      }
    break;

    case "stop":
      if (message.guild.voiceConnection) {
        for (let i = MusicStore.queue.length - 1; i >= 0; i--) {
          MusicStore.queue.splice(i, 1);
        }
          MusicStore.dispatcher.end();
      }﻿
    break;
  }
}); //END MESSAGE HANDLER

const AllCommands = `
**${Prefix}Help** = Get List of Commands
**${Prefix}Urban (query max = 3)** = Search for a Word or Phrase on UrbanDictionary
**${Prefix}8ball (query)** = Need Some Answers huh?
**${Prefix}RandomGIF**
**${Prefix}RandomAnimePic**
**${Prefix}AnimePic (query max = 1)** = Search for an Anime Picture
**${Prefix}Weather (City)**
**${Prefix}Neko** = Get Random GIF or Image of Cats <3
**${Prefix}Play (YoutubeURL)** = Add Song To Queue
**${Prefix}Skip** = Skip Song
**${Prefix}Stop** = Stop Playing Music and Clear Whole Queue
`;
client.login(Token);
