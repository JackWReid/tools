import MatchCard from './MatchCard.jsx';

function formatDateHeader(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function ListView({ matches }) {
  const grouped = {};
  for (const m of matches) {
    if (!grouped[m.date]) grouped[m.date] = [];
    grouped[m.date].push(m);
  }
  const dates = Object.keys(grouped).sort();
  return (
    <div>
      {dates.map(date => (
        <div key={date} style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: '#999', padding: '10px 0 6px', borderTop: '1px solid #f0f0f0' }}>
            {formatDateHeader(date)}
          </div>
          {grouped[date].map(m => <MatchCard key={m.id} match={m} showRound />)}
        </div>
      ))}
    </div>
  );
}
