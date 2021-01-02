import mongoose, { Model } from 'mongoose';
import logger from '../util/logger';

export type GameDocument = mongoose.Document & {
    type: string;
    name: string;
    steamAppId: number;
    isFree: boolean;
    dlc: string[];
    fullgame: {
        appid: string;
        name: string;
    };
    plaforms: {
        windows: boolean;
        mac: boolean;
        linux: boolean;
    };
    categories: {
        id: number;
        description: string;
    }[];
    genres: {
        id: number;
        description: string;
    }[];
    metacritic: {
        score: number;
        url: string;
    };
    releaseDate: {
        comingSoon: boolean;
        date: string;
    };
    steamReviewScore: {
        reviewScore: number;
        totalPositive: number;
        totalNegative: number;
    };
    updatedAt: Date;
};

const gameSchema = new mongoose.Schema(
    {
        type: String,
        name: String,
        steamAppId: Number,
        isFree: Boolean,
        dlc: [String],
        fullgame: {
            appid: String,
            name: String,
        },
        plaforms: {
            windows: Boolean,
            mac: Boolean,
            linux: Boolean,
        },
        categories: [
            {
                id: Number,
                description: String,
            },
        ],
        genres: [
            {
                id: Number,
                description: String,
            },
        ],
        metacritic: {
            score: Number,
            url: String,
        },
        releaseDate: {
            comingSoon: Boolean,
            date: String,
        },
        steamReviewScore: {
            reviewScore: Number,
            totalPositive: Number,
            totalNegative: Number,
        },
        updatedAt: Date,
    },
    { timestamps: true }
);

let Game: Model<GameDocument>;

export const getGameModel = (): mongoose.Model<GameDocument> => {
    try {
        Game = mongoose.model<GameDocument>('Game', gameSchema);
    } catch (e) {
        logger.debug(e);
    }
    return Game;
};

export async function getGameObjectIdsFromSteamAppIds(steamAppIds: number[]): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) =>
        Game.find({ steamAppId: { $in: steamAppIds } })
            .then((games) => {
                resolve(games.map((game) => game.id));
            })
            .catch((error) => {
                reject(error);
            })
    );
}
