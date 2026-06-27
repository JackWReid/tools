import { expect, test } from 'vitest';
import { mergeLiveData } from './mergeData.js';

const BASE = {
  id: 73, round: 'R32', date: '2026-06-28', time: '21:00',
  venue: 'Los Angeles', venueFull: 'Los Angeles (SoFi)',
  homeDesc: 'South Africa', awayDesc: 'Canada',
  homeTeam: 'South Africa', awayTeam: 'Canada',
  homeScore: null, awayScore: null, homePens: null, awayPens: null,
  status: 'upcoming', statusDetail: 'STATUS_SCHEDULED',
};

// 2026-06-28 21:00 CEST = 19:00 UTC
const LIVE = {
  espnId: 'e073', homeTeam: 'South Africa', awayTeam: 'Canada',
  homeScore: 1, awayScore: 0, homePens: null, awayPens: null,
  status: 'completed', statusDetail: 'STATUS_FINAL',
  date: '2026-06-28T19:00:00Z',
};

test('overlays score onto matching match', () => {
  const [m] = mergeLiveData([BASE], [LIVE]);
  expect(m.homeScore).toBe(1);
  expect(m.awayScore).toBe(0);
  expect(m.status).toBe('completed');
  expect(m.statusDetail).toBe('STATUS_FINAL');
});

test('preserves skeleton date/venue when merged', () => {
  const [m] = mergeLiveData([BASE], [LIVE]);
  expect(m.date).toBe('2026-06-28');
  expect(m.venue).toBe('Los Angeles');
});

test('returns skeleton unchanged when liveData is null', () => {
  const [m] = mergeLiveData([BASE], null);
  expect(m).toEqual(BASE);
});

test('does not mutate skeleton', () => {
  mergeLiveData([BASE], [LIVE]);
  expect(BASE.homeScore).toBeNull();
});

test('applies ESPN name mapping', () => {
  const live = { ...LIVE, homeTeam: 'United States', awayTeam: 'Canada' };
  const skeleton = [{ ...BASE, homeDesc: 'USA', homeTeam: 'USA' }];
  const [m] = mergeLiveData(skeleton, [live]);
  expect(m.homeTeam).toBe('USA');
});

test('no match when datetime differs by more than 5 minutes', () => {
  const wrongTime = { ...LIVE, date: '2026-06-28T12:00:00Z' };
  const [m] = mergeLiveData([BASE], [wrongTime]);
  expect(m.status).toBe('upcoming');
});
