import { canonicalName } from '../data/teamData.js';

const TOLERANCE_MS = 5 * 60 * 1000;

function kickoffMs(date, time) {
  return new Date(`${date}T${time}:00+02:00`).getTime();
}

export function mergeLiveData(skeleton, liveData) {
  if (!liveData || liveData.length === 0) return skeleton;

  const byTime = new Map();
  for (const entry of liveData) {
    if (entry.date) byTime.set(new Date(entry.date).getTime(), entry);
  }

  return skeleton.map(match => {
    const kms = kickoffMs(match.date, match.time);
    let live = null;
    for (const [ms, entry] of byTime) {
      if (Math.abs(ms - kms) <= TOLERANCE_MS) { live = entry; break; }
    }
    if (!live) return match;
    return {
      ...match,
      homeTeam: live.homeTeam ? canonicalName(live.homeTeam) : match.homeTeam,
      awayTeam: live.awayTeam ? canonicalName(live.awayTeam) : match.awayTeam,
      homeScore: live.homeScore,
      awayScore: live.awayScore,
      homePens: live.homePens,
      awayPens: live.awayPens,
      status: live.status,
      statusDetail: live.statusDetail,
    };
  });
}
