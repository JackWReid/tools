import { useState, useMemo } from "react";

const MY_TEAMS = ["Switzerland", "Scotland", "England", "Germany", "Norway", "France", "USA"];

const MY_TEAM_COLORS = {
  Switzerland: { hex: "#d4202a", rgb: "212,32,42" },
  Scotland:    { hex: "#003f7d", rgb: "0,63,125" },
  England:     { hex: "#cf142b", rgb: "207,20,43" },
  Germany:     { hex: "#1a1a1a", rgb: "26,26,26" },
  Norway:      { hex: "#ef2b2d", rgb: "239,43,45" },
  France:      { hex: "#002395", rgb: "0,35,149" },
  USA:         { hex: "#b22234", rgb: "178,34,52" },
};

const FLAGS = {
  Mexico: "🇲🇽", "South Africa": "🇿🇦", "South Korea": "🇰🇷", Czechia: "🇨🇿",
  Canada: "🇨🇦", "Bosnia and Herzegovina": "🇧🇦", Qatar: "🇶🇦", Switzerland: "🇨🇭",
  Brazil: "🇧🇷", Morocco: "🇲🇦", Haiti: "🇭🇹", Scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  USA: "🇺🇸", Paraguay: "🇵🇾", Australia: "🇦🇺", Turkiye: "🇹🇷",
  Germany: "🇩🇪", Curacao: "🇨🇼", "Ivory Coast": "🇨🇮", Ecuador: "🇪🇨",
  Netherlands: "🇳🇱", Japan: "🇯🇵", Sweden: "🇸🇪", Tunisia: "🇹🇳",
  Spain: "🇪🇸", "Cape Verde": "🇨🇻", "Saudi Arabia": "🇸🇦", Uruguay: "🇺🇾",
  Belgium: "🇧🇪", Egypt: "🇪🇬", Iran: "🇮🇷", "New Zealand": "🇳🇿",
  France: "🇫🇷", Senegal: "🇸🇳", Iraq: "🇮🇶", Norway: "🇳🇴",
  Argentina: "🇦🇷", Algeria: "🇩🇿", Austria: "🇦🇹", Jordan: "🇯🇴",
  Portugal: "🇵🇹", "DR Congo": "🇨🇩", Uzbekistan: "🇺🇿", Colombia: "🇨🇴",
  England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", Croatia: "🇭🇷", Ghana: "🇬🇭", Panama: "🇵🇦",
};

