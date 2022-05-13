import {SlashCommandBuilder} from "@discordjs/builders";
import * as config from "../config.json";
import {ButtonInteraction, CommandInteraction} from "discord.js";
import Player from "../objects/Player";
import {bot} from "../index";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("queue")
        .setDescription("General-purpose queue interactions")
        .setDefaultPermission(true)

        // view - subcommand
        .addSubcommand((command) => command
            .setName('bump')
            .setDescription('Command to bump the queue')
        )

        // join - subcommand
        .addSubcommand((command) => command
            .setName('join')
            .setDescription('Command to join the queue')
        )

        // leave - subcommand
        .addSubcommand((command) => command
            .setName('leave')
            .setDescription('Command to leave the queue')
        ),

    permissions: [
        {
            id: config.roles.pug,
            type: 'ROLE',
            permission: true
        }
    ],

    async execute(interaction: CommandInteraction | ButtonInteraction) {
        let response;
        let subcommand = interaction instanceof CommandInteraction ? interaction.options.getSubcommand() : interaction.customId;
        let queue = (interaction.channel.id == config.channels.lobby) ? bot.queueOne : bot.queueTwo;
        let player = await Player.get(interaction.user.id);
        if (!player) response = {content: "Use \`/register\` to be able to interact with the PUGs Queue.", ephemeral: true};
        else {
            if (player.banTime > Math.round(Date.now() / 1000)) return interaction.reply({content: `You will be unbanned <t:${player.banTime}:R>`, ephemeral: true});
            switch (subcommand) {
                case 'bump': case 'v':
                    await queue.update("Current Queue", 1);
                    break;
                case 'join': case 'j':
                    response = await queue.join(player);
                    break;
                case 'leave': case 'l':
                    response = await queue.remove(player);
                    break;
                default:
                    response = {content: "Something went very wrong... Please send this to <@!751910711218667562>."};
                    await bot.logger.fatal("Manage Command Failed", new Error("Inaccessible option"));
            }
        }
        return response;
    }
}