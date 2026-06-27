# World Cup 2026 Knockout Tracker — PLAN.md

Bootstrap document for a Claude Code session. Read this fully before writing any code.

---

## Context

This is the knockout-stage companion to the group stage schedule already live at
`tools.really.lol/world-cup-2026`. That tool is a React JSX artifact. This new tool
should live at `tools.really.lol/world-cup-2026/knockout` (or similar) and be built
as a standalone static React app, deployable via Cloudflare Pages.

The tournament runs **28 June – 19 July 2026**. Today is 27 June — the R32 starts
tomorrow. Group stage final results are being confirmed tonight so some R32 teams may
still be TBD when we first deploy.

---

## Architecture decision: how data stays live

**Problem:** This is a static site. There is no server. Results need to update as the
tournament progresses through R32 → R16 → QF → SF → Final over three weeks.

**Chosen approach: Cloudflare Worker proxy → ESPN public JSON**

ESPN exposes undocumented but stable JSON endpoints (used by dozens of third-party apps)
that return live fixture/result data without auth. Direct browser fetches are blocked by
CORS, so a Cloudflare Worker acts as a thin proxy.

```
Browser → fetch('https://api.really.lol/wc2026') → CF Worker → ESPN API → JSON → Browser
```

**Why this over alternatives:**
- No API key exposure in client code
- ESPN data updates within minutes of final whistle
- CF Worker is ~25 lines, deploys in seconds, lives on the same zone as the site
- 5-minute Cache-Control on Worker response avoids hammering ESPN
- If ESPN schema breaks, fix is in one place (the Worker)
- No need for manual redeployment of the static site at any point during the tournament

**ESPN endpoint to target:**
```
https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard
```
Returns current/recent fixtures with scores. Also useful:
```
https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event={id}
```

The Worker must handle: CORS headers, caching (Cache-Control + optional CF edge cache),
error passthrough, and normalising the ESPN response into the internal schema (see below).

**Fallback behaviour:** If the Worker fetch fails, the app falls back to the hardcoded
bracket skeleton (all dates/venues/matchup descriptors are known; only team names and
scores are live data). This means the app is never broken, just potentially stale.

**No polling.** Data fetches on page load only, plus a manual Refresh button. No
setInterval. No WebSocket. The tournament produces at most 2-3 results per day; polling
is unnecessary overhead.

---

## Data model

The full bracket skeleton is **fully deterministic** from the moment the group stage
ended (27 June). All dates, venues, and match-to-match progression paths are pre-set by
FIFA. Only team names and scores fill in over time. Model this explicitly.

### Match schema

```typescript
type Team = {
  name: string;          // e.g. "Germany" or null if TBD
  flag: string;          // emoji flag or ""
  isMyTeam: boolean;
};

type Match = {
  id: number;            // FIFA match number (73–104)
  round: 'R32' | 'R16' | 'QF' | 'SF' | '3rd' | 'F';
  date: string;          // ISO date, Berlin time
  time: string;          // "HH:MM" Berlin (CEST = UTC+2)
  venue: string;         // City name
  venueFull: string;     // Full stadium name
  home: Team | null;     // null = TBD
  away: Team | null;
  homeScore: number | null;
  awayScore: number | null;
  homePens: number | null;   // penalty shootout score if applicable
  awayPens: number | null;
  status: 'upcoming' | 'live' | 'completed';
  winnerSlot: string;    // e.g. "W73" — used to link bracket tree
  // For TBD slots, store the descriptor:
  homeDesc: string;      // e.g. "Winner Group A" or "W73" or "Best 3rd E/F/G/I/J"
  awayDesc: string;
};
```

### Bracket tree

The bracket is a **fixed directed graph**. Every match has two input slots and one
output slot. Define this as a static lookup:

```typescript
const BRACKET_TREE: Record<number, { feeds: number }> = {
  // R32 winners feed R16
  73: { feeds: 90 }, 75: { feeds: 90 },
  74: { feeds: 89 }, 77: { feeds: 89 },
  76: { feeds: 91 }, 78: { feeds: 91 },
  79: { feeds: 92 }, 80: { feeds: 92 },
  83: { feeds: 93 }, 84: { feeds: 93 },
  81: { feeds: 94 }, 82: { feeds: 94 },
  86: { feeds: 95 }, 88: { feeds: 95 },
  85: { feeds: 96 }, 87: { feeds: 96 },
  // R16 winners feed QF
  89: { feeds: 97 }, 90: { feeds: 97 },   // confirm actual QF match numbers
  91: { feeds: 98 }, 92: { feeds: 98 },
  93: { feeds: 99 }, 94: { feeds: 99 },
  95: { feeds: 100 }, 96: { feeds: 100 },
  // QF winners feed SF
  97: { feeds: 101 }, 98: { feeds: 101 },
  99: { feeds: 102 }, 100: { feeds: 102 },
  // SF losers feed 3rd place
  101: { feeds: 103, loserFeeds: 104 },
  102: { feeds: 103, loserFeeds: 104 },
  // Match 103 = Final, Match 104 = 3rd place
};
```

