# WC 2026 Knockout Tracker — Design Spec

_27 June 2026_

---

## Context

Companion to the group stage tool at `tools.really.lol/world-cup-2026`. The knockout stage runs 28 June–19 July 2026. This tool lives at `tools.really.lol/world-cup-2026-ko/` and is built as a standalone static React app deployed to Cloudflare Pages, with a Cloudflare Worker providing live match data.

---

## URL and Deployment

- **Frontend**: `tools.really.lol/world-cup-2026-ko/`
- **Worker**: `api.really.lol/wc2026`
- Vite `base`: `/world-cup-2026-ko/`
- Build output: `world-cup-2026-ko/dist/` → `dist/world-cup-2026-ko/`
- Worker config: `workers/wc2026-proxy/wrangler.toml` (separate from root `wrangler.toml`)

---

## Live Data Architecture

```
Browser → fetch('https://api.really.lol/wc2026') → CF Worker → ESPN API + KV → JSON → Browser
```

### Why KV from day 1

The ESPN `scoreboard` endpoint returns only current/recent matches. It does not return the full 32-game tournament window. Without KV, the app would lose access to past results as soon as ESPN's window moves on. KV acts as an accumulator: every result the Worker sees is persisted; the Worker always returns the full accumulated set.

### Worker behaviour

On each request the Worker:

1. Fetches ESPN `scoreboard` (live/recent) + `competitions?dates=20260628-20260719` (full fixture list)
2. Parses both responses into the normalised schema
3. Loads the current accumulated state from KV (`key: "matches"`)
4. Merges: new events overwrite existing entries by `espnId`; existing entries are preserved
5. Writes merged data back to KV
6. Returns merged data with `Cache-Control: public, max-age=300`

### ESPN endpoints

```
# Live/recent scores:
https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard

# Full tournament fixture list:
https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/competitions?dates=20260628-20260719
```

Verify the `competitions` endpoint works and returns the expected fields before finalising the Worker normalisation function.

### CORS

```
Access-Control-Allow-Origin: https://tools.really.lol
Access-Control-Allow-Methods: GET
```

### Fallback

If the Worker fetch fails (upstream or KV read error), the frontend falls back to the hardcoded skeleton. The app is never broken, just potentially stale.

---

## Data Model

### Normalised match (Worker output)

```typescript
type NormalisedMatch = {
  espnId: string;
  homeTeam: string | null;
  awayTeam: string | null;
  homeScore: number | null;
  awayScore: number | null;
  homePens: number | null;
  awayPens: number | null;
  status: 'upcoming' | 'live' | 'completed';
  statusDetail: string;  // ESPN status.type.description, e.g. "STATUS_FINAL", "STATUS_FINAL_AET", "STATUS_FINAL_PEN"
  date: string;  // ISO, e.g. "2026-06-28T19:00:00Z"
};
```

The `statusDetail` drives the badge text: `STATUS_FINAL_AET` → "AET", `STATUS_FINAL_PEN` → "Pen", otherwise "FT".

### Bracket skeleton (hardcoded in frontend)

```typescript
type Match = {
  id: number;           // FIFA match number (73–104)
  round: 'R32' | 'R16' | 'QF' | 'SF' | '3rd' | 'F';
  date: string;         // ISO, Berlin
  time: string;         // "HH:MM" Berlin (CEST = UTC+2)
  venue: string;        // City shortname
  venueFull: string;    // Full stadium name
  homeDesc: string;     // e.g. "Winner Group A" or "W73" — shown when team TBD
  awayDesc: string;
  // Populated by mergeLiveData():
  homeTeam: string | null;
  awayTeam: string | null;
  homeScore: number | null;
  awayScore: number | null;
  homePens: number | null;
  awayPens: number | null;
  status: 'upcoming' | 'live' | 'completed';
};
```

### Bracket tree

Each entry maps a match ID to the match it feeds into:

```typescript
const BRACKET_TREE: Record<number, { feeds: number; loserFeeds?: number }> = {
  // R32 → R16
  73: { feeds: 90 }, 75: { feeds: 90 },
  74: { feeds: 89 }, 77: { feeds: 89 },
  76: { feeds: 91 }, 78: { feeds: 91 },
  79: { feeds: 92 }, 80: { feeds: 92 },
  83: { feeds: 93 }, 84: { feeds: 93 },
  81: { feeds: 94 }, 82: { feeds: 94 },
  86: { feeds: 95 }, 88: { feeds: 95 },
  85: { feeds: 96 }, 87: { feeds: 96 },
  // R16 → QF
  89: { feeds: 97 }, 90: { feeds: 97 },
  91: { feeds: 98 }, 92: { feeds: 98 },
  93: { feeds: 99 }, 94: { feeds: 99 },
  95: { feeds: 100 }, 96: { feeds: 100 },
  // QF → SF
  97: { feeds: 101 }, 98: { feeds: 101 },
  99: { feeds: 102 }, 100: { feeds: 102 },
  // SF → Final / 3rd
  101: { feeds: 103, loserFeeds: 104 },
  102: { feeds: 103, loserFeeds: 104 },
};
```

