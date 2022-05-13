import {
    ApplicationCommand, Client,
    ClientOptions, Collection,
    Guild, Intents, TextChannel
} from "discord.js";
import {Routes} from "discord-api-types/v9";
import * as config from "../config.json";
import {REST} from "@discordjs/rest";
import * as fs from "fs";
import * as express from "express";
import Logger from "./Logger";
import Queue from "./Queue";
import {connectToDatabase} from "../database/database.service";
import {playersRouter} from "../database/players.router";
import {gamesRouter} from "../database/games.router";
import {teamsRouter} from "../database/teams.router";

const options = {

    intents: [
        Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_PRESENCES
    ]
} as ClientOptions;

export default class Bot extends Client{
    private _guild: Guild;
    private _queueOne: Queue;
    private _queueTwo: Queue;
    private _logger: Logger;
    private _commands: Collection<any, any>;
    private _lobbyChannel: TextChannel;
    private _lobbyChannelTwo: TextChannel;
    private _logChannel: TextChannel;

    constructor() {
        super(options);
        this._commands = new Collection();
    }

    get guild(): Guild {
        return this._guild;
    }

    set guild(value: Guild) {
        this._guild = value;
    }

    get queueOne() {
        return this._queueOne;
    }

    set queueOne(value) {
        this._queueOne = value;
    }

    get queueTwo(): Queue {
        return this._queueTwo;
    }

    set queueTwo(value: Queue) {
        this._queueTwo = value;
    }

    get logger(): Logger {
        return this._logger;
    }

    set logger(value: Logger) {
        this._logger = value;
    }

    get commands() {
        return this._commands;
    }

    set commands(value) {
        this._commands = value;
    }

    get lobbyChannel(): TextChannel {
        return this._lobbyChannel;
    }

    set lobbyChannel(value: TextChannel) {
        this._lobbyChannel = value;
    }

    get lobbyChannelTwo(): TextChannel {
        return this._lobbyChannelTwo;
    }

    set lobbyChannelTwo(value: TextChannel) {
        this._lobbyChannelTwo = value;
    }

    get logChannel(): TextChannel {
        return this._logChannel;
    }

    set logChannel(value: TextChannel) {
        this._logChannel = value;
    }

    async init() {
        this._guild = await this.guilds.fetch(config.guild);
        this._logChannel = await this._guild.channels.fetch(config.channels.log) as TextChannel;
        this._lobbyChannel = await this._guild.channels.fetch(config.channels.lobby) as TextChannel;
        this._lobbyChannelTwo = await this._guild.channels.fetch(config.channels.lobby_2) as TextChannel;
        this._logger = new Logger(this._logChannel);
        await this.initializeQueue();
        await connectToDatabase();
        await this.initializeCommands(config.token);
    }

    async initializeQueue() {
        this._queueOne = new Queue(this._lobbyChannel, 12);
        this._queueTwo = new Queue(this._lobbyChannelTwo, 10);
        await this.queueOne.update("A new queue has started", 3);
        await this.queueTwo.update("A new queue has started", 3);
        for (const [,message] of (await this.lobbyChannel.messages.fetch({limit: 6}))) {
            if (message.author.id == this.user.id) {
                if (message.embeds.some(embed => embed.title == "A new queue has started")) {
                    await message.delete();
                }
            }
        }
        for (const [,message] of (await this.lobbyChannelTwo.messages.fetch({limit: 6}))) {
            if (message.author.id == this.user.id) {
                if (message.embeds.some(embed => embed.title == "A new queue has started")) {
                    await message.delete();
                }
            }
        }
    }

    async initializeCommands(token: string) {
        const commands = [];
        const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
        const rest = new REST({ version: '9' }).setToken(token);
        const id = this.application.id;
        const guild = this.guilds.cache.get(config.guild);

        for (const file of commandFiles) {
            const command = require(`../commands/${file}`);
            if (command.data) {
                commands.push(command.data.toJSON());
                await this.commands.set(command.data.name, command);
            }
        }

        try {
            await rest.put(Routes.applicationGuildCommands(id, guild.id), {body: commands});
            const guildCommands = await rest.get(Routes.applicationGuildCommands(id, guild.id)) as Array<ApplicationCommand>;
            for (const guildCommand of guildCommands) {
                const command = this.commands.get(guildCommand.name);
                //await guild.commands.permissions.set({
                //    command: guildCommand.id,
                //    permissions: command.permissions
                //})
            }
            await this.logger.info("Application commands uploaded");
        } catch (error) {
            await this.logger.error("Error uploading application commands", error);
        }
    }
}