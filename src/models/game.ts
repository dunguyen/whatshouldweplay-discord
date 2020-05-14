import mongoose, { Model } from 'mongoose';
import logger from '../util/logger';

export type GameDocument = mongoose.Document & {
    type: string;
    name: string;
    steamAppId: number;
    requiredAge: number;
    isfree: boolean;
    dlc: string[];
    detailedDescription: string;
    aboutTheGame: string;
    supportedLanguages: string;
    reviews: string;
    headerImage: string;
    website: string;
    pcRequirements: {
        minimum: string;
        recommended: string;
    };
    macRequirements: {
        minimum: string;
        recommended: string;
    };
    linuxRequirements: {
        minimum: string;
        recommended: string;
    };
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
    achievements: {
        total: number;
    };
    releaseDate: {
        comingSoon: boolean;
        date: string;
    };
    supportInfo: {
        url: string;
        email: string;
    };
    background: string;
};

const gameSchema = new mongoose.Schema(
    {
        type: String,
        name: String,
        steamAppId: Number,
        requiredAge: Number,
        isFree: Boolean,
        dlc: [String],
        detailedDescription: String,
        aboutTheGame: String,
        supportedLanguages: String,
        reviews: String,
        headerImage: String,
        website: String,
        pcRequirements: {
            minimum: String,
            recommended: String,
        },
        macRequirements: {
            minimum: String,
            recommended: String,
        },
        linuxRequirements: {
            minimum: String,
            recommended: String,
        },
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
        achievements: {
            total: Number,
        },
        releaseDate: {
            comingSoon: Boolean,
            date: String,
        },
        supportInfo: {
            url: String,
            email: String,
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
