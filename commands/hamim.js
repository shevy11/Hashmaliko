const {GuildMember} = require('discord.js');
const { sampleSize } = require('lodash')
const {QueryType} = require('discord-player');
const axios = require('axios')

module.exports = {
  name: 'hamim',
  description: 'Adding to playlist the top X songs',
  options: [
    {
      name: 'amount',
      type: 'INTEGER',
      description: 'Amount of songs',
    },
    {
      name: 'region',
      type: 3,
      description: 'Region code Ex: US,IL (default)',
    },
  ],
  async execute(interaction, player) {
    try {
      if (!(interaction.member instanceof GuildMember) || !interaction.member.voice.channel) {
        return void interaction.reply({
          content: 'You are not in a voice channel!',
          ephemeral: true,
        });
      }

      await interaction.deferReply();

      const amount = interaction?.options?.get('amount')?.value || 10;

      const region = interaction?.options?.get('region')?.value || 'IL';
      
      const queue = await player.createQueue(interaction.guild, {
          metadata: interaction.channel,
      });

      try {
        if (!queue.connection) await queue.connect(interaction.member.voice.channel);
      } catch {
        void player.deleteQueue(interaction.guildId);
        return void interaction.followUp({
          content: 'Could not join your voice channel!',
        });
      }

      const response = await axios.get(`https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&chart=mostPopular&maxResults=${amount}&regionCode=${region}&videoCategoryId=10&key=${process.env['YOUTUBE']}`)
      if (!response?.data?.items) throw "Couldn't fetch"
  
      const msg = '🔥🔥🔥 החמים'
      const promises = []
      for (let i = 0; i < response.data.items.length; i++) {
        const video = response.data.items[i] 
        promises.push(player.search(`https://www.youtube.com/watch?v=${video.id}`, {
            requestedBy: interaction.user,
            searchEngine: QueryType.AUTO,
          }).catch(() => {}) || '');
      }
      const res = await Promise.all(promises)

      for (let i = 0; i < res.length; i++) {
        const r = res[i]
        if (r?.tracks) 
          await queue.addTrack(r.tracks[0])
      }
      if (!queue.playing) await queue.play();

      return void interaction.followUp({
        content: msg ? msg : '❌ | Could not generate',
      });
    } catch (error) {
      console.log(error);
      interaction.followUp({
        content: 'There was an error trying to execute that command: ' + error.message,
      });
    }
  },
};
