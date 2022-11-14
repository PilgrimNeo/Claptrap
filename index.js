const Discord = require("discord.js")
const Twit = require('twit');
const keepAlive = require("./server")
const mySecret = process.env['TOKEN']
const fetch = require("node-fetch")
const Database = require("@replit/database")

//Encouragements
const db = new Database()
const client = new Discord.Client()

const sadWords = ["sad", "depressed", "unhappy", "angry", "miserable"]

const starterEncouragements = [
  "Cheer up!",
  "Hang in there.",
  "You are a great person / bot!"
]

//jokes
const jokes = [
  'I went to a street where the houses were numbered 8k, 16k, 32k, 64k, 128k, 256k and 512k. It was a trip down Memory Lane.',
  '“Debugging” is like being the detective in a crime drama where you are also the murderer.',
  'The best thing about a Boolean is that even if you are wrong, you are only off by a bit.',
  'A programmer puts two glasses on his bedside table before going to sleep. A full one, in case he gets thirsty, and an empty one, in case he doesn’t.',
  'If you listen to a UNIX shell, can you hear the C?',
  'Why do Java programmers have to wear glasses? Because they don’t C#.',
  'What sits on your shoulder and says “Pieces of 7! Pieces of 7!”? A Parroty Error.',
  'When Apple employees die, does their life HTML5 in front of their eyes?',
  'Without requirements or design, programming is the art of adding bugs to an empty text file.',
  'Before software can be reusable it first has to be usable.',
  'The best method for accelerating a computer is the one that boosts it by 9.8 m/s2.',
  'I think Microsoft named .Net so it wouldn’t show up in a Unix directory listing.',
  'There are two ways to write error-free programs; only the third one works.',
];

const T = new Twit({
  consumer_key: process.env.API_KEY,
  consumer_secret: process.env.API_SKEY,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.SACCESS_TOKEN,
  bearer_token: process.env.BEARER_TOKEN,
  timeout_ms: 60 * 1000,
});

// Destination Channel Twitter Forwards
const dest = '848241535657181205';

// Create a stream to follow tweets
const stream = T.stream('statuses/filter', {
  follow: '1395167952769634306', // @Stupidcounter
});

stream.on('tweet', (tweet) => {
  const twitterMessage = `Read the latest tweet by ${tweet.user.name} (@${tweet.user.screen_name}) here: https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`;
  client.channels.cache.get(dest).send(twitterMessage);
  return;
});


//Encouragements#2
db.get("encouragements").then(encouragements => {
  console.log(encouragements)
  if (!encouragements || encouragements.length < 1) {
    db.set("encouragements", starterEncouragements)
  }  
})

db.get("responding").then(value => {
  if (value == null) {
    db.set("responding", true)
  }  
})

//Quotes
function getQuote() {
  return fetch("https://zenquotes.io/api/random")
    .then(res => {
      return res.json()
      })
    .then(data => {
      return data[0]["q"] + " -" + data[0]["a"]
    })
}

//Encouragements#3
function updateEncouragements(encouragingMessage) {
  db.get("encouragements").then(encouragements => {
    encouragements.push([encouragingMessage])
    db.set("encouragements", encouragements)
  })
}

function deleteEncouragment(index) {
  db.get("encouragements").then(encouragements => {
    if (encouragements.length > index) {
      encouragements.splice(index, 1)
      db.set("encouragements", encouragements)
    }
  })
}

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on("message", msg => {
  if (msg.content === "inspire") {
    getQuote().then(quote => msg.channel.send(quote))
  }

  db.get("responding").then(responding => {
    if (responding && sadWords.some(word => msg.content.includes(word))) {
      db.get("encouragements").then(encouragements => {
        const encouragement = encouragements[Math.floor(Math.random() * encouragements.length)]
        msg.reply(encouragement)
      })
    }
  })

  if (msg.content.startsWith("$new")) {
    encouragingMessage = msg.content.split("$new ")[1]
    updateEncouragements(encouragingMessage)
    msg.channel.send("New encouraging message added.")

  }if (msg.content.startsWith("$del")) {
    index = parseInt(msg.content.split("$del ")[1])
    deleteEncouragment(index)
    msg.channel.send("Encouraging message deleted.")

  }if (msg.content.startsWith("$list")) {
    db.get("encouragements").then(encouragements => {
      msg.channel.send(encouragements)
    })

  }if (msg.content.startsWith("$responding")) {
    value = msg.content.split("$responding ")[1]

    if (value.toLowerCase() == "true") {
      db.set("responding", true)
      msg.channel.send("Responding is on.")
    } else {
      db.set("responding", false)
      msg.channel.send("Responding is off.")
    }
  }if (msg.content === '$joke') {
    msg.channel.send(jokes[Math.floor(Math.random() * jokes.length)]);

  }if (msg.content.startsWith("$rules")) {
    const embed = new Discord.MessageEmbed()
    .setTitle("**Rules**")
    .setColor("#00000a")
    .setThumbnail("https://cdn.discordapp.com/icons/897102864785244192/63ee363c2fc8aab66390114f706d8646.png?size=100")
    .addField("__General server rules__","•No offensive nicknames \n •No offensive profile pictures \n •No exploiting loopholes in the rules (please report them) \n •Rules apply to DMing other members of the server")
    .addField("__Text chat rules__","•No questioning the mods \n •No illegal content \n •No harassment \n •No sexism \n •No racism \n •No hate speech \n •No spamming \n •No advertisement without permission \n •No links \n •No linking to other servers \n •Bot commands only under <#897102865670238242> \n •No offtopic/use the right text channel for the topic you wish to discuss")
    .addField("__Voice chat rules__"," •No annoying, loud or high pitch noises \n •Reduce the amount of background noise, if possible \n •Moderators reserve the right to disconnect you from a voice channel if your sound quality is poor \n •Moderators reserve the right to disconnect, mute, deafen, or move members to and from voice channels")

  msg.channel.send(embed);
  msg.delete();

  }if (msg.content.startsWith("$socials")) {
    const embed = new Discord.MessageEmbed()
    .setTitle("**Socials**")
    .setColor("#00000a")
    .setThumbnail("https://cdn.discordapp.com/avatars/640153152351502346/71a47ea0cc261c110366d6add3b95d4e.png?size=1024")
    .addField("<:steam:849739177875603496> __Steam__","Check out **Pilgrim Neo**'s profile on [Steam](https://www.steamcommunity.com/id/pilgrimneo/)")
    .addField("<:spotify:849739985858723871> __Spotify__","Check out **Pilgrim Neo**'s playlists on [Spotify](https://open.spotify.com/user/0g2wezhzvcg2mbcf4txnsptso?si=abRN6BdwT1i6OzTHFemkwg&nd=1)")
    .addField("<:twitch:849739175875969055> __Twitch__","Follow **Pilgrim Neo** on [Twitch](https://www.twitch.tv/pilgrim_neo)")
    .addField("<:youtube:849739176240742440> __Youtube__","Subscribe to **Pilgrim Neo** on [Youtube](https://www.youtube.com/channel/UC2CqzOayZl_Mfeeiag-jXDw)")
    .addField("<:instagram:849739969203273739> __Instagram__","Follow **Pilgrim Neo** on [Instagram](https://www.instagram.com/_.penic._/)")
    .addField("<:twitter:849739171937386536> __Twitter__","Follow **Pilgrim Neo** on [Twitter](https://twitter.com/Pilgrim_Neo)")
    
  msg.channel.send(embed);
  msg.delete();
  }
});

keepAlive()
client.login(process.env.TOKEN)