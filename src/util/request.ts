import axios from 'axios';
import dotenv from 'dotenv';

import logger from './logger';

dotenv.config();
if (!process.env.STEAM_API_KEY) {
    logger.error('Missing Steam API key');
}
const STEAM_API_KEY = process.env.STEAM_API_KEY;

export async function getSteamId(username: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        axios
            .get(
                `http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${STEAM_API_KEY}&vanityurl=${username}`
            )
            .then((response) => {
                if (response.data.response.success === 1) {
                    resolve(response.data.response.steamid);
                } else {
                    resolve(username);
                }
            })
            .catch((error) => {
                logger.error(error);
                reject(error);
            });
    });
}

export async function getOwnedSteamGames(
    steamid: string
): Promise<{ steamAppIds: number[]; success: boolean }> {
    return new Promise<{ steamAppIds: number[]; success: boolean }>(
        (resolve, reject) => {
            axios
                .get(
                    `http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${STEAM_API_KEY}&steamid=${steamid}&format=json`
                )
                .then((response) => {
                    if (response.status === 200) {
                        resolve({
                            steamAppIds: response.data.response.games.map(
                                (game) => parseInt(game.appid, 10)
                            ),
                            success: true,
                        });
                    } else {
                        resolve({ steamAppIds: [], success: false });
                    }
                })
                .catch((error) => {
                    logger.error(error);
                    reject(error);
                });
        }
    );
}
