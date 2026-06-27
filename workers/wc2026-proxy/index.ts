export interface Env {
  WC2026: KVNamespace;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://tools.really.lol',
  'Access-Control-Allow-Methods': 'GET',
  'Cache-Control': 'public, max-age=300',
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }
    return Response.json(
      [{ espnId: 'test', homeTeam: 'Germany', awayTeam: 'Brazil', homeScore: 2, awayScore: 1,
         homePens: null, awayPens: null, status: 'completed', statusDetail: 'STATUS_FINAL',
         date: '2026-06-28T19:00:00Z' }],
      { headers: CORS_HEADERS }
    );
  },
};
