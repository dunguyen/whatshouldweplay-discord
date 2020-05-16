import mongoose, { Model } from 'mongoose';
import logger from '../util/logger';

export type GameDocument = mongoose.Document & {
    type: string;
    name: string;
    steamAppId: number;
    isfree: boolean;
    dlc: string[];
    aboutTheGame: string;
    headerImage: string;
    website: string;
    legalNotice: string;
    developers: string[];
    publishers: string[];
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
    screenshots: {
        id: number;
        pathThumbnail: string;
        pathFull: string;
    }[];
    movies: {
        id: number;
        name: string;
        thumbnail: string;
        webm: {
            480: string;
            max: string;
        };
        highlight: boolean;
    }[];
    releaseDate: {
        comingSoon: boolean;
        date: string;
    };
    background: string;
};

const gameSchema = new mongoose.Schema(
    {
        type: String,
        name: String,
        steamAppId: Number,
        isFree: Boolean,
        dlc: [String],
        aboutTheGame: String,
        headerImage: String,
        website: String,
        legalNotice: String,
        developers: [String],
        publishers: [String],
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
        screenshots: [
            {
                id: Number,
                pathThumbnail: String,
                pathFull: String,
            },
        ],
        movies: [
            {
                id: Number,
                name: String,
                thumbnail: String,
                webm: {
                    480: String,
                    max: String,
                },
                highlight: Boolean,
            },
        ],
        releaseDate: {
            comingSoon: Boolean,
            date: String,
        },
        background: String,
    },
    { timestamps: true }
);

let Game: Model<GameDocument>;

export const getGameModel = () => {
    try {
        Game = mongoose.model<GameDocument>('Game', gameSchema);
    } catch (e) {
        logger.debug(e);
    }
    return Game;
};

export async function getGameObjectIdsFromSteamAppIds(
    steamAppIds: number[]
): Promise<string[]> {
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
