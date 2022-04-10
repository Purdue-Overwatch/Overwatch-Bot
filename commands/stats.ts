import {SlashCommandBuilder} from "@discordjs/builders";
import {CommandInteraction, MessageEmbed} from "discord.js";
import * as config from "../config.json";
import * as request from "postman-request";
import {bot} from "../index";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("stats")
        .setDescription("General-Purpose stats command")
        .setDefaultPermission(false)
        .addStringOption((option) => option
            .setName("battletag")
            .setDescription("A valid Overwatch Battletag")
            .setRequired(true)
        )
        .addStringOption((option) => option
            .setName("platform")
            .setDescription("The platform of this account")
            .setRequired(false)
            .addChoices([["PC", "pc"], ["PlayStation", "psn"], ["Xbox Live", "xbl"]])
        )
        .addStringOption((option) => option
            .setName("region")
            .setDescription("The region of this account")
            .setRequired(false)
            .setChoices([["US", "us"], ["EU", "eu"], ["Asia", "asia"]])
        )
    ,

    permissions: [
        {
            id: config.roles.designer,
            type: "ROLE",
            permission: true
        },
        {
            id: config.roles.sergeant,
            type: "ROLE",
            permission: true
        }
    ],

    async execute(interaction: CommandInteraction): Promise<Object> {
        let response;
        let battletag = interaction.options.getString("battletag");
        let platform = interaction.options.getString("platform") ?? "pc";
        let region = interaction.options.getString("region") ?? "us";
        let name = battletag.split("#")[0];
        let tag = battletag.split("#")[1];
        let url = `https://ow-api.com/v1/stats/${platform}/${region}/${name}-${tag}/profile`;
        let options = { url: url, headers: {'User-Agent': 'Mozilla/5.0' }};

        let json = await request(options, async function (error, code, body): Promise<string> {
            if (error) {
                await bot.logger.error("GET Request errored", error);
                throw new Error();
            } else {
                return JSON.parse(body);
            }
        });

        let embed = new MessageEmbed()

        console.log(json);
        response = {content: "Success!"}
        return response;
    }
}