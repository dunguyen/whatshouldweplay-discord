import mongoose, { Model, Schema } from 'mongoose';
import logger from '../util/logger';
import { GameDocument } from './game';

export type DiscordUserDocument = mongoose.Document & {
    discordUserId: string;
    games: {
        platform: string;
        accountId: string;
        gamertag?: string;
        lastUpdated?: Date;
        games: { game: string; playtime: number }[] | { game: GameDocument; playtime: number }[];
    }[];
    updatedAt: Date;
};

const DiscordUserSchema = new mongoose.Schema(
    {
        discordUserId: String,
        games: [
            {
                platform: String,
                accountId: String,
                gamertag: String,
                lastUpdated: { type: Date, default: Date.now },
                games: [{ game: { type: Schema.Types.ObjectId, ref: 'Game' }, playtime: Number }],
            },
        ],
    },
    { timestamps: true }
);

let DiscordUser: Model<DiscordUserDocument>;

export const getDiscordUserModel = (): mongoose.Model<DiscordUserDocument> => {
    try {
        DiscordUser = mongoose.model<DiscordUserDocument>('DiscordUser', DiscordUserSchema);
    } catch (e) {
        logger.debug(e);
    }
    return DiscordUser;
};
