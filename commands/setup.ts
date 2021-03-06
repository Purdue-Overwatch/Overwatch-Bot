import {
    CommandInteraction,
    MessageActionRow,
    MessageButton,
    MessageEmbed,
    MessageSelectMenu
} from "discord.js"
import { SlashCommandBuilder } from "@discordjs/builders"
import * as config from "../config.json";
import {bot} from "../index";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setup")
        .setDescription("Creates a various-purpose menu.")
        .setDefaultPermission(false)
        .addStringOption(option => option
            .setName("menu_name")
            .setDescription("The name of the menu to setup")
            .setRequired(true)
            .addChoice("verification", "verification_menu")
            .addChoice("welcome", "welcome_menu")
            .addChoice("ranks", "ranks_menu")
            .addChoice("roles", "roles_menu")
            .addChoice("pronouns", "pronouns_menu")
        ),

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

    async execute(interaction: CommandInteraction) {
        let menu_name = interaction.options.getString("menu_name");
        switch(menu_name) {
            case "verification_menu": return buildVerificationMenu();
            case "ranks_menu": return await buildRanksMenu();
            case "welcome_menu": return buildWelcomeMenu();
            case "roles_menu": return await buildRolesMenu();
            case "pronouns_menu": return await buildPronounsMenu();
            default: return ({content: "Sorry, the specified menu does not exist", ephemeral: true});
        }
    }
}

async function buildVerificationMenu() {
    let embed = new MessageEmbed()
        .setTitle("Purdue Affiliation Menu")
        .setColor("#f1c40f")
        .setDescription("Indicate your affiliation with Purdue. The Purdue role requires email verification.\n\n" +
            "**How to authenticate yourself as a Purdue Student!**\n" +
            "1. Use `/verify start` to have a one-time code sent to your email.\n" +
            "2. Use `/verify complete` with your one-time code.\n");

    let row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId(config.roles.purdue)
                .setLabel("Purdue")
                .setStyle("PRIMARY"),
            new MessageButton()
                .setCustomId(config.roles.other)
                .setLabel("Non-Purdue")
                .setStyle("SECONDARY"),
        );
    return ({embeds: [embed], components: [row]});
}

async function buildRanksMenu() {
    let embed = new MessageEmbed()
        .setTitle("Overwatch Rank Menu")
        .setColor("#f1c40f")
        .setDescription("Select your Overwatch Rank!");

    let bronze = await bot.guild.emojis.fetch(config.emotes.bronze);
    let silver = await bot.guild.emojis.fetch(config.emotes.silver);
    let gold = await bot.guild.emojis.fetch(config.emotes.gold);
    let platinum = await bot.guild.emojis.fetch(config.emotes.platinum);
    let diamond = await bot.guild.emojis.fetch(config.emotes.diamond);
    let master = await bot.guild.emojis.fetch(config.emotes.master);
    let grandmaster = await bot.guild.emojis.fetch(config.emotes.grandmaster);
    let god = await bot.guild.emojis.fetch(config.emotes.god);

    let row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId(config.roles.ranks.bronze)
                .setLabel("Bronze")
                .setStyle("SECONDARY")
                .setEmoji(bronze),
            new MessageButton()
                .setCustomId(config.roles.ranks.silver)
                .setLabel("Silver")
                .setStyle("SECONDARY")
                .setEmoji(silver),
            new MessageButton()
                .setCustomId(config.roles.ranks.gold)
                .setLabel("Gold")
                .setStyle("SECONDARY")
                .setEmoji(gold),
            new MessageButton()
                .setCustomId(config.roles.ranks.platinum)
                .setLabel("Platinum")
                .setStyle("SECONDARY")
                .setEmoji(platinum)
        );

    let row2 = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId(config.roles.ranks.diamond)
                .setLabel("Diamond")
                .setStyle("SECONDARY")
                .setEmoji(diamond),
            new MessageButton()
                .setCustomId(config.roles.ranks.master)
                .setLabel("Master")
                .setStyle("SECONDARY")
                .setEmoji(master),
            new MessageButton()
                .setCustomId(config.roles.ranks.grandmaster)
                .setLabel("Grandmaster")
                .setStyle("SECONDARY")
                .setEmoji(grandmaster),
            new MessageButton()
                .setCustomId(config.roles.ranks.god)
                .setLabel("T500")
                .setStyle("SECONDARY")
                .setEmoji(god),
        )

    return ({embeds: [embed], components: [row, row2]});
}

async function buildRolesMenu() {
    let embed = new MessageEmbed()
        .setTitle("Overwatch Roles Menu")
        .setColor("#f1c40f")
        .setDescription("Select what roles you play!")

    let tank = await bot.guild.emojis.fetch(config.emotes.tank);
    let support = await bot.guild.emojis.fetch(config.emotes.support);
    let damage = await bot.guild.emojis.fetch(config.emotes.damage);

    let row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId(config.roles.roles.tank)
                .setLabel("Tank")
                .setStyle("SECONDARY")
                .setEmoji(tank),
            new MessageButton()
                .setCustomId(config.roles.roles.support)
                .setLabel("Support")
                .setStyle("SECONDARY")
                .setEmoji(support),
            new MessageButton()
                .setCustomId(config.roles.roles.damage)
                .setLabel("Damage")
                .setStyle("SECONDARY")
                .setEmoji(damage)
        )

    return ({embeds: [embed], components: [row]});
}

async function buildPronounsMenu() {
    let embed = new MessageEmbed()
        .setTitle("Pronoun Roles Menu")
        .setColor("#f1c40f")
        .setDescription("Pick any pronouns that apply to you!")

    let row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId(config.roles.pronouns["they/them"])
                .setLabel("They/Them")
                .setStyle("SECONDARY"),
            new MessageButton()
                .setCustomId(config.roles.pronouns["she/her"])
                .setLabel("She/Her")
                .setStyle("SECONDARY"),
            new MessageButton()
                .setCustomId(config.roles.pronouns["he/him"])
                .setLabel("He/Him")
                .setStyle("SECONDARY"),
            new MessageButton()
                .setCustomId(config.roles.pronouns["she/they"])
                .setLabel("She/They")
                .setStyle("SECONDARY"),
            new MessageButton()
                .setCustomId(config.roles.pronouns["he/they"])
                .setLabel("He/They")
                .setStyle("SECONDARY")
        )

    return ({embeds: [embed], components: [row]});
}

async function buildWelcomeMenu() {
    let row

    row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId(config.roles.overwatch)
                .setLabel("Access Purdue Overwatch!")
                .setStyle("SUCCESS")
                .setEmoji(config.emotes.logo)
        )
    return ({components: [row]});
}
