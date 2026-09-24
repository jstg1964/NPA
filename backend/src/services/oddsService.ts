import axios from 'axios';

const ODDS_API_BASE = 'https://api.the-odds-api.com/v4';
const API_KEY       = process.env['ODDS_API_KEY'] ?? '';

export interface GameOdds {
  homeTeam:      string;
  awayTeam:      string;
  spread:        number | null;
  overUnder:     number | null;
  homeMoneyline: number | null;
  awayMoneyline: number | null;
  bookmaker:     string;
}

export async function fetchNFLOdds(): Promise<GameOdds[]> {
  if (!API_KEY) {
    console.warn('[oddsService] ODDS_API_KEY not set — returning empty odds');
    return [];
  }

  try {
    const { data } = await axios.get(
        `${ODDS_API_BASE}/sports/americanfootball_nfl/odds`,
        {
          params: {
            apiKey:     API_KEY,
            regions:    'us',
            markets:    'spreads,totals,h2h',
            oddsFormat: 'american',
          },
          timeout: 8000,
        },
    );

    const results: GameOdds[] = [];

    for (const game of data) {
      const bookmaker = game.bookmakers?.[0];
      if (!bookmaker) continue;

      let spread:        number | null = null;
      let overUnder:     number | null = null;
      let homeMoneyline: number | null = null;
      let awayMoneyline: number | null = null;

      for (const market of bookmaker.markets ?? []) {
        if (market.key === 'spreads') {
          const homeOutcome = market.outcomes?.find(
              (o: any) => o.name === game.home_team,
          );
          if (homeOutcome) spread = homeOutcome.point;
        }
        if (market.key === 'totals') {
          const over = market.outcomes?.find((o: any) => o.name === 'Over');
          if (over) overUnder = over.point;
        }
        if (market.key === 'h2h') {
          const home = market.outcomes?.find((o: any) => o.name === game.home_team);
          const away = market.outcomes?.find((o: any) => o.name === game.away_team);
          if (home) homeMoneyline = home.price;
          if (away) awayMoneyline = away.price;
        }
      }

      results.push({
        homeTeam:      game.home_team,
        awayTeam:      game.away_team,
        spread,
        overUnder,
        homeMoneyline,
        awayMoneyline,
        bookmaker:     bookmaker.title,
      });
    }

    return results;

  } catch (err: any) {
    console.error('[oddsService] Failed to fetch odds:', err.message);
    return [];
  }
}

export function findOddsForGame(
    allOdds: GameOdds[],
    homeTeam: string,
    awayTeam: string,
): GameOdds | null {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');
  const homeNorm  = normalize(homeTeam);
  const awayNorm  = normalize(awayTeam);

  return (
      allOdds.find(g =>
          normalize(g.homeTeam).includes(homeNorm) ||
          homeNorm.includes(normalize(g.homeTeam)),
      ) ??
      allOdds.find(g =>
          normalize(g.awayTeam).includes(awayNorm) ||
          awayNorm.includes(normalize(g.awayTeam)),
      ) ??
      null
  );
}