> **Note:** Cross-check the QF/SF/Final match numbers against FIFA's confirmed schedule
> before coding. The R32/R16 numbers above (73–96) are confirmed from FIFA's bracket
> article. Derive QF (97–100), SF (101–102), 3rd (103), Final (104) from the same source.

---

## Full R32 bracket skeleton (hardcoded seed data)

All times converted to Berlin (CEST = UTC+2). All confirmed as of 27 June 2026.

| Match | Date | Berlin time | Home | Away | Venue |
|-------|------|-------------|------|------|-------|
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

> **Note on TBD slots:** As of 27 June, Group I winner/runner-up, Group G winner, Group L
> winner, Runner-up J, Runner-up K/L, Winner K are TBD pending final group matches today.
> These will resolve before Match 77 kicks off. The Worker fetch will fill them in. Until
> then, the app should display the descriptor string (e.g. "Winner Group I").

### R16 skeleton

| Match | Date | Berlin time | Home | Away | Venue |
|-------|------|-------------|------|------|-------|
| 89 | 2026-07-05 | 19:00 | W74 | W77 | Philadelphia (Lincoln Financial) |
| 90 | 2026-07-05 | 23:00 | W73 | W75 | Houston (NRG) |
| 91 | 2026-07-06 | 02:00 | W76 | W78 | New York NJ (MetLife) |
| 92 | 2026-07-06 | 02:00 | W79 | W80 | Mexico City (Azteca) |
| 93 | 2026-07-07 | 21:00 | W83 | W84 | Dallas (AT&T) |
| 94 | 2026-07-07 | 02:00 | W81 | W82 | Seattle (Lumen) |
| 95 | 2026-07-08 | 02:00 | W86 | W88 | Atlanta (Mercedes-Benz) |
| 96 | 2026-07-08 | 02:00 | W85 | W87 | Vancouver (BC Place) |

### QF skeleton

| Match | Date | Berlin time | Home | Away | Venue |
|-------|------|-------------|------|------|-------|
| 97 | 2026-07-10 | 21:00 | W89 | W90 | Dallas (AT&T) |
| 98 | 2026-07-11 | 01:00 | W91 | W92 | Seattle (Lumen) |  
| 99 | 2026-07-11 | 21:00 | W93 | W94 | Atlanta (Mercedes-Benz) |
| 100 | 2026-07-12 | 01:00 | W95 | W96 | Vancouver (BC Place) |

> **Note:** QF match numbers and exact times need verification against FIFA's confirmed
> schedule. The above is inferred from the bracket tree. Verify before hardcoding.

### SF, 3rd place, Final

| Match | Date | Berlin time | Venue |
|-------|------|-------------|-------|
| 101 | 2026-07-14 | 21:00 | Dallas (AT&T) |
| 102 | 2026-07-15 | 21:00 | New York NJ (MetLife) |
| 103 | 2026-07-19 | 21:00 | New York NJ (MetLife) — **Final** |
| 104 | 2026-07-18 | 21:00 | Miami (Hard Rock) — **3rd place** |

> Match numbers for SF/3rd/Final also need verification. FIFA's article confirms the
> venues and dates; match numbers are inferred.

---

## Cloudflare Worker

Create `workers/wc2026-proxy/index.ts`:

