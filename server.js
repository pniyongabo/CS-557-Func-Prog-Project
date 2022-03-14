const players = require("./data/players.json");
const nations = require("./data/nations.json");
const clubs = require("./data/clubs.json");
const leagues = require("./data/leagues.json");

const neighbors433 = require("./data/formations/433.json");
const neighbors442 = require("./data/formations/442.json");
const altPositionsMap = require("./data/formations/altPositionsMap.json");

const mapOfNations = new Map(nations.map((obj) => [obj.id, obj]));
const mapOfClubs = new Map(clubs.map((obj) => [obj.id, obj]));
const mapOfLeagues = new Map(leagues.map((obj) => [obj.id, obj]));

const uniqueNations = [...new Set(players.map((p) => p.nation))];
const uniqueClubs = [...new Set(players.map((p) => p.club))];
const uniqueLeagues = [...new Set(players.map((p) => p.league))];

let currentSquad = {};
let currentFormation = "";
let currentNeighborsMap = {};
let randomMode = true;
let currentLeagueName = "";

const getFromMap = (map, id) => {
  if (map.get(id)) {
    return map.get(id);
  } else {
    return { id: id, name: "-" };
  }
};

const filterPlayersByNation = (id) => {
  return players.filter((player) => player.nation === id);
};

const filterPlayersByLeague = (id) => {
  return players.filter((player) => player.league === id);
};

const filterPlayersByClub = (id) => {
  return players.filter((player) => player.club === id);
};

const filterPlayersByNationName = (name) => {
  return players.filter((player) => mapOfNations.get(player.nation) && mapOfNations.get(player.nation).name === name);
};

const filterPlayersByLeagueName = (name) => {
  return players.filter((player) => mapOfLeagues.get(player.league) && mapOfLeagues.get(player.league).name === name);
};

const filterPlayersByClubName = (name) => {
  return players.filter((player) => mapOfClubs.get(player.club) && mapOfClubs.get(player.club).name === name);
};

const filterPlayersByPosition = (playersList, pos) => {
  return playersList.filter((player) => player.position.toLowerCase() == pos);
};

const printDetailsForAListOfPlayers = (listOfPlayers) => {
  console.log(`| ${"PLAYER NAME".padEnd(25)} | ${"AGE".padEnd(3)} | ${"RATING".padEnd(6)} | ${"POSITION".padEnd(8)} |`);
  listOfPlayers.map((player) => printDetailsForOnePlayer(player));
  console.log("");
};

const printDetailsForOnePlayer = (player) => {
  console.log(
    `| ${player.name.padEnd(25)} | ${player.age.toString().padEnd(3)} | ${player.rating
      .toString()
      .padEnd(6)} | ${player.position.padEnd(8)} |`
  );
};

const shuffleArray = (arr) => {
  return arr
    .map((element) => ({ element, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ element }) => element);
};

const getBestElevenForFormation = (players, formation) => {
  console.log(`Generating Squad for Formation: ${formation}`);
  let bestEleven = {};
  if (formation == "442") {
    bestEleven = getBestEleven442(players);
  } else if (formation == "433") {
    bestEleven = getBestEleven433(players);
  }
  return bestEleven;
};

const improveTeamChemistry = (team, pivotPos, neighborsMap) => {
  const improvedTeam = { ...team };
  const pivotPlayer = team[pivotPos];
  const pivotNeighborPlayers = [
    ...filterPlayersByNation(pivotPlayer.nation),
    ...filterPlayersByLeague(pivotPlayer.league),
    ...filterPlayersByClub(pivotPlayer.club),
  ];
  let pivotNeighborPlayersNoDup = [...new Set(pivotNeighborPlayers)];

  for (const neighborPos of neighborsMap[pivotPos]) {
    const formattedPosition = altPositionsMap.hasOwnProperty(neighborPos) ? altPositionsMap[neighborPos] : neighborPos;
    let potentialPlayersforPos = filterPlayersByPosition(pivotNeighborPlayersNoDup, formattedPosition);

    const neighborPlayer = improvedTeam[neighborPos];
    for (const potentialPlayer of potentialPlayersforPos) {
      if (
        calculateChemistryBetween(pivotPlayer, potentialPlayer) > calculateChemistryBetween(pivotPlayer, neighborPlayer)
      ) {
        improvedTeam[neighborPos] = potentialPlayer;
        break;
      }
    }
  }
  const prevScore = calculateTeamChemistry(team, neighborsMap);
  const newScore = calculateTeamChemistry(improvedTeam, neighborsMap);
  if (newScore <= prevScore) {
    console.log(`The new chemistry score (${newScore}) <= previous score (${prevScore}). Reverting to previous squad.`);
    return team;
  } else {
    console.log(`Improved chemistry score from (${prevScore}) to (${newScore}). Returning improved squad!`);
    return improvedTeam;
  }
};

