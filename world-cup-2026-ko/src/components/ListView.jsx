import MatchCard from './MatchCard.jsx';

const ROUND_LABELS = { R32: 'Round of 32', R16: 'Round of 16', QF: 'Quarter-finals', SF: 'Semi-finals', '3rd': 'Third-place match', F: 'Final' };
const ROUND_ORDER = ['R32', 'R16', 'QF', 'SF', '3rd', 'F'];

export default function ListView({ matches }) {
  const grouped = {};
  for (const m of matches) {
    if (!grouped[m.round]) grouped[m.round] = [];
    grouped[m.round].push(m);
  }
  return (
    <div>
      {ROUND_ORDER.filter(r => grouped[r]).map(round => (
        <div key={round} style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: '#999', padding: '10px 0 6px', borderTop: '1px solid #f0f0f0' }}>
            {ROUND_LABELS[round]}
          </div>
          {grouped[round].map(m => <MatchCard key={m.id} match={m} />)}
        </div>
      ))}
    </div>
  );
}
