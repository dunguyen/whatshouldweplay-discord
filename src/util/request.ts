import axios from 'axios';

import { STEAM_API_KEY } from './config';
import logger from './logger';

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
): Promise<{ steamAppIds: number[]; success: boolean; id: string }> {
    return new Promise<{ steamAppIds: number[]; success: boolean; id: string }>((resolve, reject) => {
        axios
            .get(
                `http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${STEAM_API_KEY}&steamid=${steamid}&format=json`
            )
            .then((response) => {
                if (response.status === 200) {
                    resolve({
                        steamAppIds: response.data.response.games.map(
                            (game: {
                                appid: string;
                                playtime_forever: string;
                                playtime_windows_forever: string;
                                playtime_mac_forever: string;
                                playtime_linux_forever: string;
                            }) => parseInt(game.appid, 10)
                        ),
                        success: true,
                        id: steamid,
                    });
                } else {
                    resolve({ steamAppIds: [], success: false, id: steamid });
                }
            })
            .catch((error) => {
                if (error.response.status === 500) {
                    resolve({ steamAppIds: [], success: false, id: steamid });
                }
                logger.error(error);
                reject(error);
            });
    });
}

export async function getSteamGamerTag(steamid: string): Promise<{ steamGamerTag: string; success: boolean }> {
    return new Promise<{ steamGamerTag: string; success: boolean }>((resolve, reject) => {
        axios
            .get(
                `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${steamid}`
            )
            .then((response) => {
                if (response.status === 200 && response.data.response.players.length > 0) {
                    resolve({
                        steamGamerTag: response.data.response.players[0].personaname,
                        success: true,
                    });
                } else {
                    resolve({ steamGamerTag: '', success: false });
                }
            })
            .catch((error) => {
                logger.error(error);
                reject(error);
            });
    });
}