const calculateTeamChemistry = (team, neighborsMap) => {
  let totalChemistry = 0;
  for (const pos in team) {
    let playerChemistry = 0;
    let maxPlayerChemistry = 2 * neighborsMap[pos].length;
    for (const neighborPos of neighborsMap[pos]) {
      playerChemistry += calculateChemistryBetween(team[pos], team[neighborPos]);
    }

    let roundedChemisty = Math.floor((playerChemistry * 10) / maxPlayerChemistry);
    totalChemistry += roundedChemisty;
  }
  return totalChemistry > 100 ? 100 : totalChemistry;
};

const calculateChemistryBetween = (player1, player2) => {
  let chemistryBetween = 0;
  if (player1 == undefined || player2 == undefined) {
    return chemistryBetween;
  }
  if (player1 && player2 && player1.nation === player2.nation) {
    chemistryBetween++;
  }
  if (player1.hasOwnProperty("league") && player2.hasOwnProperty("league") && player1.league === player2.league) {
    chemistryBetween++;
  }
  if (player1.hasOwnProperty("club") && player2.hasOwnProperty("club") && player1.club === player2.club) {
    chemistryBetween = 2;
  }
  return chemistryBetween;
};

/**
 * @param {*} players
 * @returns bestEleven442 squad
 */
const getBestEleven442 = (players) => {
  const bestEleven = {};
  let numberOfPlayerAdded = 0;
  players.map((player) => {
    numberOfPlayerAdded++;
    if (player.position == "GK") {
      bestEleven["gk"] = player;
    } else if (player.position == "LB") {
      bestEleven["lb"] = player;
    } else if (player.position == "CB") {
      if (bestEleven.lcb === undefined) {
        bestEleven["lcb"] = player;
      } else if (bestEleven.rcb === undefined) {
        bestEleven["rcb"] = player;
      }
    } else if (player.position == "RB") {
      bestEleven["rb"] = player;
    } else if (player.position == "LM") {
      bestEleven["lm"] = player;
    } else if (player.position == "CM" || player.position == "CAM" || player.position == "CDM") {
      if (bestEleven.lcm === undefined) {
        bestEleven["lcm"] = player;
      } else if (bestEleven.rcm === undefined) {
        bestEleven["rcm"] = player;
      }
    } else if (player.position == "RM") {
      bestEleven["rm"] = player;
    } else if (player.position == "ST" || player.position == "CF") {
      if (bestEleven.lst === undefined) {
        bestEleven["lst"] = player;
      } else if (bestEleven.rst === undefined) {
        bestEleven["rst"] = player;
      }
    } else {
      numberOfPlayerAdded--;
    }

    if (numberOfPlayerAdded === 11) {
      return bestEleven;
    }
  });
  return bestEleven;
};

/**
 *
 * @param {*} players
 * @returns bestEleven433 squad
 */
const getBestEleven433 = (players) => {
  const bestEleven = {};
  let numberOfPlayerAdded = 0;
  players.map((player) => {
    numberOfPlayerAdded++;
    if (player.position == "GK") {
      bestEleven["gk"] = player;
    } else if (player.position == "LB") {
      bestEleven["lb"] = player;
    } else if (player.position == "CB") {
      if (bestEleven.lcb === undefined) {
        bestEleven["lcb"] = player;
      } else if (bestEleven.rcb === undefined) {
        bestEleven["rcb"] = player;
      }
    } else if (player.position == "RB") {
      bestEleven["rb"] = player;
    } else if (player.position == "CM" || player.position == "CAM" || player.position == "CDM") {
      if (bestEleven.lcm === undefined) {
        bestEleven["lcm"] = player;
      } else if (bestEleven.cm === undefined) {
        bestEleven["cm"] = player;
      } else if (bestEleven.rcm === undefined) {
        bestEleven["rcm"] = player;
      }
    } else if (player.position == "LW" || player.position == "LM") {
      bestEleven["lw"] = player;
    } else if (player.position == "ST" || player.position == "CF") {
      bestEleven["st"] = player;
    } else if (player.position == "RW" || player.position == "RM") {
      bestEleven["rw"] = player;
    } else {
      numberOfPlayerAdded--;
    }

    if (numberOfPlayerAdded === 11) {
      return bestEleven;
    }
  });
  return bestEleven;
};

const printSquadObject = (squad, formation) => {
  let teamChemistryScore = 0;
  if (formation == "442") {
    teamChemistryScore = calculateTeamChemistry(squad, neighbors442);
  } else if (formation == "433") {
    teamChemistryScore = calculateTeamChemistry(squad, neighbors433);
  }
  const squadAsArray = Object.values(squad);
  console.log(`----------------------------------------`);
  console.log(`Printing Squad - Chemistry Score: ${teamChemistryScore}/100, No of Players = ${squadAsArray.length}/11`);
  console.log(`----------------------------------------`);
  printDetailsForAListOfPlayers(squadAsArray);
  console.log(`----------------------------------------`);
};

/*
 ****************************************************************
 ********* USE 'PROMPT-SYNC' MODULE TO READ USER INPUT **********
 ****************************************************************
 */
const prompt = require("prompt-sync")({ sigint: true });

const startingMessage = `\nWelcome to the 'FIFA Squad Builder' interactive app!

Current dataset stats: ${players.length} players, ${uniqueNations.length} nations, ${uniqueClubs.length} clubs, ${uniqueLeagues.length} leagues. 

Please choose one of the following options:
 1. Generate squad randomly
 2. Generate Squad from one league
 3. Quit Application\n`;

