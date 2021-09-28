const {GuildMember} = require('discord.js');
const { sampleSize } = require('lodash')

module.exports = {
  name: 'random',
  description: 'Chooses X members from your current voice channel',
  options: [
    {
      name: 'amount',
      type: 'INTEGER',
      description: 'Amount of members',
      required: true,
    },
  ],
  async execute(interaction, client) {
    try {
      if (!(interaction.member instanceof GuildMember) || !interaction.member.voice.channel) {
        return void interaction.reply({
          content: 'You are not in a voice channel!',
          ephemeral: true,
        });
      }

      await interaction.deferReply();

      const amount = interaction.options.get('amount').value;
      const channelId = interaction.member.voice.channelId
      // remove bots from selection
      const members = interaction.member.voice.channel.members.filter(member => !member.user.bot).map(member => member.user.username)
      const selected = sampleSize(members, amount)
      const msg = selected.join('\n')
      return void interaction.followUp({
        content: msg ? `ומי שנכנסים הם....\n${msg}` : '❌ | Could not generate',
      });
    } catch (error) {
      console.log(error);
      interaction.followUp({
        content: 'There was an error trying to execute that command: ' + error.message,
      });
    }
  },
};
