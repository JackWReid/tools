import { useRef } from 'react';
import BracketSlot from './BracketSlot.jsx';
import { MY_TEAM_MAP, MY_TEAM_NAMES } from '../data/teamData.js';

const SLOT_H = 62;
const SLOT_W = 140;
const COL_GAP = 24;
const TOTAL_H = Math.round(8 * SLOT_H * 1.35);

// Left to right column definitions (match IDs in visual top-to-bottom order)
const COLUMNS = [
  [73, 75, 74, 77, 76, 78, 79, 80],  // L-R32
  [90, 89, 91, 92],                   // L-R16
  [97, 98],                           // L-QF
  [101],                              // L-SF
  [103, 104],                         // CENTER (3rd place, then Final)
  [102],                              // R-SF
  [99, 100],                          // R-QF
  [93, 94, 95, 96],                   // R-R16
  [83, 84, 81, 82, 86, 87, 88, 85],  // R-R32
];

const LEFT_IDS = new Set([73, 75, 74, 77, 76, 78, 79, 80, 90, 89, 91, 92, 97, 98, 101]);

function MatchBlock({ match, dimmed }) {
  if (!match) return <div style={{ height: SLOT_H }} />;
  const isCompleted = match.status === 'completed';
  const hasScore = match.homeScore !== null && match.awayScore !== null;
  const winnerIsHome = isCompleted && hasScore &&
    (match.homeScore > match.awayScore || (match.homePens !== null && match.homePens > match.awayPens));

  return (
    <div
      data-match-id={match.id}
      style={{
        width: SLOT_W, height: SLOT_H,
        border: '1px solid #e8e8e8', borderRadius: 6, overflow: 'hidden',
        background: '#fafafa', opacity: dimmed ? 0.25 : 1,
      }}
    >
      <BracketSlot
        teamName={match.homeTeam} teamDesc={match.homeDesc}
        score={match.homeScore} pens={match.homePens}
        isWinner={winnerIsHome}
        isMyTeam={MY_TEAM_NAMES.has(match.homeTeam)}
        myTeamColor={MY_TEAM_MAP[match.homeTeam]?.color}
        isTBD={!match.homeTeam}
      />
      <div style={{ height: 1, background: '#eee' }} />
      <BracketSlot
        teamName={match.awayTeam} teamDesc={match.awayDesc}
        score={match.awayScore} pens={match.awayPens}
        isWinner={isCompleted && hasScore && !winnerIsHome}
        isMyTeam={MY_TEAM_NAMES.has(match.awayTeam)}
        myTeamColor={MY_TEAM_MAP[match.awayTeam]?.color}
        isTBD={!match.awayTeam}
      />
    </div>
  );
}

function BracketColumn({ matchIds, matchMap, myTeamsOnly, teamFilter }) {
  const n = matchIds.length;
  const cellH = TOTAL_H / n;
  return (
    <div style={{ width: SLOT_W, height: TOTAL_H, position: 'relative', flexShrink: 0 }}>
      {matchIds.map((id, i) => {
        const match = matchMap[id];
        const hasMyTeam = MY_TEAM_NAMES.has(match?.homeTeam) || MY_TEAM_NAMES.has(match?.awayTeam);
        const hasFilteredTeam = !teamFilter ||
          match?.homeTeam === teamFilter || match?.awayTeam === teamFilter ||
          match?.homeDesc === teamFilter || match?.awayDesc === teamFilter;
        const dimmed = (myTeamsOnly && !hasMyTeam) || (teamFilter && !hasFilteredTeam);
        const top = i * cellH + (cellH - SLOT_H) / 2;
        return (
          <div key={id} style={{ position: 'absolute', top, left: 0 }}>
            <MatchBlock match={match} dimmed={!!dimmed} />
          </div>
        );
      })}
    </div>
  );
}

export default function BracketView({ matches, myTeamsOnly, teamFilter }) {
  const matchMap = Object.fromEntries(matches.map(m => [m.id, m]));
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  // SVG connector lines added in Task 10

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 16 }}>
      <div
        ref={containerRef}
        style={{
          display: 'flex', flexDirection: 'row', alignItems: 'flex-start',
          gap: COL_GAP, position: 'relative',
          minWidth: COLUMNS.length * (SLOT_W + COL_GAP),
          height: TOTAL_H,
        }}
      >
        <svg ref={svgRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }} />
        {COLUMNS.map((col, i) => (
          <BracketColumn
            key={i}
            matchIds={col}
            matchMap={matchMap}
            myTeamsOnly={myTeamsOnly}
            teamFilter={teamFilter}
          />
        ))}
      </div>
    </div>
  );
}
