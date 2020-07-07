# What Should We Play

[![Build Status](https://travis-ci.com/dunguyen/whatshouldweplay-discord.svg?branch=develop)](https://travis-ci.com/dunguyen/whatshouldweplay-discord)
[![Coverage Status](https://coveralls.io/repos/github/dunguyen/whatshouldweplay-discord/badge.svg)](https://coveralls.io/github/dunguyen/whatshouldweplay-discord)

Ever tried to get your friends to play a game but there's always someone who doesn't have it? Or tired of just playing CS:GO for the 8th night in the row? What Should We Play can provide you inspiration for your next multiplayer session.

The bot is easy to use. Simply type `wswp play` followed by steam ids and it will return a list of common owned multi-player games on the steam accounts.

Get it here: [Invite Link](https://discord.com/oauth2/authorize?client_id=710051076908515333&permissions=207872&scope=bot)

## Usage

All commands must be prefixed with `wswp` unless DM'ing the bot.

| Command name | Arguments | Notes |
|:-------------|:----------|:------|
| `help` | Optional: a command name | |
| `play` | @mentions or steam ids separated by space | If no arguments are provided, the bot will look at the people online and try to use their linked accounts |
| `link` | A steam id | This will link your Discord account with the steam id allowing you to use @mention in the `play` command |
| `unlink` | A linked gamertag found through the `showlinked` command | This will delete the link between a previously linked command and your Discord account |
| `showlinked` |  | Shows all linked gamertags with your Discord account |
| `updatedlinked` |  | Will update linked gamertags of your Discord account. This is not necessary to run as it will be done automatically from time to time but may be useful if you just bought games |
| `delete` | | Will delete all linked gamertags of your Discord account. |
| `prune` | | Will delete a number of previous messages written by the bot. Useful for cleaning up a channel. Can only be run by an admin |

## Privacy

Using the bot's link functionality will save the steam id and associated games and playing times. This information can be deleted through the `wswp delete` command.
Using the bot will save the discord id of the caller and the channel for analytics purposes.
By using the bot you agree this information will be saved.
