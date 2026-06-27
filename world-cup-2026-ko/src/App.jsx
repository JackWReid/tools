import { useState, useMemo, useEffect, useCallback } from 'react';
import { BRACKET_SKELETON } from './data/bracketData.js';
import { MY_TEAMS, MY_TEAM_NAMES } from './data/teamData.js';
import { mergeLiveData } from './utils/mergeData.js';
import ListView from './components/ListView.jsx';
import BracketView from './components/BracketView.jsx';

const WORKER_URL = 'https://api.really.lol/wc2026';

function timeSince(ms) {
  const s = Math.floor((Date.now() - ms) / 1000);
  if (s < 60) return 'just now';
  return `${Math.floor(s / 60)} min ago`;
}

export default function App() {
  const [liveData, setLiveData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [fetchError, setFetchError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('list');
  const [myTeamsOnly, setMyTeamsOnly] = useState(false);
  const [teamFilter, setTeamFilter] = useState('');
  const [venueFilter, setVenueFilter] = useState('');
  const [, setTick] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => { setIsMobile(window.innerWidth < 768); }, []);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  const fetchLive = useCallback(async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const res = await fetch(WORKER_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setLiveData(await res.json());
      setLastUpdated(Date.now());
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLive(); }, [fetchLive]);

  const matches = useMemo(() => mergeLiveData(BRACKET_SKELETON, liveData), [liveData]);

  const allTeams = useMemo(() =>
    [...new Set(matches.flatMap(m => [m.homeTeam, m.awayTeam]).filter(Boolean))].sort()
  , [matches]);

  const allVenues = useMemo(() =>
    [...new Set(BRACKET_SKELETON.map(m => m.venue))].sort()
  , []);

  const filtered = useMemo(() => matches.filter(m => {
    if (myTeamsOnly && !MY_TEAM_NAMES.has(m.homeTeam) && !MY_TEAM_NAMES.has(m.awayTeam)) return false;
    if (teamFilter && m.homeTeam !== teamFilter && m.awayTeam !== teamFilter) return false;
    if (venueFilter && m.venue !== venueFilter) return false;
    return true;
  }), [matches, myTeamsOnly, teamFilter, venueFilter]);

  const activeFilters = myTeamsOnly || teamFilter || venueFilter;

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 840, margin: '0 auto', padding: '20px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', marginBottom: 4 }}>
              FIFA World Cup 2026
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#111', lineHeight: 1.2 }}>
              Knockout stage
            </h1>
            <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>
              32 matches · All times Berlin (CEST, UTC+2)
              {lastUpdated && !fetchError && <span> · Updated {timeSince(lastUpdated)}</span>}
              {fetchError && <span style={{ color: '#c0392b' }}> · Could not refresh — showing last data</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={fetchLive} disabled={loading} style={{
              padding: '8px 14px', borderRadius: 8, border: '1px solid #ddd',
              background: '#fff', color: '#333', fontWeight: 600, fontSize: 13, cursor: 'pointer',
              opacity: loading ? 0.5 : 1,
            }}>
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
            <button onClick={() => setMyTeamsOnly(v => !v)} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 999,
              border: myTeamsOnly ? '2px solid #1a6b3a' : '2px solid #ddd',
              background: myTeamsOnly ? '#1a6b3a' : '#fff',
              color: myTeamsOnly ? '#fff' : '#333',
              fontWeight: 600, fontSize: 13, cursor: 'pointer',
              boxShadow: myTeamsOnly ? '0 2px 8px rgba(26,107,58,0.3)' : 'none',
            }}>
              ⭐ My teams
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
          {MY_TEAMS.map(t => (
            <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#555' }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: t.color.hex, flexShrink: 0 }} />
              {t.flag} {t.name}
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #eee' }}>
        <div style={{ display: 'flex', gap: 2, marginRight: 8 }}>
          {(['list', ...(!isMobile ? ['bracket'] : [])]).map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              fontSize: 12, padding: '5px 12px', borderRadius: 6, border: '1px solid #ddd', cursor: 'pointer',
              background: view === v ? '#111' : '#fff', color: view === v ? '#fff' : '#555',
              fontWeight: view === v ? 600 : 400,
            }}>
              {v === 'list' ? 'List' : 'Bracket'}
            </button>
          ))}
        </div>
        <select value={teamFilter} onChange={e => setTeamFilter(e.target.value)}
          style={{ fontSize: 13, padding: '5px 8px', borderRadius: 6, border: teamFilter ? '1.5px solid #1a6b3a' : '1px solid #ddd', background: '#fff', color: '#222', cursor: 'pointer' }}>
          <option value="">All teams</option>
          {allTeams.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        {view === 'list' && (
          <select value={venueFilter} onChange={e => setVenueFilter(e.target.value)}
            style={{ fontSize: 13, padding: '5px 8px', borderRadius: 6, border: venueFilter ? '1.5px solid #1a6b3a' : '1px solid #ddd', background: '#fff', color: '#222', cursor: 'pointer' }}>
            <option value="">All venues</option>
            {allVenues.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        )}
        {activeFilters && (
          <button onClick={() => { setMyTeamsOnly(false); setTeamFilter(''); setVenueFilter(''); }}
            style={{ fontSize: 12, padding: '5px 10px', borderRadius: 6, border: '1px solid #ddd', background: '#f5f5f5', color: '#555', cursor: 'pointer' }}>
            Clear filters
          </button>
        )}
      </div>

      <div style={{ fontSize: 12, color: '#aaa', marginBottom: 12 }}>
        {filtered.length} {filtered.length === 1 ? 'match' : 'matches'}{myTeamsOnly ? ' · my teams only' : ''}
      </div>

      {view === 'list' && (
        filtered.length === 0
          ? <div style={{ padding: '40px 0', textAlign: 'center', color: '#aaa', fontSize: 14 }}>No matches for these filters.</div>
          : <ListView matches={filtered} />
      )}
      {view === 'bracket' && (
        <BracketView matches={matches} myTeamsOnly={myTeamsOnly} teamFilter={teamFilter} />
      )}

      <div style={{ fontSize: 11, color: '#ccc', textAlign: 'center', marginTop: 24, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
        <a href="/world-cup-2026/" style={{ color: '#bbb', textDecoration: 'none' }}>← Group stage schedule</a>
      </div>
    </div>
  );
}