```typescript
const ESPN_URL = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard';
const CACHE_SECONDS = 300; // 5 minutes

export default {
  async fetch(request: Request): Promise<Response> {
    const corsHeaders = {
      'Access-Control-Allow-Origin': 'https://tools.really.lol',
      'Access-Control-Allow-Methods': 'GET',
      'Cache-Control': `public, max-age=${CACHE_SECONDS}`,
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const res = await fetch(ESPN_URL);
      const data = await res.json();
      const normalised = normaliseESPN(data);
      return Response.json(normalised, { headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: 'upstream_failed' }), {
        status: 502,
        headers: corsHeaders,
      });
    }
  },
};

function normaliseESPN(raw: any): NormalisedMatch[] {
  // Map ESPN events to internal match schema
  // ESPN event.id maps to FIFA match number via name/date matching
  // Key fields: event.name, event.date, event.competitions[0].competitors,
  //             event.competitions[0].status.type.completed
  // Return array of { id, homeTeam, awayTeam, homeScore, awayScore, status }
  // The static bracket skeleton in the frontend merges this by match id
  return raw.events?.map((e: any) => {
    const comp = e.competitions?.[0];
    const home = comp?.competitors?.find((c: any) => c.homeAway === 'home');
    const away = comp?.competitors?.find((c: any) => c.homeAway === 'away');
    return {
      espnId: e.id,
      homeTeam: home?.team?.displayName ?? null,
      awayTeam: away?.team?.displayName ?? null,
      homeScore: home?.score ? parseInt(home.score) : null,
      awayScore: away?.score ? parseInt(away.score) : null,
      status: comp?.status?.type?.completed ? 'completed'
             : comp?.status?.type?.name === 'STATUS_IN_PROGRESS' ? 'live'
             : 'upcoming',
      date: e.date,
    };
  }) ?? [];
}
```

Deploy route: `api.really.lol/wc2026` → this Worker.

**Important:** The ESPN API returns events by current date window, not the full
tournament. Test whether it returns future fixtures or only recent/live ones. If it only
returns recent events, the Worker may need to store a running accumulator in KV storage,
merging new results with previously-seen ones. This is the main unknown to test early.

---

## Frontend: React app

### Tech stack

Stick with the same approach as the group stage tool: a single `.jsx` file, React with
hooks, inline styles (properly using `rgba()` — not 8-digit hex alpha). No build step
needed for the artifact version; for `tools.really.lol` deployment, use Vite.

If deploying standalone (recommended for the live site), scaffold with:
```bash
npm create vite@latest wc2026-knockout -- --template react
```

### Views

Two views toggled by a tab/button control:

**1. List view** (default on mobile, available on desktop)
- Same card design as the group stage tool
- Grouped by round (R32, R16, QF, SF, Final/3rd)
- Each card shows: time (Berlin), home team + flag, score or "vs", away team + flag,
  venue, status badge (Upcoming / Live / FT)
- Completed matches: show score, dim slightly, winner's name bolded
- TBD teams: show descriptor in italics, muted colour ("Winner Group I")
- My teams highlight: coloured left border, green background tint

**2. Bracket view** (desktop only, hidden/replaced with list on mobile)
- Classic left-right mirrored layout
- Left half: matches 73/74/75/76/85/86/87/88 → feeding left side of R16 → left QF → left SF
- Right half: matches 77/78/79/80/81/82/83/84 → right R16 → right QF → right SF
- Both halves converge at the Final in the centre
- 3rd place match sits below the Final
- Each bracket slot is a small card: flag + name (or descriptor), score if played
- Winner of each match highlighted/bolded, a connector line leads to their next slot
- Completed paths: draw the connecting lines in a saturated colour; pending paths grey
- My teams: coloured dot/border on their slot card throughout the bracket

### Filters (both views)

- **My teams toggle** — same prominent green pill button as group stage tool. Filters
  list view to only matches involving Switzerland/Scotland/England/Germany/Norway/France/USA.
  In bracket view, dims all non-my-team slots rather than removing them.
- **Team filter** — dropdown, all teams (populated from bracket data). In bracket view,
  highlights that team's path through the bracket.
- **Venue filter** — dropdown. List view only (bracket already shows venue per slot).
- No group/date sort (irrelevant for knockouts).

### Refresh button

- Sits in the header next to the title
- On click: re-fetches from the Worker, merges results into bracket state
- Shows a spinner during fetch, "Updated just now" / "Updated 3 min ago" afterwards
- On Worker failure: shows "Could not update — showing last known data" in muted text
- Also fetches on initial page load (no manual intervention needed for first paint)

### State management

No Redux or external state library. Local React state only:

```javascript
const [bracketData, setBracketData] = useState(INITIAL_BRACKET); // hardcoded skeleton
const [liveData, setLiveData] = useState(null);   // null = not yet fetched
const [lastUpdated, setLastUpdated] = useState(null);
const [fetchError, setFetchError] = useState(false);

// Derived state: merge skeleton + live data
const matches = useMemo(() => mergeLiveData(bracketData, liveData), [bracketData, liveData]);
```

`mergeLiveData` takes the hardcoded skeleton (dates, venues, bracket tree, descriptors)
and overlays team names and scores from the Worker response. Match ID is the join key.
The skeleton never mutates; all live info is layered on top.

