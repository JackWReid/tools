function mk(id, round, date, time, venue, venueFull, homeDesc, awayDesc) {
  const isDesc = s => /^(W|L|Best|Winner|Runner|Group)/.test(s);
  return {
    id, round, date, time, venue, venueFull,
    homeDesc, awayDesc,
    homeTeam: isDesc(homeDesc) ? null : homeDesc,
    awayTeam: isDesc(awayDesc) ? null : awayDesc,
    homeScore: null, awayScore: null,
    homePens: null, awayPens: null,
    status: 'upcoming', statusDetail: 'STATUS_SCHEDULED',
  };
}

export const BRACKET_SKELETON = [
  // R32
  mk(73,  'R32', '2026-06-28', '21:00', 'Los Angeles',  'Los Angeles (SoFi Stadium)',        'South Africa',  'Canada'),
  mk(74,  'R32', '2026-06-29', '23:00', 'Boston',       'Boston (Gillette Stadium)',          'Germany',       'Paraguay'),
  mk(75,  'R32', '2026-06-30', '03:00', 'Monterrey',    'Monterrey (BBVA Stadium)',           'Netherlands',   'Morocco'),
  mk(76,  'R32', '2026-06-29', '19:00', 'Houston',      'Houston (NRG Stadium)',              'Brazil',        'Japan'),
  mk(77,  'R32', '2026-06-30', '07:00', 'New York NJ',  'New York NJ (MetLife Stadium)',      'France',        'Sweden'),
  mk(78,  'R32', '2026-06-30', '03:00', 'Dallas',       'Dallas (AT&T Stadium)',              'Ivory Coast',   'Norway'),
  mk(79,  'R32', '2026-07-01', '03:00', 'Mexico City',  'Mexico City (Azteca Stadium)',       'Mexico',        'Ecuador'),
  mk(80,  'R32', '2026-07-01', '02:00', 'Atlanta',      'Atlanta (Mercedes-Benz Stadium)',    'England',       'Senegal'),
  mk(81,  'R32', '2026-07-02', '02:00', 'San Francisco','San Francisco (Levi\'s Stadium)',    'USA',           'Bosnia and Herzegovina'),
  mk(82,  'R32', '2026-07-02', '02:00', 'Seattle',      'Seattle (Lumen Field)',              'Belgium',       'South Korea'),
  mk(83,  'R32', '2026-07-02', '21:00', 'Los Angeles',  'Los Angeles (SoFi Stadium)',         'Portugal',      'Ghana'),
  mk(84,  'R32', '2026-07-03', '01:00', 'Toronto',      'Toronto (BMO Field)',                'Spain',         'Austria'),
  mk(85,  'R32', '2026-07-03', '05:00', 'Vancouver',    'Vancouver (BC Place)',               'Switzerland',   'Iran'),
  mk(86,  'R32', '2026-07-03', '20:00', 'Dallas',       'Dallas (AT&T Stadium)',              'Argentina',     'Cape Verde'),
  mk(87,  'R32', '2026-07-03', '00:00', 'Miami',        'Miami (Hard Rock Stadium)',          'Colombia',      'Croatia'),
  mk(88,  'R32', '2026-07-04', '03:30', 'Kansas City',  'Kansas City (Arrowhead Stadium)',    'Australia',     'Egypt'),

  // R16
  mk(89,  'R16', '2026-07-05', '19:00', 'Philadelphia', 'Philadelphia (Lincoln Financial Field)', 'W74', 'W77'),
  mk(90,  'R16', '2026-07-05', '23:00', 'Houston',      'Houston (NRG Stadium)',              'W73',  'W75'),
  mk(91,  'R16', '2026-07-06', '02:00', 'New York NJ',  'New York NJ (MetLife Stadium)',      'W76',  'W78'),
  mk(92,  'R16', '2026-07-06', '02:00', 'Mexico City',  'Mexico City (Azteca Stadium)',       'W79',  'W80'),
  mk(93,  'R16', '2026-07-07', '21:00', 'Dallas',       'Dallas (AT&T Stadium)',              'W83',  'W84'),
  mk(94,  'R16', '2026-07-07', '02:00', 'Seattle',      'Seattle (Lumen Field)',              'W81',  'W82'),
  mk(95,  'R16', '2026-07-08', '02:00', 'Atlanta',      'Atlanta (Mercedes-Benz Stadium)',    'W86',  'W88'),
  mk(96,  'R16', '2026-07-08', '02:00', 'Vancouver',    'Vancouver (BC Place)',               'W85',  'W87'),

  // QF
  mk(97,  'QF',  '2026-07-09', '21:00', 'Boston',       'Boston (Gillette Stadium)',          'W89',  'W90'),
  mk(98,  'QF',  '2026-07-10', '01:00', 'Los Angeles',  'Los Angeles (SoFi Stadium)',         'W91',  'W92'),
  mk(99,  'QF',  '2026-07-11', '21:00', 'Miami',        'Miami (Hard Rock Stadium)',          'W93',  'W94'),
  mk(100, 'QF',  '2026-07-11', '01:00', 'Kansas City',  'Kansas City (Arrowhead Stadium)',    'W95',  'W96'),

  // SF
  mk(101, 'SF',  '2026-07-14', '21:00', 'Dallas',       'Dallas (AT&T Stadium)',              'W97',  'W98'),
  mk(102, 'SF',  '2026-07-15', '21:00', 'Atlanta',      'Atlanta (Mercedes-Benz Stadium)',    'W99',  'W100'),

  // 3rd place and Final — note: 103=3rd, 104=Final
  mk(103, '3rd', '2026-07-18', '21:00', 'Miami',        'Miami (Hard Rock Stadium)',          'L101', 'L102'),
  mk(104, 'F',   '2026-07-19', '21:00', 'New York NJ',  'New York NJ (MetLife Stadium)',      'W101', 'W102'),
];

export const BRACKET_TREE = {
  // R32 → R16
  73:  { feeds: 90 },
  75:  { feeds: 90 },
  74:  { feeds: 89 },
  77:  { feeds: 89 },
  76:  { feeds: 91 },
  78:  { feeds: 91 },
  79:  { feeds: 92 },
  80:  { feeds: 92 },
  83:  { feeds: 93 },
  84:  { feeds: 93 },
  81:  { feeds: 94 },
  82:  { feeds: 94 },
  86:  { feeds: 95 },
  88:  { feeds: 95 },
  85:  { feeds: 96 },
  87:  { feeds: 96 },
  // R16 → QF
  89:  { feeds: 97 },
  90:  { feeds: 97 },
  91:  { feeds: 98 },
  92:  { feeds: 98 },
  93:  { feeds: 99 },
  94:  { feeds: 99 },
  95:  { feeds: 100 },
  96:  { feeds: 100 },
  // QF → SF
  97:  { feeds: 101 },
  98:  { feeds: 101 },
  99:  { feeds: 102 },
  100: { feeds: 102 },
  // SF → Final (104) and 3rd place (103)
  101: { feeds: 104, loserFeeds: 103 },
  102: { feeds: 104, loserFeeds: 103 },
};
