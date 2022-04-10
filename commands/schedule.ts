import {SlashCommandBuilder} from "@discordjs/builders";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("schedule")
        .setDescription("General purpose scheduling command")
        .setDefaultPermission(false)
}