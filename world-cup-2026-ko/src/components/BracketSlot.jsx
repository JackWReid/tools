import { FLAGS } from '../data/teamData.js';

export default function BracketSlot({ teamName, teamDesc, score, pens, isWinner, isMyTeam, myTeamColor, isTBD }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5, padding: '3px 7px', height: 27,
      background: isWinner ? (myTeamColor ? `rgba(${myTeamColor.rgb},0.08)` : '#f0fff4') : '#fff',
      borderLeft: isMyTeam ? `3px solid ${myTeamColor?.hex ?? '#1a6b3a'}` : '3px solid transparent',
    }}>
      {FLAGS[teamName] && <span style={{ fontSize: 12 }}>{FLAGS[teamName]}</span>}
      <span style={{
        fontSize: 11, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        fontWeight: isWinner ? 700 : 400,
        color: isTBD ? '#bbb' : '#222',
        fontStyle: isTBD ? 'italic' : 'normal',
      }}>
        {teamName ?? teamDesc}
      </span>
      {score !== null && score !== undefined && (
        <span style={{ fontSize: 11, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: '#111', flexShrink: 0 }}>
          {score}{pens !== null && pens !== undefined && <span style={{ fontSize: 9, color: '#888' }}>({pens})</span>}
        </span>
      )}
    </div>
  );
}
