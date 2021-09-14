const Discord = require('discord.js');
const config = require('./utils/config');
const ytdl = require('ytdl-core');

const client = new Discord.Client();


client.once('ready', () => {
    console.log('Ready!');
   });

client.once('reconnecting', () => {
    console.log('Reconnecting!');
   });
   
client.once('disconnect', () => {
    console.log('Disconnect!');
   });

client.on('message', async message => {
    if(message.author.bot) return;

    if(!message.content.startsWith(config.PREFIX)) return;

    const serverQueue = queue.get(message.guild.id);

    if(message.content.startsWith(`${config.PREFIX}play`)) {
        execute(message, serverQueue);
        return;
    } else if (message.content.startsWith(`${config.PREFIX}skip`)) {
        skip(message, serverQueue);
        return;
    } else if (message.content.startsWith(`${config.PREFIX}stop`)) {
        stop(message, serverQueue);
        return;
    } else {
        message.channel.send("You need to enter a valid command!");
    }
})

const queue = new Map();

const execute = async (message, serverQueue) => {
    const args = message.content.split(" ");

    const voiceChannel = message.member.voice.channel;
    if(!voiceChannel) {
        return message.channel.send(
            "You need to be in a voice channel to play music!"
        );
    }
    const permissions = voiceChannel.permissionsFor(message.client.user);

    if(!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        return message.channel.send(
            "I need the permissions to join and speak in your voice channel!"
        );
    }


const songInfo = await ytdl.getInfo(args[1]);
const song = {
    title: songInfo.videoDetails.title,
    url: songInfo.videoDetails.video_url,
}

if(!serverQueue) {
    const queueConstruct = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 5,
        playing: true
    };

    queue.set(message.guild.id, queueConstruct);

    queueConstruct.songs.push(song);

    try {
        let connection = await voiceChannel.join();
        queueConstruct.connection = connection;
        play(message.guild, queueConstruct.songs[0]);

    } catch (err) {
        console.log(err);
        queue.delete(message.guild.id);
        return message.channel.send(err);
     }
   } 
}

const skip = (message, serverQueue) => {
    if(!message.member.voice.channel) {
        return message.channel.send(
            "You have to be in a voice channel to stop the music!"
        );
    }

    if(!serverQueue) {
        return message.channel.send(
            "There is no song that I could skip!"
        );
    }
    serverQueue.connection.dispatcher.end()
}

const stop = (message, serverQueue) => {
    if(!message.member.voice.channel) {
        return message.channel.send(
            "You have to be in a voice channel to stop  the music!"
        );
    }

    if(!serverQueue) {
        return message.channel.send(
            "There is no song that I could stop!"
        );
    }

    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
}

const play = (guild, song) => {
    const serverQueue = queue.get(guild.id);

    if(!song) {
        serverQueue.voiceChannel.leave();
        queue.delete(guild.id);
        return;
    }


const dispatcher = serverQueue.connection 
.play(ytdl(song.url))
.on("finish", () => {
    serverQueue.songs.shift();
    play(guild, serverQueue.songs[0]);
})
.on("error", error => console.error(error));

dispatcher.setVolumeLogarithmic(serverQueue.volume / 5 );
serverQueue.textChannel.send(`Start playing: **${song.title}**`);

}




client.login(config.TOKEN);