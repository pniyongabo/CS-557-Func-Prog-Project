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

let currentSquad = {};
let currentFormation = "";
let currentNeighborsMap = {};

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

// Example usage of Filter Methods
// const playersFromNetherlands = filterPlayersByNation('Netherlands');
// const playersFromPremierLeague = filterPlayersByLeague('Premier League');
// const playersFromArsenal = filterPlayersByClub('Arsenal');

// console.log(`PRINTING ----- playersFromNetherlands`);
// printDetailsForAListOfPlayers(playersFromNetherlands);
// console.log(`PRINTING ----- playersFromPremierLeague`);
// printDetailsForAListOfPlayers(playersFromPremierLeague);
// console.log(`PRINTING ----- playersFromArsenal`);
// printDetailsForAListOfPlayers(playersFromArsenal);

/**
 * create 2 or 3 squads: 442 and 433; return the one with most chemistry
 * @param {*} players
 * @returns bestEleven squad
 */
const getBestEleven = (players) => {
  const bestEleven442 = getBestEleven442(players);
  const bestEleven433 = getBestEleven433(players);

  const teamChemistry442 = calculateTeamChemistry(bestEleven442, neighbors442);
  const teamChemistry433 = calculateTeamChemistry(bestEleven433, neighbors433);

  const improvedBestEleven442 = improveTeamChemistry(bestEleven442, "lcm", neighbors442);
  const improvedBestEleven433 = improveTeamChemistry(bestEleven433, "cm", neighbors433);

  const improvedTeamChemistry442 = calculateTeamChemistry(improvedBestEleven442, neighbors442);
  const improvedTeamChemistry433 = calculateTeamChemistry(improvedBestEleven433, neighbors433);

  console.log(
    `teamChemistry442: ${teamChemistry442}, teamChemistry433: ${teamChemistry433}
improvedTeamChemistry442: ${improvedTeamChemistry442}, improvedTeamChemistry433: ${improvedTeamChemistry433}
------------------`
  );

  return teamChemistry442 > teamChemistry433 ? bestEleven442 : bestEleven433;
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
  const improvedTeam = team;
  const pivotPlayer = team[pivotPos];
  const pivotNeighborPlayers = [
    ...filterPlayersByNation(pivotPlayer.nation),
    ...filterPlayersByLeague(pivotPlayer.league),
    ...filterPlayersByClub(pivotPlayer.club),
  ];
  let pivotNeighborPlayersNoDup = (uniq = [...new Set(pivotNeighborPlayers)]);

  for (const neighborPos of neighborsMap[pivotPos]) {
    const formattedPosition = altPositionsMap.hasOwnProperty(neighborPos) ? altPositionsMap[neighborPos] : neighborPos;
    let potentialPlayersforPos = filterPlayersByPosition(pivotNeighborPlayersNoDup, formattedPosition);

    const neighborPlayer = improvedTeam[neighborPos];
    for (const potentialPlayer of potentialPlayersforPos) {
      if (
        calculateChemistryBetween(pivotPlayer, potentialPlayer) >
        calculateChemistryBetween(pivotPlayer, improvedTeam[neighborPos])
      ) {
        console.log(`For position '${neighborPos}' - replacing '${neighborPlayer.name}' (${
          getFromMap(mapOfNations, neighborPlayer.nation).name
        }/${getFromMap(mapOfClubs, neighborPlayer.club).name}/${getFromMap(mapOfLeagues, neighborPlayer.league).name})
          with '${potentialPlayer.name}' (${getFromMap(mapOfNations, potentialPlayer.nation).name}/${
          getFromMap(mapOfClubs, potentialPlayer.club).name
        }/${getFromMap(mapOfLeagues, potentialPlayer.league).name}).`);

        improvedTeam[neighborPos] = potentialPlayer;
        break;
      }
    }
  }
  return improvedTeam;
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
  if (player1.nation === player2.nation) {
    chemistryBetween++;
  }
  if (player1.league === player2.league) {
    chemistryBetween++;
  }
  if (player1.club === player2.club) {
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
  console.log(`----------------------------------------`);
  console.log(`Successfuly Generated Squad. Chemistry Score = ${teamChemistryScore}/100`);
  console.log(`----------------------------------------`);
  const squadAsArray = Object.values(squad);
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
 Please choose one of the following options:
 1. Generate squad randomly
 2. Generate Squad from one league
 3. Quit Application\n`;
 const formationMessage = `Please choose a formation - '442' or '433': `;
 const chemistryPrefMessage = `Please choose a pivot position from the list above: `;

const getStarted = () => {
  console.log(`----------------------------------------`);
  console.log(startingMessage);
  const userPath = prompt(`Type your choice ('1' / '2' / '3'), then press enter: `);
  if (userPath == "1" || userPath == "2") {
    getUserFormation();
  } else if (userPath == "3") {
    console.log(`\nClosing Application ...`);
    process.exit(0);
  } else {
    console.log(`\nInvalid input: '${userPath}'. Valid options are '1', '2', or '3'.`);
    getStarted();
  }
};

const getUserFormation = () => {
  const userFormation = prompt(`${formationMessage}`);
  console.log(`----------------------------------------`);
  if (userFormation == "442" || userFormation == "433") {
    currentFormation = userFormation;
    currentNeighborsMap = userFormation == "442" ? neighbors442 : neighbors433;
    currentSquad = getBestElevenForFormation(players, userFormation);
    printSquadObject(currentSquad, currentFormation);
    getUserChemistryPreferences();
  } else {
    console.log(`\nInvalid formation input: '${userFormation}'.`);
    getUserFormation();
  }
};

const getUserChemistryPreferences = () => {
  console.log(
    `Now that we have a starting squad, let's try to improve the overall team chemistry.
We will start with one position, and try to replace players in adjacent positions with players from the same nation/league/club.

List of positions for formation - ${currentFormation}: ${Object.keys(currentNeighborsMap).join(", ")}`
  );

  const userChemistryPosition = prompt(`${chemistryPrefMessage}`);
  console.log(`----------------------------------------`);
  if (Object.keys(currentNeighborsMap).includes(userChemistryPosition)) {
    const pivotPlayer = currentSquad[userChemistryPosition];
    console.log(
      `Improving chemistry by building squad around:
        '${pivotPlayer.name}' (${userChemistryPosition}) from '${
        getFromMap(mapOfNations, pivotPlayer.nation).name
      }' who plays for '${getFromMap(mapOfClubs, pivotPlayer.club).name}' in the '${
        getFromMap(mapOfLeagues, pivotPlayer.league).name
      }'.\n`
    );
    currentSquad = improveTeamChemistry(currentSquad, userChemistryPosition, currentNeighborsMap);
    printSquadObject(currentSquad, currentFormation);
  } else {
    console.log(`\nInvalid position input: '${userChemistryPosition}'.`);
    getUserChemistryPreferences();
  }
};

getStarted();
