# Captain's Call

CaptainAI is a playable T20 captaincy challenge: inspect the situation, choose a bowler, place nine fielders, set a bowling intention, lock your decision, explore tactical analysis and a baseline over simulation, then reveal the scripted outcome.

## Run locally

Requires Node.js 20.19+ or 22.12+ and pnpm (npm also works).

```sh
pnpm install
pnpm dev
```

Open http://localhost:3000. The Express server serves the API and Vite development UI together.

```sh
pnpm test
pnpm build
pnpm start
```

`start` serves the production build on `PORT` (default 3000). Build first. Deploy the complete project to a Node host: install dependencies, run `pnpm build`, and use `pnpm start` as the start command. No database is required. Hosting credentials/domain configuration are the only deployment requirements.

## Optional AI provider

Copy `.env.example` to `.env`. Set `OPENAI_API_KEY` to enable server-side LLM analysis; optionally set `OPENAI_MODEL` and `OPENAI_BASE_URL` for the compatible provider. Secrets are never sent to the browser. Without a key, or if the provider times out or returns malformed output, deterministic feedback is clearly labeled **Demo analysis**. All core interactions work without a key. The server validates analysis requests and response structure.

## Design and flow

The interface follows the supplied [Figma reference](https://www.figma.com/design/2Xz8lzxlKAac7gzhDRiQ6C), using green stadium colors, subtle glass surfaces, responsive cards, dark/light modes, and an SVG field. Drag fielders to named snap positions or select a fielder and tap a destination. Positions mirror with striker handedness. Presets, undo, and reset support experimentation; illegal configurations block locking. A locked decision preserves the bowler, field, intention, and reasoning. Recent decisions are saved in browser local storage. Locked reveal tokens are held in server memory (up to roughly 200 recent locks), so restarting the server requires a fresh lock; this demo has no database or authentication.

## Data, rules, and limitations

Bundled challenges are explicitly **illustrative**. Player identities, profiles, match situations, and outcomes are synthetic rather than claims about recorded matches. Reveals are labeled scripted scenario outcomes. The [Cricsheet download](https://cricsheet.org/downloads/) and [match-data](https://cricsheet.org/matches/) pages were inspected; their JSON match data is offered under the Open Data Commons Attribution licence. No bulk dataset was imported, so there are no unverified historical attributions or empirical distributions in this demo. No live-feed integration or historical field data is claimed. The app evaluates only information available before locking; outcome data stays behind the reveal API.

Supported rules follow the [ICC Men's T20I Playing Conditions, July 2025](https://images.icc-cricket.com/image/upload/prd/rz8dfczzfiwa0pwzmcs3.pdf), for an uninterrupted 20-over innings: four overs per bowler, no consecutive overs by the same bowler, at most two fielders outside the circle in overs 1–6 and five afterward, no more than five fielders on the leg side, and no more than two fielders behind square on the leg side. This is a named supported subset, not a general rules engine for every competition. Relevant clauses: 13.9 (bowler allocation), 17.6 (consecutive overs), 28.4 (behind square on the leg side), and 28.7 (circle restrictions). Reduced matches, substitute restrictions, slow-over-rate penalties, and competition-specific variants are unsupported. Named snap positions and the circle are coordinate abstractions.

The baseline simulator runs 2,000 seeded trials using **illustrative** delivery frequencies: dot 24%, single 30%, two 10%, four 16%, six 10%, wicket 7%, and one-run wide 3%. The same uncalibrated frequencies apply to all bowlers; bowler/context selection makes the run reproducible, not empirically player-specific. Odd legal runs and over endings change strike; striker wickets introduce a replacement in the same slot; wides add a run without consuming a legal ball. Simulations stop at the target, ten wickets, or 120 legal deliveries. No-balls, free hits, byes, leg byes, run-outs, multiple-run wides, and DLS are unsupported. It reports its simulation count, a runs distribution, estimated wicket chance, and example paths. Field placement affects tactical feedback only; it does not alter simulated boundary or win probabilities. Earlier economy alone is not evidence of death-over suitability. No calibrated win probability is supplied.

Captaincy points are a transparent game metric covering context, plan coherence, risk awareness, and remaining-over planning. They are not a scientifically validated measure of cricket IQ. Tactical quality and one observed/scripted outcome are separate.

## Project structure

- `src/domain.ts`: scenarios, field positions, restrictions, tactical feedback, scoring, and seeded simulation.
- `server.ts`: scenario/analysis/reveal APIs, provider adapter, and UI serving.
- `src/main.tsx`: decision journey and field interaction.
- `tests/domain.test.ts`: meaningful cricket-state and API contract checks.

See [DEMO.md](DEMO.md) for a walkthrough and [DREAM11.md](DREAM11.md) for the submission draft.






Inter font assets are from Google Fonts and licensed under the SIL Open Font License. Field SVG visual assets were extracted from the user-supplied Figma reference for this implementation.

Optional browser journey: install Playwright locally (or supply its module URL as PLAYWRIGHT_MODULE), ensure Microsoft Edge is installed, and run node tests/journey.mjs against the running development server. It checks desktop mouse dragging, mobile touch placement, field controls, locking, analysis, reveal, history, mirroring, theme, and overflow. Screenshots are written to the workspace.