const MATCHES = [
  { date: "2026-06-11", time: "21:00", home: "Mexico", away: "South Africa", group: "A", venue: "Mexico City" },
  { date: "2026-06-12", time: "04:00", home: "South Korea", away: "Czechia", group: "A", venue: "Guadalajara" },
  { date: "2026-06-12", time: "21:00", home: "Canada", away: "Bosnia and Herzegovina", group: "B", venue: "Toronto" },
  { date: "2026-06-13", time: "07:00", home: "USA", away: "Paraguay", group: "D", venue: "Los Angeles" },
  { date: "2026-06-13", time: "21:00", home: "Qatar", away: "Switzerland", group: "B", venue: "San Francisco" },
  { date: "2026-06-14", time: "00:00", home: "Brazil", away: "Morocco", group: "C", venue: "New York NJ" },
  { date: "2026-06-14", time: "03:00", home: "Haiti", away: "Scotland", group: "C", venue: "Boston" },
  { date: "2026-06-14", time: "06:00", home: "Australia", away: "Turkiye", group: "D", venue: "Vancouver" },
  { date: "2026-06-14", time: "19:00", home: "Germany", away: "Curacao", group: "E", venue: "Houston" },
  { date: "2026-06-14", time: "22:00", home: "Netherlands", away: "Japan", group: "F", venue: "Dallas" },
  { date: "2026-06-15", time: "01:00", home: "Ivory Coast", away: "Ecuador", group: "E", venue: "Philadelphia" },
  { date: "2026-06-15", time: "04:00", home: "Sweden", away: "Tunisia", group: "F", venue: "Monterrey" },
  { date: "2026-06-15", time: "18:00", home: "Spain", away: "Cape Verde", group: "H", venue: "Atlanta" },
  { date: "2026-06-15", time: "21:00", home: "Belgium", away: "Egypt", group: "G", venue: "Vancouver" },
  { date: "2026-06-16", time: "00:00", home: "Saudi Arabia", away: "Uruguay", group: "H", venue: "Miami" },
  { date: "2026-06-16", time: "03:00", home: "Iran", away: "New Zealand", group: "G", venue: "Los Angeles" },
  { date: "2026-06-16", time: "21:00", home: "France", away: "Senegal", group: "I", venue: "New York NJ" },
  { date: "2026-06-17", time: "00:00", home: "Iraq", away: "Norway", group: "I", venue: "Boston" },
  { date: "2026-06-17", time: "03:00", home: "Argentina", away: "Algeria", group: "J", venue: "Kansas City" },
  { date: "2026-06-17", time: "06:00", home: "Austria", away: "Jordan", group: "J", venue: "San Francisco" },
  { date: "2026-06-17", time: "19:00", home: "Portugal", away: "DR Congo", group: "K", venue: "Houston" },
  { date: "2026-06-17", time: "22:00", home: "England", away: "Croatia", group: "L", venue: "Dallas" },
  { date: "2026-06-18", time: "01:00", home: "Ghana", away: "Panama", group: "L", venue: "Toronto" },
  { date: "2026-06-18", time: "04:00", home: "Uzbekistan", away: "Colombia", group: "K", venue: "Mexico City" },
  { date: "2026-06-18", time: "18:00", home: "Czechia", away: "South Africa", group: "A", venue: "Atlanta" },
  { date: "2026-06-18", time: "21:00", home: "Switzerland", away: "Bosnia and Herzegovina", group: "B", venue: "Los Angeles" },
  { date: "2026-06-19", time: "00:00", home: "Canada", away: "Qatar", group: "B", venue: "Vancouver" },
  { date: "2026-06-19", time: "03:00", home: "Mexico", away: "South Korea", group: "A", venue: "Guadalajara" },
  { date: "2026-06-19", time: "21:00", home: "USA", away: "Australia", group: "D", venue: "Seattle" },
  { date: "2026-06-20", time: "00:00", home: "Scotland", away: "Morocco", group: "C", venue: "Boston" },
  { date: "2026-06-20", time: "02:30", home: "Brazil", away: "Haiti", group: "C", venue: "Philadelphia" },
  { date: "2026-06-20", time: "05:00", home: "Turkiye", away: "Paraguay", group: "D", venue: "San Francisco" },
  { date: "2026-06-20", time: "19:00", home: "Netherlands", away: "Sweden", group: "F", venue: "Houston" },
  { date: "2026-06-20", time: "22:00", home: "Germany", away: "Ivory Coast", group: "E", venue: "Toronto" },
  { date: "2026-06-21", time: "05:00", home: "Ecuador", away: "Curacao", group: "E", venue: "Kansas City" },
  { date: "2026-06-21", time: "06:00", home: "Tunisia", away: "Japan", group: "F", venue: "Monterrey" },
  { date: "2026-06-21", time: "18:00", home: "Spain", away: "Saudi Arabia", group: "H", venue: "Atlanta" },
  { date: "2026-06-21", time: "21:00", home: "Belgium", away: "Iran", group: "G", venue: "Los Angeles" },
  { date: "2026-06-22", time: "00:00", home: "Uruguay", away: "Cape Verde", group: "H", venue: "Miami" },
  { date: "2026-06-22", time: "03:00", home: "New Zealand", away: "Egypt", group: "G", venue: "Vancouver" },
  { date: "2026-06-22", time: "19:00", home: "Argentina", away: "Austria", group: "J", venue: "Dallas" },
  { date: "2026-06-22", time: "23:00", home: "France", away: "Iraq", group: "I", venue: "Philadelphia" },
  { date: "2026-06-23", time: "02:00", home: "Norway", away: "Senegal", group: "I", venue: "New York NJ" },
  { date: "2026-06-23", time: "05:00", home: "Jordan", away: "Algeria", group: "J", venue: "San Francisco" },
  { date: "2026-06-23", time: "19:00", home: "Portugal", away: "Uzbekistan", group: "K", venue: "Houston" },
  { date: "2026-06-23", time: "22:00", home: "England", away: "Ghana", group: "L", venue: "Boston" },
  { date: "2026-06-24", time: "01:00", home: "Panama", away: "Croatia", group: "L", venue: "Toronto" },
  { date: "2026-06-24", time: "04:00", home: "Colombia", away: "DR Congo", group: "K", venue: "Guadalajara" },
  { date: "2026-06-24", time: "21:00", home: "Switzerland", away: "Canada", group: "B", venue: "Vancouver" },
  { date: "2026-06-24", time: "21:00", home: "Bosnia and Herzegovina", away: "Qatar", group: "B", venue: "Seattle" },
  { date: "2026-06-25", time: "00:00", home: "Scotland", away: "Brazil", group: "C", venue: "Miami" },
  { date: "2026-06-25", time: "00:00", home: "Morocco", away: "Haiti", group: "C", venue: "Atlanta" },
  { date: "2026-06-25", time: "03:00", home: "Czechia", away: "Mexico", group: "A", venue: "Mexico City" },
  { date: "2026-06-25", time: "03:00", home: "South Africa", away: "South Korea", group: "A", venue: "Monterrey" },
  { date: "2026-06-25", time: "22:00", home: "Ecuador", away: "Germany", group: "E", venue: "New York NJ" },
  { date: "2026-06-25", time: "22:00", home: "Curacao", away: "Ivory Coast", group: "E", venue: "Philadelphia" },
  { date: "2026-06-26", time: "01:00", home: "Japan", away: "Sweden", group: "F", venue: "Dallas" },
  { date: "2026-06-26", time: "01:00", home: "Tunisia", away: "Netherlands", group: "F", venue: "Kansas City" },
  { date: "2026-06-26", time: "04:00", home: "Turkiye", away: "USA", group: "D", venue: "Los Angeles" },
  { date: "2026-06-26", time: "04:00", home: "Paraguay", away: "Australia", group: "D", venue: "San Francisco" },
  { date: "2026-06-26", time: "21:00", home: "Norway", away: "France", group: "I", venue: "Boston" },
  { date: "2026-06-26", time: "21:00", home: "Senegal", away: "Iraq", group: "I", venue: "Toronto" },
  { date: "2026-06-27", time: "02:00", home: "Cape Verde", away: "Saudi Arabia", group: "H", venue: "Houston" },
  { date: "2026-06-27", time: "02:00", home: "Uruguay", away: "Spain", group: "H", venue: "Guadalajara" },
  { date: "2026-06-27", time: "05:00", home: "Egypt", away: "Iran", group: "G", venue: "Seattle" },
  { date: "2026-06-27", time: "05:00", home: "New Zealand", away: "Belgium", group: "G", venue: "Vancouver" },
  { date: "2026-06-27", time: "23:00", home: "Panama", away: "England", group: "L", venue: "New York NJ" },
  { date: "2026-06-27", time: "23:00", home: "Croatia", away: "Ghana", group: "L", venue: "Philadelphia" },
  { date: "2026-06-28", time: "01:30", home: "Colombia", away: "Portugal", group: "K", venue: "Miami" },
  { date: "2026-06-28", time: "01:30", home: "DR Congo", away: "Uzbekistan", group: "K", venue: "Atlanta" },
  { date: "2026-06-28", time: "04:00", home: "Algeria", away: "Austria", group: "J", venue: "Kansas City" },
  { date: "2026-06-28", time: "04:00", home: "Jordan", away: "Argentina", group: "J", venue: "Dallas" },
];

