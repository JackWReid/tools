export const MY_TEAMS = [
  { name: 'Switzerland', flag: '🇨🇭', color: { hex: '#d4202a', rgb: '212,32,42' } },
  { name: 'England',     flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', color: { hex: '#cf142b', rgb: '207,20,43' } },
  { name: 'Germany',     flag: '🇩🇪', color: { hex: '#1a1a1a', rgb: '26,26,26' } },
  { name: 'Norway',      flag: '🇳🇴', color: { hex: '#ef2b2d', rgb: '239,43,45' } },
  { name: 'France',      flag: '🇫🇷', color: { hex: '#002395', rgb: '0,35,149' } },
  { name: 'USA',         flag: '🇺🇸', color: { hex: '#b22234', rgb: '178,34,52' } },
];

export const MY_TEAM_MAP = Object.fromEntries(MY_TEAMS.map(t => [t.name, t]));
export const MY_TEAM_NAMES = new Set(MY_TEAMS.map(t => t.name));

export const FLAGS = {
  'South Africa':          '🇿🇦',
  'Canada':                '🇨🇦',
  'Germany':               '🇩🇪',
  'Netherlands':           '🇳🇱',
  'Morocco':               '🇲🇦',
  'Brazil':                '🇧🇷',
  'Japan':                 '🇯🇵',
  'Ivory Coast':           '🇨🇮',
  'Mexico':                '🇲🇽',
  'USA':                   '🇺🇸',
  'Bosnia and Herzegovina':'🇧🇦',
  'Spain':                 '🇪🇸',
  'Argentina':             '🇦🇷',
  'Cape Verde':            '🇨🇻',
  'Switzerland':           '🇨🇭',
  'Australia':             '🇦🇺',
  'Egypt':                 '🇪🇬',
  'England':               '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'France':                '🇫🇷',
  'Norway':                '🇳🇴',
  'Portugal':              '🇵🇹',
  'Colombia':              '🇨🇴',
  'Uruguay':               '🇺🇾',
  'Ecuador':               '🇪🇨',
  'Senegal':               '🇸🇳',
  'Belgium':               '🇧🇪',
  'Paraguay':              '🇵🇾',
  'Sweden':                '🇸🇪',
  'South Korea':           '🇰🇷',
  'Ghana':                 '🇬🇭',
  'Austria':               '🇦🇹',
  'Iran':                  '🇮🇷',
  'Croatia':               '🇭🇷',
  'Germany':               '🇩🇪',
};

export const ESPN_NAME_MAP = {
  'United States':      'USA',
  "Côte d'Ivoire":      'Ivory Coast',
  "Cote d'Ivoire":      'Ivory Coast',
  'Bosnia-Herzegovina': 'Bosnia and Herzegovina',
};

export function canonicalName(espnName) {
  return ESPN_NAME_MAP[espnName] ?? espnName;
}
