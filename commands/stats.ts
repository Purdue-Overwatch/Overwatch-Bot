import {SlashCommandBuilder} from "@discordjs/builders";
import * as config from "../config.json";
import {CommandInteraction, MessageEmbed} from "discord.js";
import * as request from "postman-request";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Pulls account stats from the Overwatch API')
        .setDefaultPermission(true)

        .addStringOption((string) => string
            .setName("battletag")
            .setDescription("Your Overwatch Battle Tag")
            .setRequired(true)
        )

        .addStringOption(option => option
            .setName('platform')
            .setDescription('The platform of the account')
            .setRequired(false)
            .addChoice('PC', 'pc')
            .addChoice('PlayStation', 'psn')
            .addChoice('Xbox', 'xbl')
        )

        .addStringOption(option => option
            .setName('region')
            .setDescription('The platform of the account')
            .setRequired(false)
            .addChoice('North America', 'us')
            .addChoice('Europe', 'eu')
            .addChoice('Asia', 'asia')
        )
    ,

    permissions: [
        {
            id: config.guild,
            type: 'ROLE',
            permission: true
        },
    ],

    async execute(interaction: CommandInteraction) {
        let username = interaction.options.getString("battletag").split("#")[0] as string;
        let handle = interaction.options.getString("battletag").split("#")[1] as string;
        let region = interaction.options.getString("region") ?? "us";
        let platform = interaction.options.getString("platform") ?? "pc";
        let url = `https://ow-api.com/v1/stats/${platform}/${region}/${username}-${handle}/profile`;
        let options = { url: url, headers: {'User-Agent': 'Mozilla/5.0' } };

        await request(options, async function (error, response, body) {
            if (error) response = {content: "The Overwatch API could not be reached", ephemeral: true};
            else {
                let json = JSON.parse(body);
                if (json.error) response = {content: "Sorry, this player doesn't exist", ephemeral: true};
                else {
                    let embed = buildEmbed(username, handle, json);
                    response = {embeds: [embed]};
                }
            }

            if (response.ephemeral) {
                await interaction.deleteReply();
                await interaction.followUp(response);
            } else {
                await interaction.editReply(response);
            }
        })
    }
}

function buildEmbed(username, handle, json) {

    let level = json["level"];
    let prestige = json["prestige"] ?? 0;

    return new MessageEmbed()
        .setTitle(json["name"])
        // .setURL(`https://www.overbuff.com/players/${}/Monster-11748`)
        .setThumbnail(json["icon"])
        .addField("Level", (level + prestige * 100).toString(), true)
        .addField("Rating", json["rating"].toString(), true);
}