interface Props {
    teamA: string;
    teamB: string;
}

export default function TeamLogos({ teamA, teamB }: Props) {
    return (
        <div className="flex items-center justify-center gap-12 py-6">
            <div className="flex flex-col items-center">
                <img
                    src={`/logos/${teamA}.png`}
                    className="w-24 h-24 drop-shadow-lg"
                />
                <p className="mt-2 text-lg">{teamA}</p>
            </div>

            <div className="text-3xl font-bold">VS</div>

            <div className="flex flex-col items-center">
                <img
                    src={`/logos/${teamB}.png`}
                    className="w-24 h-24 drop-shadow-lg"
                />
                <p className="mt-2 text-lg">{teamB}</p>
            </div>
        </div>
    );
}