---

## File structure

```
wc2026-knockout/
├── src/
│   ├── main.jsx
│   ├── App.jsx              # root: fetch, state, view toggle
│   ├── data/
│   │   ├── bracketSkeleton.js   # hardcoded match data (dates/venues/descriptors)
│   │   ├── bracketTree.js       # match-to-match progression graph
│   │   └── myTeams.js           # team list, flags, priority colours
│   ├── components/
│   │   ├── ListView.jsx
│   │   ├── BracketView.jsx
│   │   ├── MatchCard.jsx        # shared between both views
│   │   ├── BracketSlot.jsx      # bracket-specific mini card
│   │   └── Filters.jsx
│   └── utils/
│       ├── mergeData.js         # mergeLiveData function
│       └── formatters.js        # date/time formatting, Berlin timezone
├── workers/
│   └── wc2026-proxy/
│       └── index.ts
├── public/
├── index.html
├── vite.config.js
└── wrangler.toml                # CF Worker config
```

---

## My teams config

Carry over exactly from the group stage tool:

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

As of 27 June: Scotland are on the bubble for qualifying as a best third-placed team.
The app should handle their presence or absence gracefully — i.e. if Scotland don't
appear in any bracket slot, the my-teams filter simply returns 0 matches for them,
no errors.

---

## Deployment

**Static site:** Cloudflare Pages connected to the repo. Build command: `npm run build`.
Output: `dist/`. Route: `tools.really.lol/world-cup-2026/knockout` (or a subdirectory
redirect from the existing group stage page).

**Worker:** Deploy via `wrangler deploy` from `workers/wc2026-proxy/`. Bind to
`api.really.lol/wc2026`. Add CORS origin for `tools.really.lol`.

**Environment:** No env vars needed in the frontend (Worker URL is the only external
dependency and can be hardcoded as a constant). Worker has no secrets (ESPN is public).

---

## Known unknowns / things to verify before coding

1. **ESPN endpoint date windowing** — does `scoreboard` return all WC knockout fixtures
   or only current-day ones? Test immediately. If only current-day: either use a different
   ESPN endpoint (`/competitions?dates=20260628-20260719`) or implement KV accumulation
   in the Worker.

2. **QF/SF/Final match numbers** — FIFA's bracket article confirms R32 (73–88) and R16
   (89–96) match numbers explicitly. QF/SF/Final numbers (97–104) are inferred. Verify
   against `https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/knockout-stage-match-schedule-bracket`
   before hardcoding the bracket tree.

3. **3rd-place TBD slots** — the "Best 3rd X/Y/Z" slots in R32 resolve tonight (27 June)
   when all group matches finish. By the time you start coding Monday, these should be
   known. Pull the current state before seeding `bracketSkeleton.js`.

4. **ESPN team name normalisation** — ESPN may use different team name strings than the
   group stage tool (e.g. "United States" vs "USA", "Côte d'Ivoire" vs "Ivory Coast").
   The Worker's `normaliseESPN` function needs a name map. Keep it in `myTeams.js` or a
   separate `teamNameMap.js`.

5. **Bracket view layout complexity** — the 16-match R32 feeding into 8 R16 matches
   feeding into 4 QF feeding into 2 SF into 1 Final is a relatively standard bracket.
   Use absolute positioning or CSS grid for the bracket layout. SVG connector lines are
   the cleanest approach for the paths between rounds. Consider a library like
   `react-tournament-bracket` or build it manually — manual is probably 2 hours of CSS
   and avoids a dependency.

---

## What to build first (suggested order)

1. Scaffold Vite app, get it deploying to CF Pages as a blank page
2. Deploy Worker with a hardcoded JSON response, verify CORS from the Pages domain
3. Wire up ESPN endpoint in Worker, verify the response schema
4. Build `bracketSkeleton.js` with all hardcoded data (verify match numbers first)
5. Build `mergeLiveData` and write unit tests against a mock ESPN response
6. Build List view (simpler, reuses patterns from group stage tool)
7. Build Filters component
8. Build Bracket view (start desktop-only, no mobile needed)
9. Connect Refresh button and loading/error states
10. Polish: my teams highlighting in bracket view, score display, "FT" / "AET" / "Pen" badges

---

## Out of scope for this build

- Match details / lineups / scorers
- Push notifications for my-team results
- Historical group stage results (separate page already exists)
- Mobile bracket view (list view serves mobile)
- Authentication / user accounts