// Pre-compute per-match style data once at module level — never inside render
const MATCH_STYLES = MATCHES.map(m => {
  const homeIdx = MY_TEAMS.indexOf(m.home);
  const awayIdx = MY_TEAMS.indexOf(m.away);
  let topTeam = null;
  if (homeIdx !== -1 && awayIdx !== -1) topTeam = homeIdx < awayIdx ? m.home : m.away;
  else if (homeIdx !== -1) topTeam = m.home;
  else if (awayIdx !== -1) topTeam = m.away;
  const color = topTeam ? MY_TEAM_COLORS[topTeam] : null;
  return {
    isMyMatch: topTeam !== null,
    homeIsMyTeam: homeIdx !== -1,
    awayIsMyTeam: awayIdx !== -1,
    borderLeft: color ? `3px solid ${color.hex}` : "3px solid transparent",
    borderOuter: color ? `1px solid rgba(${color.rgb},0.13)` : "1px solid #f0f0f0",
    background: color ? `rgba(${color.rgb},0.04)` : "#fafafa",
  };
});

const MY_TEAMS_SET = new Set(MY_TEAMS);

function formatDateHeader(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
}

function MatchCard({ m, style }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "10px 12px", marginBottom: 4, borderRadius: 8,
      border: style.borderOuter,
      background: style.background,
      borderLeft: style.borderLeft,
    }}>
      <div style={{ fontSize: 13, color: "#888", minWidth: 46, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>
        {m.time}
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", minWidth: 0 }}>
        <span style={{ fontSize: 15 }}>{FLAGS[m.home] || ""}</span>
        <span style={{ fontSize: 14, fontWeight: style.homeIsMyTeam ? 700 : 400, color: style.homeIsMyTeam ? "#111" : "#444" }}>
          {m.home}
        </span>
        <span style={{ fontSize: 12, color: "#bbb" }}>vs</span>
        <span style={{ fontSize: 15 }}>{FLAGS[m.away] || ""}</span>
        <span style={{ fontSize: 14, fontWeight: style.awayIsMyTeam ? 700 : 400, color: style.awayIsMyTeam ? "#111" : "#444" }}>
          {m.away}
        </span>
      </div>
      <div style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "#f0f0f0", color: "#888", fontWeight: 600, flexShrink: 0 }}>
        Gp {m.group}
      </div>
      <div style={{ fontSize: 12, color: "#aaa", minWidth: 0, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flexShrink: 0 }}>
        {m.venue}
      </div>
    </div>
  );
}

