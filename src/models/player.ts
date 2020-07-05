import { Genre } from '../util/genre';
import { getOwnedSteamGames, getSteamId } from '../util/request';
import { getDiscordUserModel } from './discorduser';
import { GameDocument, getGameModel } from './game';

const DiscordUserModel = getDiscordUserModel();
const Game = getGameModel();
export class Player {
    steamUserId = '';
    discordUserId = '';
    games: Map<string, { game: GameDocument; playtime: number }>;

    constructor(steamUserId = '', discordUserId = '') {
        this.steamUserId = steamUserId;
        this.discordUserId = discordUserId;
        this.games = new Map<string, { game: GameDocument; playtime: number }>();
    }

    async populateGames(genre?: Genre): Promise<void> {
        if (this.steamUserId) {
            await this.populateSteamGames(genre);
        }
        if (this.discordUserId) {
            await this.populateDiscordGames(genre);
        }
    }

    private async populateSteamGames(genre?: Genre): Promise<void> {
        const id = await getSteamId(this.steamUserId);

        const steamGameIds = await getOwnedSteamGames(id);
        const steamAppIds = new Map<number, number>();
        steamGameIds.steamAppIds.forEach((x) => {
            steamAppIds.set(x.appId, x.playtime);
        });

        const gameFilter: {
            steamAppId: {
                $in: number[];
            };
            type: string;
            'categories.description': string;
            'genres.description'?: string;
        } = {
            steamAppId: { $in: Array.from(steamAppIds.keys()) },
            type: 'game',
            'categories.description': 'Multi-player',
        };

        if (genre) {
            gameFilter['genres.description'] = genre;
        }

        const games = await Game.find(gameFilter);
        games.forEach((game) => {
            if (steamAppIds.has(game.steamAppId)) {
                let playtime = steamAppIds.get(game.steamAppId);

                if (this.games.has(game.id)) {
                    playtime += this.games.get(game.id).playtime;
                }

                this.games.set(game.id, {
                    game: game,
                    playtime: playtime,
                });
            }
        });
    }

    private async populateDiscordGames(genre?: Genre): Promise<void> {
        const discordUserMatch: {
            type: string;
            'categories.description': string;
            'genres.description'?: string;
        } = {
            type: 'game',
            'categories.description': 'Multi-player',
        };

        if (genre) {
            discordUserMatch['genres.description'] = genre;
        }

        const discordUser = await DiscordUserModel.find({
            discordUserId: this.discordUserId,
        }).populate({
            path: 'games.games.game',
            match: discordUserMatch,
        });

        if (discordUser.length !== 1) {
            //TODO: Error
            return;
        }

        discordUser[0].games.forEach((game) => {
            game.games.forEach((g) => {
                if (!g.game) {
                    return;
                }
                //TODO: cast g into {game, playtime}
                let playtime = g.playtime;

                if (this.games.has(g.game.id)) {
                    playtime += this.games.get(g.game.id).playtime;
                }

                this.games.set(g.game.id, {
                    game: g.game,
                    playtime: playtime,
                });
            });
        });
    }

    hasGames(): boolean {
        return this.games.size > 0;
    }

    getUserIds(): string {
        if (this.steamUserId && this.discordUserId) {
            return `${this.steamUserId}/${this.getPrintableDiscordUserID()}`;
        } else if (this.steamUserId && !this.discordUserId) {
            return this.steamUserId;
        } else if (!this.steamUserId && this.discordUserId) {
            return this.getPrintableDiscordUserID();
        } else {
            return '';
        }
    }

    getPrintableDiscordUserID(): string {
        return `<@${this.discordUserId}> `;
    }
}
