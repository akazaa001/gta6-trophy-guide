# Leonida Trophy Guide — GTA VI (PS5)

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/akazaa001/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/akazaa001/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for all 55 Grand Theft Auto VI trophies on PlayStation 5 — 1 platinum, 2 gold, 6 silver, 46 bronze. Every trophy shows its official name, description and grade, a guide written in our own words with its sources named beside it, and a checklist that saves your progress in the browser.

## What it does

- **Checklist tracker** — tick trophies off as you earn them; progress is saved in localStorage, with export to a file and import back.
- **Filters** — by kind (story, missable, collectibles, activities, online), by grade, and by search.
- **Spoiler setting** — hides the names and descriptions of story trophies until you earn them.
- **Roadmap to the platinum** — seven stages in play order, from the story chapters through a missable sweep before the final mission to collectibles and activities, with all 9 missable trophies flagged.
- **Cited guides** — each guide names its sources (the Exophase and PSNProfiles trophy lists). Where the official description is the only published fact about a trophy, the guide says so instead of inventing a mission name, a location or a step.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. Everything runs offline from the files in `app/` — no network requests, no account, no uploads. Your progress never leaves your browser.

## How it is sourced

Names, descriptions, grades and counts are the official PlayStation 5 list as published, checked against the [Exophase trophy list](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/) and [PSNProfiles](https://psnprofiles.com/trophies/43531-grand-theft-auto-vi). Missable flags are cautions built from the official descriptions: a trophy is flagged when it is tied to story progress (a partner, a character strand, a story choice), so finish it before the final mission.

An unofficial fan guide. Not affiliated with Rockstar Games or PlayStation. No Rockstar logo, artwork or game screenshots are used; the look is our own.

<sub>Entered on [make.fun](https://make.fun/?ref=6ampry0e&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards · Try make.fun: https://make.fun/r/6ampry0e</sub>