> **Verify before coding**: R32 match numbers (73–88) and R16 (89–96) are confirmed by FIFA.
> QF (97–100), SF (101–102), 3rd (104), Final (103) are inferred. Check
> https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/knockout-stage-match-schedule-bracket
> and confirm the bracket tree before writing `bracketData.js`.

---

## R32 Bracket Skeleton

All times Berlin (CEST = UTC+2). Confirmed 27 June 2026.

| ID | Date | Time | Home | Away | Venue |
|----|------|------|------|------|-------|
| 73 | 2026-06-28 | 21:00 | South Africa | Canada | Los Angeles (SoFi) |
| 74 | 2026-06-29 | 23:00 | Germany | Best 3rd A/B/C/D/F | Boston (Gillette) |
| 75 | 2026-06-30 | 03:00 | Netherlands | Morocco | Monterrey (BBVA) |
| 76 | 2026-06-29 | 19:00 | Brazil | Japan | Houston (NRG) |
| 77 | 2026-06-30 | 07:00 | Group I winner | Best 3rd C/D/F/G/H | New York NJ (MetLife) |
| 78 | 2026-06-30 | 03:00 | Ivory Coast | Group I runner-up | Dallas (AT&T) |
| 79 | 2026-07-01 | 03:00 | Mexico | Best 3rd C/E/F/H/I | Mexico City (Azteca) |
| 80 | 2026-07-01 | 02:00 | Group L winner | Best 3rd E/H/I/J/K | Atlanta (Mercedes-Benz) |
| 81 | 2026-07-02 | 02:00 | USA | Bosnia and Herzegovina | San Francisco (Levi's) |
| 82 | 2026-07-02 | 02:00 | Group G winner | Best 3rd A/E/H/I/J | Seattle (Lumen) |
| 83 | 2026-07-02 | 21:00 | Spain | Runner-up J | Los Angeles (SoFi) |
| 84 | 2026-07-03 | 01:00 | Runner-up K | Runner-up L | Toronto (BMO) |
| 85 | 2026-07-03 | 05:00 | Switzerland | Best 3rd E/F/G/I/J | Vancouver (BC Place) |
| 86 | 2026-07-03 | 20:00 | Australia | Egypt | Dallas (AT&T) |
| 87 | 2026-07-03 | 00:00 | Argentina | Cape Verde | Miami (Hard Rock) |
| 88 | 2026-07-04 | 03:30 | Winner K | Best 3rd D/E/I/J/L | Kansas City (Arrowhead) |

> Group I, G, L final positions and best third-place slots resolve today (27 June). Update
> `bracketData.js` with confirmed team names before the first R32 match kicks off (28 June 21:00 Berlin).

### R16

| ID | Date | Time | Home | Away | Venue |
|----|------|------|------|------|-------|
| 89 | 2026-07-05 | 19:00 | W74 | W77 | Philadelphia (Lincoln Financial) |
| 90 | 2026-07-05 | 23:00 | W73 | W75 | Houston (NRG) |
| 91 | 2026-07-06 | 02:00 | W76 | W78 | New York NJ (MetLife) |
| 92 | 2026-07-06 | 02:00 | W79 | W80 | Mexico City (Azteca) |
| 93 | 2026-07-07 | 21:00 | W83 | W84 | Dallas (AT&T) |
| 94 | 2026-07-07 | 02:00 | W81 | W82 | Seattle (Lumen) |
| 95 | 2026-07-08 | 02:00 | W86 | W88 | Atlanta (Mercedes-Benz) |
| 96 | 2026-07-08 | 02:00 | W85 | W87 | Vancouver (BC Place) |

### QF (verify match numbers)

| ID | Date | Time | Home | Away | Venue |
|----|------|------|------|------|-------|
| 97 | 2026-07-10 | 21:00 | W89 | W90 | Dallas (AT&T) |
| 98 | 2026-07-11 | 01:00 | W91 | W92 | Seattle (Lumen) |
| 99 | 2026-07-11 | 21:00 | W93 | W94 | Atlanta (Mercedes-Benz) |
| 100 | 2026-07-12 | 01:00 | W95 | W96 | Vancouver (BC Place) |

### SF, 3rd, Final (verify match numbers)

| ID | Date | Time | Venue | Note |
|----|------|------|-------|------|
| 101 | 2026-07-14 | 21:00 | Dallas (AT&T) | SF 1 |
| 102 | 2026-07-15 | 21:00 | New York NJ (MetLife) | SF 2 |
| 103 | 2026-07-19 | 21:00 | New York NJ (MetLife) | Final |
| 104 | 2026-07-18 | 21:00 | Miami (Hard Rock) | 3rd place |

---

## File Structure

```
world-cup-2026-ko/
├── src/
│   ├── main.jsx
│   ├── App.jsx              # root: fetch, state, view toggle, filters
│   ├── data/
│   │   └── bracketData.js   # skeleton + bracket tree (merged)
│   ├── components/
│   │   ├── ListView.jsx
│   │   ├── BracketView.jsx
│   │   ├── MatchCard.jsx    # used in ListView
│   │   └── BracketSlot.jsx  # mini card used in BracketView
│   └── utils/
│       ├── mergeData.js     # mergeLiveData(skeleton, liveData) → Match[]
│       └── teamData.js      # MY_TEAMS, FLAGS, ESPN name map
├── workers/
│   └── wc2026-proxy/
│       ├── index.ts
│       └── wrangler.toml
├── public/
├── index.html
└── vite.config.js
```

`bracketTree.js` from the original plan is merged into `bracketData.js` — they're tightly coupled and separating them adds indirection without benefit.

---

## Frontend: App.jsx

### State

```javascript
const [liveData, setLiveData] = useState(null);
const [lastUpdated, setLastUpdated] = useState(null);
const [fetchError, setFetchError] = useState(false);
const [view, setView] = useState('list');       // 'list' | 'bracket'
const [myTeamsOnly, setMyTeamsOnly] = useState(false);
const [teamFilter, setTeamFilter] = useState('');
const [venueFilter, setVenueFilter] = useState('');

const matches = useMemo(() => mergeLiveData(BRACKET_SKELETON, liveData), [liveData]);
```

Filters applied in `useMemo` over `matches`. Skeleton never mutates.

### Fetch on load + Refresh button

`useEffect` fetches on mount. Refresh button re-fetches and updates `lastUpdated`. Error sets `fetchError`; on error, last-known `liveData` is preserved (not cleared). Show "Could not refresh — showing last data" in muted text when `fetchError` is true.

### Merge strategy

`mergeLiveData(skeleton, liveData)` joins on kickoff datetime:

```javascript
// For each skeleton match, construct its UTC kickoff timestamp:
//   new Date(match.date + 'T' + match.time + ':00+02:00').toISOString()
// Find the liveData entry whose date field matches (within a few minutes tolerance).
// Overlay: homeTeam, awayTeam, homeScore, awayScore, homePens, awayPens, status, statusDetail.
// Skeleton fields (date, time, venue, descriptors) are never overwritten.
// If no live entry found, match retains skeleton defaults (teams TBD, status 'upcoming').
```

Joining by datetime (not team name) handles TBD slots correctly: the kickoff time is always known even when teams are not.

ESPN team name → canonical name mapping lives in `teamData.js`:
```javascript
export const ESPN_NAME_MAP = {
  'United States': 'USA',
  "Côte d'Ivoire": 'Ivory Coast',
  // extend as needed during tournament
};
```

---

## List View

- Cards grouped by round (R32, R16, QF, SF, 3rd, Final)
- Each card: time (Berlin), home flag + name, score or "vs", away flag + name, venue, status badge
- Status badges: grey "Upcoming", amber "Live", green "FT" / "AET" / "Pen"
- Completed: winner name bold, card slightly dimmed
- TBD teams: descriptor in italics, muted colour
- My team matches: coloured left border + subtle background tint (same logic as group stage tool)
- Venue filter dropdown (list view only — bracket already shows venue per slot)
- My teams filter and team filter apply to both views

---

## Bracket View

Desktop only (hidden on mobile, replaced by list view message).

### Layout: CSS Grid

The bracket is a 9-column CSS Grid:

```
[R32-left] [R16-left] [QF-left] [SF-left] [Final/3rd] [SF-right] [QF-right] [R16-right] [R32-right]
```

Each column contains slots positioned by grid row. Slots are small cards (`BracketSlot`).

Left half (columns 1-4): Matches 73,74,75,76,85,86,87,88 → 89,90,91,92 → 97,98 → 101
Right half (columns 6-9, mirrored): Matches 77,78,79,80,81,82,83,84 → 93,94,95,96 → 99,100 → 102
Column 5: Final (103) centred, 3rd place (104) below

### Connector lines

An SVG element overlays the grid. After the bracket renders, `useEffect` reads the DOM positions of each `BracketSlot` and draws lines connecting match output → next match input. Lines are grey for upcoming paths, coloured (green) for completed paths where the winner is known.

### BracketSlot card

- Flag + name (or descriptor in italics if TBD)
- Score if played
- Winner highlighted (bold, coloured border)
- My team: small coloured dot in corner

### Filtering in bracket view

- My teams only: dims non-my-team slots (doesn't remove them — bracket structure must stay readable)
- Team filter: highlights that team's slot and draws their path through the bracket in a distinct colour

---

## My Teams

```javascript
export const MY_TEAMS = [
  { name: 'Switzerland', flag: '🇨🇭', color: { hex: '#d4202a', rgb: '212,32,42' } },
  { name: 'Scotland',    flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', color: { hex: '#003f7d', rgb: '0,63,125' } },
  { name: 'England',     flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', color: { hex: '#cf142b', rgb: '207,20,43' } },
  { name: 'Germany',     flag: '🇩🇪', color: { hex: '#1a1a1a', rgb: '26,26,26' } },
  { name: 'Norway',      flag: '🇳🇴', color: { hex: '#ef2b2d', rgb: '239,43,45' } },
  { name: 'France',      flag: '🇫🇷', color: { hex: '#002395', rgb: '0,35,149' } },
  { name: 'USA',         flag: '🇺🇸', color: { hex: '#b22234', rgb: '178,34,52' } },
];
```

Scotland may not qualify. If absent from the bracket, my-teams filter returns 0 matches — no error, just an empty state.

---

## Worker

`workers/wc2026-proxy/index.ts`:

```typescript
const ESPN_SCOREBOARD = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard';
const ESPN_COMPETITIONS = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/competitions?dates=20260628-20260719';
const KV_KEY = 'matches';
const CACHE_SECONDS = 300;

export interface Env {
  WC2026: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const corsHeaders = {
      'Access-Control-Allow-Origin': 'https://tools.really.lol',
      'Access-Control-Allow-Methods': 'GET',
      'Cache-Control': `public, max-age=${CACHE_SECONDS}`,
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const [scoreboardRes, competitionsRes] = await Promise.all([
        fetch(ESPN_SCOREBOARD),
        fetch(ESPN_COMPETITIONS),
      ]);

      const [scoreboard, competitions] = await Promise.all([
        scoreboardRes.json(),
        competitionsRes.json(),
      ]);

      const freshMatches = [
        ...normaliseESPN(scoreboard),
        ...normaliseESPN(competitions),
      ];

      // Load accumulated state
      const stored = await env.WC2026.get(KV_KEY);
      const accumulated: Record<string, NormalisedMatch> = stored
        ? JSON.parse(stored)
        : {};

      // Merge: fresh overwrites stale
      for (const m of freshMatches) {
        accumulated[m.espnId] = m;
      }

      await env.WC2026.put(KV_KEY, JSON.stringify(accumulated));

      return Response.json(Object.values(accumulated), { headers: corsHeaders });
    } catch (e) {
      // Fallback: return whatever is in KV, or empty
      const stored = await env.WC2026.get(KV_KEY).catch(() => null);
      const data = stored ? Object.values(JSON.parse(stored)) : [];
      return Response.json(data, {
        status: stored ? 200 : 502,
        headers: corsHeaders,
      });
    }
  },
};
```

`wrangler.toml` for the Worker:
```toml
name = "wc2026-proxy"
compatibility_date = "2025-01-01"
main = "index.ts"

[[kv_namespaces]]
binding = "WC2026"
id = "<KV namespace ID to create>"

[[routes]]
pattern = "api.really.lol/wc2026"
zone_name = "really.lol"
```

---

## Build Integration

Add to `build.sh`:

```bash
echo "Building world-cup-2026-ko..."
(cd world-cup-2026-ko && bun install --frozen-lockfile && bun run build)
cp -r world-cup-2026-ko/dist dist/world-cup-2026-ko
```

Add link in root `index.html`.

---

## Build Order

1. Verify FIFA match numbers (97-104) and update bracket tree if needed
2. Update R32 TBD slots with tonight's confirmed group results
3. Scaffold Vite app (`bun create vite@latest world-cup-2026-ko -- --template react`)
4. Create KV namespace, deploy Worker with hardcoded JSON response, verify CORS
5. Wire ESPN endpoints in Worker, verify `competitions` returns full fixture range
6. Build `bracketData.js` with full skeleton and bracket tree
7. Build `mergeData.js` + `teamData.js`
8. Build `ListView.jsx` + `MatchCard.jsx` (simpler, get end-to-end data flow working)
9. Build `BracketView.jsx` + `BracketSlot.jsx` with CSS Grid layout
10. Add SVG connector lines
11. Connect Refresh button, loading state, error state
12. Polish: status badges, AET/Pen display, my-teams dimming in bracket
13. Add to `build.sh`, deploy to Cloudflare Pages
14. Update group stage tool footer with link

---

## Out of Scope

- Match details / lineups / scorers
- Push notifications
- Mobile bracket view (list view serves mobile)
- Historical group stage results
- Authentication
