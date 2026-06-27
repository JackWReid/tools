import { MY_TEAM_MAP, FLAGS } from '../data/teamData.js';

const ROUND_PILL = { R32: 'R32', R16: 'R16', QF: 'QF', SF: 'SF', '3rd': '3rd', F: 'Final' };

function statusBadge(status, statusDetail) {
  if (status === 'live') return { text: 'Live', bg: '#ff6b00', color: '#fff' };
  if (status === 'completed') {
    const d = (statusDetail ?? '').toLowerCase();
    if (d.includes('pen') || d.includes('shoot')) return { text: 'Pen', bg: '#e8f5e9', color: '#2e7d32' };
    if (d.includes('aet') || d.includes('extra') || d.includes('overtime')) return { text: 'AET', bg: '#e8f5e9', color: '#2e7d32' };
    return { text: 'FT', bg: '#e8f5e9', color: '#2e7d32' };
  }
  return null;
}

export default function MatchCard({ match, showRound = false }) {
  const homeMyTeam = MY_TEAM_MAP[match.homeTeam];
  const awayMyTeam = MY_TEAM_MAP[match.awayTeam];
  const topTeam = homeMyTeam ?? awayMyTeam ?? null;

  const borderLeft = topTeam ? `3px solid ${topTeam.color.hex}` : '3px solid transparent';
  const borderOuter = topTeam ? `1px solid rgba(${topTeam.color.rgb},0.13)` : '1px solid #f0f0f0';
  const background = topTeam ? `rgba(${topTeam.color.rgb},0.04)` : '#fafafa';

  const isCompleted = match.status === 'completed';
  const hasScore = match.homeScore !== null && match.awayScore !== null;
  const winnerIsHome = isCompleted && hasScore &&
    (match.homeScore > match.awayScore || (match.homePens !== null && match.homePens > match.awayPens));
  const winnerIsAway = isCompleted && hasScore && !winnerIsHome && match.homeScore !== match.awayScore;
  const badge = statusBadge(match.status, match.statusDetail);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 12px', marginBottom: 4, borderRadius: 8,
      border: borderOuter, background, borderLeft,
      opacity: isCompleted ? 0.85 : 1,
    }}>
      <div style={{ fontSize: 13, color: '#888', minWidth: 46, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
        {match.time}
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', minWidth: 0 }}>
        <span style={{ fontSize: 15 }}>{FLAGS[match.homeTeam] ?? ''}</span>
        <span style={{ fontSize: 14, fontWeight: winnerIsHome ? 700 : homeMyTeam ? 600 : 400,
          color: winnerIsHome ? '#111' : '#444', fontStyle: match.homeTeam ? 'normal' : 'italic' }}>
          {match.homeTeam ?? match.homeDesc}
        </span>
        {!hasScore
          ? <span style={{ fontSize: 12, color: '#bbb', margin: '0 2px' }}>vs</span>
          : <span style={{ fontSize: 14, fontWeight: 700, color: '#111', margin: '0 4px', fontVariantNumeric: 'tabular-nums' }}>
              {match.homeScore}
              {match.homePens !== null && <span style={{ fontSize: 11, color: '#666' }}> ({match.homePens})</span>}
              {' – '}
              {match.awayScore}
              {match.awayPens !== null && <span style={{ fontSize: 11, color: '#666' }}> ({match.awayPens})</span>}
            </span>
        }
        <span style={{ fontSize: 15 }}>{FLAGS[match.awayTeam] ?? ''}</span>
        <span style={{ fontSize: 14, fontWeight: winnerIsAway ? 700 : awayMyTeam ? 600 : 400,
          color: winnerIsAway ? '#111' : '#444', fontStyle: match.awayTeam ? 'normal' : 'italic' }}>
          {match.awayTeam ?? match.awayDesc}
        </span>
      </div>
      {showRound && ROUND_PILL[match.round] && (
        <div style={{ fontSize: 11, padding: '2px 7px', borderRadius: 999,
          background: '#f0f0f0', color: '#888', fontWeight: 600, flexShrink: 0, whiteSpace: 'nowrap' }}>
          {ROUND_PILL[match.round]}
        </div>
      )}
      {badge && (
        <div style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999,
          background: badge.bg, color: badge.color, fontWeight: 700, flexShrink: 0 }}>
          {badge.text}
        </div>
      )}
      <div style={{ fontSize: 12, color: '#aaa', maxWidth: 120, overflow: 'hidden',
        textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0 }}>
        {match.venue}
      </div>
    </div>
  );
}