// Pair matches with their pre-computed styles once
const MATCHES_WITH_STYLES = MATCHES.map((m, i) => ({ m, style: MATCH_STYLES[i] }));

export default function WorldCup() {
  const [myTeamsOnly, setMyTeamsOnly] = useState(false);
  const [sortMode, setSortMode] = useState("date");
  const [teamFilter, setTeamFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [venueFilter, setVenueFilter] = useState("");

  const allTeams = useMemo(() => [...new Set(MATCHES.flatMap(m => [m.home, m.away]))].sort(), []);
  const allGroups = useMemo(() => [...new Set(MATCHES.map(m => m.group))].sort(), []);
  const allVenues = useMemo(() => [...new Set(MATCHES.map(m => m.venue))].sort(), []);

  const filtered = useMemo(() => {
    return MATCHES_WITH_STYLES.filter(({ m, style }) => {
      if (myTeamsOnly && !style.isMyMatch) return false;
      if (teamFilter && m.home !== teamFilter && m.away !== teamFilter) return false;
      if (groupFilter && m.group !== groupFilter) return false;
      if (venueFilter && m.venue !== venueFilter) return false;
      return true;
    });
  }, [myTeamsOnly, teamFilter, groupFilter, venueFilter]);

  const grouped = useMemo(() => {
    const buckets = {};
    for (const item of filtered) {
      const key = sortMode === "date" ? item.m.date : item.m.group;
      if (!buckets[key]) buckets[key] = [];
      buckets[key].push(item);
    }
    return Object.entries(buckets).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered, sortMode]);

  const activeFilters = myTeamsOnly || teamFilter || groupFilter || venueFilter;

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 720, margin: "0 auto", padding: "20px 16px" }}>

      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#888", marginBottom: 4 }}>
              FIFA World Cup 2026
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "#111", lineHeight: 1.2 }}>
              Group stage schedule
            </h1>
            <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>
              48 matches · All times Berlin (CEST, UTC+2)
            </div>
          </div>
          <button
            onClick={() => setMyTeamsOnly(v => !v)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 18px", borderRadius: 999,
              border: myTeamsOnly ? "2px solid #1a6b3a" : "2px solid #ddd",
              background: myTeamsOnly ? "#1a6b3a" : "#fff",
              color: myTeamsOnly ? "#fff" : "#333",
              fontWeight: 600, fontSize: 14, cursor: "pointer",
              whiteSpace: "nowrap",
              boxShadow: myTeamsOnly ? "0 2px 8px rgba(26,107,58,0.3)" : "none",
            }}
          >
            <span style={{ fontSize: 16 }}>⭐</span>
            My teams
          </button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
          {MY_TEAMS.map(t => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#555" }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: MY_TEAM_COLORS[t].hex, flexShrink: 0 }} />
              {FLAGS[t]} {t}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #eee" }}>
        <span style={{ fontSize: 12, color: "#888", fontWeight: 500 }}>Filter</span>
        <select value={teamFilter} onChange={e => setTeamFilter(e.target.value)}
          style={{ fontSize: 13, padding: "5px 8px", borderRadius: 6, border: teamFilter ? "1.5px solid #1a6b3a" : "1px solid #ddd", background: "#fff", color: "#222", cursor: "pointer" }}>
          <option value="">All teams</option>
          {allTeams.map(t => <option key={t} value={t}>{FLAGS[t] || ""} {t}</option>)}
        </select>
        <select value={groupFilter} onChange={e => setGroupFilter(e.target.value)}
          style={{ fontSize: 13, padding: "5px 8px", borderRadius: 6, border: groupFilter ? "1.5px solid #1a6b3a" : "1px solid #ddd", background: "#fff", color: "#222", cursor: "pointer" }}>
          <option value="">All groups</option>
          {allGroups.map(g => <option key={g} value={g}>Group {g}</option>)}
        </select>
        <select value={venueFilter} onChange={e => setVenueFilter(e.target.value)}
          style={{ fontSize: 13, padding: "5px 8px", borderRadius: 6, border: venueFilter ? "1.5px solid #1a6b3a" : "1px solid #ddd", background: "#fff", color: "#222", cursor: "pointer" }}>
          <option value="">All venues</option>
          {allVenues.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
        {activeFilters && (
          <button onClick={() => { setMyTeamsOnly(false); setTeamFilter(""); setGroupFilter(""); setVenueFilter(""); }}
            style={{ fontSize: 12, padding: "5px 10px", borderRadius: 6, border: "1px solid #ddd", background: "#f5f5f5", color: "#555", cursor: "pointer" }}>
            Clear filters
          </button>
        )}
        <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
          {["date", "group"].map(mode => (
            <button key={mode} onClick={() => setSortMode(mode)}
              style={{ fontSize: 12, padding: "5px 12px", borderRadius: 6, border: "1px solid #ddd", cursor: "pointer",
                background: sortMode === mode ? "#111" : "#fff",
                color: sortMode === mode ? "#fff" : "#555",
                fontWeight: sortMode === mode ? 600 : 400 }}>
              By {mode}
            </button>
          ))}
        </div>
      </div>

      <div style={{ fontSize: 12, color: "#aaa", marginBottom: 12 }}>
        {filtered.length} {filtered.length === 1 ? "match" : "matches"}
        {myTeamsOnly ? " · my teams only" : ""}
      </div>

      {grouped.length === 0 ? (
        <div style={{ padding: "40px 0", textAlign: "center", color: "#aaa", fontSize: 14 }}>
          No matches for these filters.
        </div>
      ) : (
        grouped.map(([key, items]) => (
          <div key={key} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
              color: "#999", padding: "10px 0 6px", borderTop: "1px solid #f0f0f0" }}>
              {sortMode === "date" ? formatDateHeader(key) : `Group ${key}`}
            </div>
            {items.map(({ m, style }, i) => (
              <MatchCard key={i} m={m} style={style} />
            ))}
          </div>
        ))
      )}

      <div style={{ fontSize: 11, color: "#ccc", textAlign: "center", marginTop: 24, paddingTop: 16, borderTop: "1px solid #f0f0f0" }}>
        Group stage ends 28 June · Knockout fixtures to be added
      </div>
    </div>
  );
}