const closingMessage = `\nThat was fun! Would you like to:
 1. Go back to Main Menu
 2. Kepp Improving Current Squad 
 3. Quit Application\n`;

const formationMessage = `Please choose a formation - '442' or '433': `;
const chemistryPrefMessage = `Please choose a pivot position from the list above: `;
const uniqueLeaguesNames = [...new Set(players.map((p) => getFromMap(mapOfLeagues, p.league).name))];

const getStarted = () => {
  console.log(`----------------------------------------`);
  console.log(startingMessage);
  const userPath = prompt(`Type your choice ('1' / '2' / '3'), then press enter: `);
  if (userPath == "1") {
    getUserFormation();
  } else if (userPath == "2") {
    randomMode = false;
    getLeague();
    getUserFormation();
  } else if (userPath == "3") {
    console.log(`\nClosing Application ...`);
    process.exit(0);
  } else {
    console.log(`\nInvalid input: '${userPath}'. Valid options are '1', '2', or '3'.`);
    getStarted();
  }
};

const getLeague = () => {
  console.log(`----------------------------------------`);
  console.log(`Please choose one of the following leagues:\n`);
  uniqueLeaguesNames.map((elt, idx) => console.log(`${idx}. ${elt}`));
  const leagueId = parseInt(prompt(`\nType your league choice number, then press enter: `));
  if (leagueId >= 0 && leagueId <= uniqueLeaguesNames.length) {
    currentLeagueName = uniqueLeaguesNames[leagueId];
    console.log(`Cool, you have picked the '${currentLeagueName}'. Next, let's choose a formation.`);
  } else {
    console.log(
      `\nInvalid league input: '${leagueId}'. Please enter a number between 0 and ${uniqueLeaguesNames.length}.\n`
    );
    getLeague();
  }
};

const getUserFormation = () => {
  console.log(`----------------------------------------`);
  const userFormation = prompt(`${formationMessage}`);
  console.log(`----------------------------------------`);
  if (userFormation == "442" || userFormation == "433") {
    currentFormation = userFormation;
    currentNeighborsMap = userFormation == "442" ? neighbors442 : neighbors433;
    if (randomMode) {
      console.log(`Generating Squad with players selected randomly.`);
      currentSquad = getBestElevenForFormation(shuffleArray(players), userFormation);
    } else {
      console.log(`Generating Squad with players who play in the '${currentLeagueName}'.`);
      currentSquad = getBestElevenForFormation(filterPlayersByLeagueName(currentLeagueName), userFormation);
    }
    printSquadObject(currentSquad, currentFormation);
    getUserChemistryPreferences();
  } else {
    console.log(`\nInvalid formation input: '${userFormation}'.`);
    getUserFormation();
  }
};

const getUserChemistryPreferences = () => {
  const listOfFilledPositions = Object.keys(currentNeighborsMap).filter((elt) => currentSquad[elt] != undefined);
  console.log(
    `Now that we have a squad, let's try to improve the overall team chemistry.
We start with a pivot position/player, and place players from the same nation/league/club in adjacent positions.

List of filled positions for formation '${currentFormation}': ${listOfFilledPositions.join(", ")}`
  );

  const userChemistryPosition = prompt(`${chemistryPrefMessage}`);
  console.log(`----------------------------------------`);
  if (listOfFilledPositions.includes(userChemistryPosition)) {
    const pivotPlayer = currentSquad[userChemistryPosition];
    console.log(
      `Improving chemistry by adding compatible players around:
        '${pivotPlayer.name}' (${userChemistryPosition}) from '${
        getFromMap(mapOfNations, pivotPlayer.nation).name
      }' who plays for '${getFromMap(mapOfClubs, pivotPlayer.club).name}' in the '${
        getFromMap(mapOfLeagues, pivotPlayer.league).name
      }'.\n`
    );
    currentSquad = improveTeamChemistry(currentSquad, userChemistryPosition, currentNeighborsMap);
    printSquadObject(currentSquad, currentFormation);
    exitOrKeepGoing();
  } else {
    console.log(`\nInvalid position input: '${userChemistryPosition}'.`);
    getUserChemistryPreferences();
  }
};

const resetState = () => {
  currentSquad = {};
  currentFormation = "";
  currentNeighborsMap = {};
  randomMode = true;
  currentLeagueName = "";
};

const exitOrKeepGoing = () => {
  console.log(`----------------------------------------`);
  console.log(closingMessage);
  const userPath = prompt(`Type your choice ('1' / '2' / '3'), then press enter: `);
  if (userPath == "1") {
    resetState();
    getStarted();
  } else if (userPath == "2") {
    getUserChemistryPreferences();
  } else if (userPath == "3") {
    console.log(`\nClosing Application ...`);
    process.exit(0);
  } else {
    console.log(`\nInvalid input: '${userPath}'. Valid options are '1', '2', or '3'.`);
    exitOrKeepGoing();
  }
};

getStarted(); // ONE LINE TO START APPLICATION
