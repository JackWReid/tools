import { expect, test } from 'bun:test';
import { normaliseESPN } from './index';

const MOCK = {
  events: [
    {
      id: 'e001',
      date: '2026-06-28T19:00:00Z',
      competitions: [{
        competitors: [
          { homeAway: 'home', team: { displayName: 'Germany' }, score: '2' },
          { homeAway: 'away', team: { displayName: 'Brazil' }, score: '1' },
        ],
        status: { type: { completed: true, name: 'STATUS_FINAL' } },
      }],
    },
    {
      id: 'e002',
      date: '2026-06-29T21:00:00Z',
      competitions: [{
        competitors: [
          { homeAway: 'home', team: { displayName: 'Spain' }, score: '' },
          { homeAway: 'away', team: { displayName: 'France' }, score: '' },
        ],
        status: { type: { completed: false, name: 'STATUS_SCHEDULED' } },
      }],
    },
  ],
};

test('normalises completed match', () => {
  const [m] = normaliseESPN(MOCK);
  expect(m).toEqual({
    espnId: 'e001', homeTeam: 'Germany', awayTeam: 'Brazil',
    homeScore: 2, awayScore: 1, homePens: null, awayPens: null,
    status: 'completed', statusDetail: 'STATUS_FINAL', date: '2026-06-28T19:00:00Z',
  });
});

test('normalises upcoming match', () => {
  const [, m] = normaliseESPN(MOCK);
  expect(m.homeScore).toBeNull();
  expect(m.status).toBe('upcoming');
  expect(m.statusDetail).toBe('STATUS_SCHEDULED');
});

test('returns empty array for missing events', () => {
  expect(normaliseESPN({})).toEqual([]);
});
