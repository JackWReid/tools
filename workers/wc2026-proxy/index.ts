export interface Env {
  WC2026: KVNamespace;
}

const ESPN_SCOREBOARD = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard';
const ESPN_COMPETITIONS = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/competitions?dates=20260628-20260719';
const KV_KEY = 'matches';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://tools.really.lol',
  'Access-Control-Allow-Methods': 'GET',
  'Cache-Control': 'public, max-age=300',
};

export type NormalisedMatch = {
  espnId: string;
  homeTeam: string | null;
  awayTeam: string | null;
  homeScore: number | null;
  awayScore: number | null;
  homePens: number | null;
  awayPens: number | null;
  status: 'upcoming' | 'live' | 'completed';
  statusDetail: string;
  date: string;
};

export function normaliseESPN(raw: any): NormalisedMatch[] {
  return (raw.events ?? []).map((e: any) => {
    const comp = e.competitions?.[0];
    const home = comp?.competitors?.find((c: any) => c.homeAway === 'home');
    const away = comp?.competitors?.find((c: any) => c.homeAway === 'away');
    const statusName: string = comp?.status?.type?.name ?? 'STATUS_SCHEDULED';
    const completed: boolean = comp?.status?.type?.completed ?? false;
    const isLive: boolean = statusName === 'STATUS_IN_PROGRESS';

    const parseScore = (s: string | undefined): number | null => {
      if (!s || s === '') return null;
      const n = parseInt(s, 10);
      return isNaN(n) ? null : n;
    };

    return {
      espnId: String(e.id),
      homeTeam: home?.team?.displayName ?? null,
      awayTeam: away?.team?.displayName ?? null,
      homeScore: completed || isLive ? parseScore(home?.score) : null,
      awayScore: completed || isLive ? parseScore(away?.score) : null,
      homePens: null,
      awayPens: null,
      status: completed ? 'completed' : isLive ? 'live' : 'upcoming',
      statusDetail: statusName,
      date: e.date ?? '',
    };
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    let accumulated: Record<string, NormalisedMatch> = {};
    try {
      const stored = await env.WC2026.get(KV_KEY);
      if (stored) accumulated = JSON.parse(stored);
    } catch { /* KV read failure — proceed empty */ }

    try {
      const [sbRes, compRes] = await Promise.all([
        fetch(ESPN_SCOREBOARD),
        fetch(ESPN_COMPETITIONS),
      ]);
      const [sb, comp] = await Promise.all([sbRes.json(), compRes.json()]);
      for (const m of [...normaliseESPN(sb), ...normaliseESPN(comp)]) {
        if (m.espnId) accumulated[m.espnId] = m;
      }
      await env.WC2026.put(KV_KEY, JSON.stringify(accumulated));
    } catch { /* ESPN failure — return KV as-is */ }

    return Response.json(Object.values(accumulated), { headers: CORS_HEADERS });
  },
};
