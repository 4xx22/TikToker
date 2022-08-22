const { SlashCommand, ComponentType, ButtonStyle } = require('slash-create');

module.exports = class extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: "invite",
            description: "Permet d'avoir une invite pour inviter le bot",
        });
    }

    async run (ctx) {
        await ctx.defer();
        await ctx.send('Clique sur le bouton pour ajouter le bot sur ton serveur!', {
            components: [{
              type: ComponentType.ACTION_ROW,
              components: [{
                type: ComponentType.BUTTON,
                style: ButtonStyle.LINK,
                label: 'Invitation',
                url: `https://discord.com/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&permissions=517543939137&scope=bot%20applications.commands`,
                emoji: {
                  name: '🎥'
                }
              }]
            }]
          });      
    }
}