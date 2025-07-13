import React from 'react';

interface Team {
  id: string;
  name: string;
}

interface Matchup {
  team1: Team;
  team2: Team;
}

interface BracketProps {
  teams: Team[];
}

const Bracket: React.FC<BracketProps> = ({ teams }) => {
  const matchups: Matchup[] = [];
  for (let i = 0; i < teams.length; i += 2) {
    if (teams[i + 1]) {
      matchups.push({ team1: teams[i], team2: teams[i + 1] });
    }
  }

  if (matchups.length === 0) {
    return (
      <div className="text-center text-gray-500">
        <p>Select an even number of teams to see the bracket.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-xl font-semibold mb-4">Tournament Bracket</h3>
      <div className="flex flex-row justify-center space-x-8">
        <div className="flex flex-col space-y-8">
          {matchups.map((matchup, index) => (
            <div key={index} className="flex flex-row items-center">
              <div className="flex flex-col">
                <div className="bg-gray-100 p-2 rounded-t-md border-b-2 border-gray-300 w-48 text-center">{matchup.team1.name}</div>
                <div className="bg-gray-100 p-2 rounded-b-md w-48 text-center">{matchup.team2.name}</div>
              </div>
              <div className="w-8 h-px bg-gray-400"></div>
              <div className="w-px h-16 bg-gray-400 relative">
                  <div className="absolute right-0 top-1/2 w-8 h-px bg-gray-400"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Bracket; 