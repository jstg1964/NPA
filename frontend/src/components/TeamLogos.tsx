interface Props {
    teamA:        string;
    teamB:        string;
    teamAAbbrev?: string;
    teamBAbbrev?: string;
}

export default function TeamLogos({ teamA, teamB, teamAAbbrev, teamBAbbrev }: Props) {
    const logoUrl = (abbrev?: string) =>
        abbrev
            ? `https://a.espncdn.com/i/teamlogos/nfl/500/${abbrev.toLowerCase()}.png`
            : null;

    const homeLogoUrl = logoUrl(teamAAbbrev);
    const awayLogoUrl = logoUrl(teamBAbbrev);

    return (
        <div className="flex items-center justify-center gap-12 py-6">
            <div className="flex flex-col items-center">
                {homeLogoUrl && (
                    <img
                        src={homeLogoUrl}
                        alt={teamA}
                        className="w-24 h-24 object-contain drop-shadow-lg"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                )}
                <p className="mt-2 text-lg font-semibold">{teamA}</p>
            </div>

            <div className="text-3xl font-bold text-gray-400">VS</div>

            <div className="flex flex-col items-center">
                {awayLogoUrl && (
                    <img
                        src={awayLogoUrl}
                        alt={teamB}
                        className="w-24 h-24 object-contain drop-shadow-lg"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                )}
                <p className="mt-2 text-lg font-semibold">{teamB}</p>
            </div>
        </div>
    );
}
