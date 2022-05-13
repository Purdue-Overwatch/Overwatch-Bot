import {MessageActionRow, MessageButton, MessageEmbed, TextChannel} from "discord.js";
import {bot} from "../index";
import Player from "./Player";
import Game from "./Game";
import * as config from "../config.json";

export default class Queue extends Map<string, NodeJS.Timeout>{
    private readonly _time: number;
    private readonly _maxsize: number;
    private readonly _channel: TextChannel;

    public constructor(channel: TextChannel, maxsize: number) {
        super();
        this._time = 3600000;
        this._maxsize = maxsize;
        this._channel = channel;
    }

    public get time(): number {
        return this._time;
    }

    public get channel(): TextChannel {
        return this._channel;
    }

    public get maxsize(): number {
        return this._maxsize;
    }

    public async join(player: Player) {
        if (this.has(player.id)) return {content: "You are already in the queue.", ephemeral: true};
        else if (this.size == this.maxsize) return {content: "The queue is already full.", ephemeral: true};
        else {
            const timeout = global.setTimeout(Queue.timeout, this.time, this, player);
            this.set(player.id, timeout)
            if (this.size == this.maxsize) {
                await this.update("A new game is starting...", 0);
                this.forEach((timeout) => {
                    clearTimeout(timeout);
                })
                if (this.maxsize == 10) {
                    bot.queueTwo = new Queue(bot.lobbyChannelTwo, this._maxsize);
                } else {
                    bot.queueOne = new Queue(bot.lobbyChannel, this._maxsize);
                }
                await Game.create(this)
            } else this.update(`${player.username} has joined`, 1).then();
        }
    }

    public async remove(player: Player) {
        if (this.size == this.maxsize) return {content: "Queue has filled. You cannot leave at this time.", ephemeral: true};
        else if (this.has(player.id)) {
            clearTimeout(this.get(player.id));
            this.delete(player.id);
            await this.update(`${player.username} has left`, 2);
        } else return {content: "You are not in the queue", ephemeral: true};
    }

    public async update(update: string, code: number, message = null) {
        let messages = (await this.channel.messages.fetch({limit: 10}))
            .filter(message => message.author == bot.user);
        for (const [, message] of messages) {
            if (message.embeds[0] != undefined && message.embeds[0] != null) {
                if (message.embeds[0].title.toLowerCase().includes("pugs")) await message.delete();
            }
        }
        let options;
        let embed = new MessageEmbed().setTitle("PUGs: " + update.concat(` [${this.size}/${this.maxsize}]`)).setDescription("");
        const row = new MessageActionRow().addComponents(
            new MessageButton().setLabel("Join").setCustomId("join").setStyle("SUCCESS"),
            new MessageButton().setLabel("Leave").setCustomId("leave").setStyle("DANGER"),
            new MessageButton().setLabel("Bump").setCustomId("bump").setStyle("SECONDARY"),
            new MessageButton().setLabel("Register").setCustomId(config.roles.pug).setStyle("PRIMARY"));
        let keys = this.keys();
        for (let i = 0; i < this.size; i++) {
            let player = await Player.get(keys.next().value);
            embed.setDescription(embed.description.concat(`**${i + 1}.** ${player.username}\n`));
        }
        switch (code) {
            case 0: embed.setColor("BLUE"); break;
            case 1: embed.setColor("GREEN"); break;
            case 2: embed.setColor("ORANGE"); break;
            case 3: embed.setColor("WHITE"); break;
        }
        if (message != null) options = {content: message, embeds: [embed], components: [row]}
        else options = {embeds: [embed], components: [row]}
        this.channel.send(options).then();

    }

    static async timeout(queue: Queue, player: Player) {
        queue.delete(player.id);
        await queue.update(`${player.username} has been timed out`, 2, `<@!${player.id}>`);
    }
}