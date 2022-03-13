// const port = 3000;
// const express = require('express');

const players = require("./data/players.json");
const nations = require("./data/nations.json");
const clubs = require("./data/clubs.json");
const leagues = require("./data/leagues.json");

const neighbors433 = require("./data/formations/433.json");
const neighbors442 = require("./data/formations/442.json");
const altPositionsMap = require("./data/formations/altPositionsMap.json");

// const messi = require('./data/individuals/messi.json');
// const dias = require('./data/individuals/dias.json');
// const jorginho = require('./data/individuals/jorginho.json');
// const donnarumma = require('./data/individuals/donnarumma.json');

const mapOfNations = new Map(nations.map((obj) => [obj.id, obj]));
const mapOfClubs = new Map(clubs.map((obj) => [obj.id, obj]));
const mapOfLeagues = new Map(leagues.map((obj) => [obj.id, obj]));

const prompt = require("prompt-sync")({ sigint: true });

const appTitle = 'FIFA Squad Builder';
const formationMessage = `Please choose a formation - '442' or '433': `;


// const app = express();
// app.use(express.static(__dirname + '/public'));
// app.set('view engine', 'pug');

// class SquadOfEleven {
//   constructor() {
//     this.gk = donnarumma;
//     this.lb = dias;
//     this.cb1 = dias;
//     this.cb2 = dias;
//     this.rb = dias;
//     this.lm = jorginho;
//     this.cm1 = jorginho;
//     this.cm2 = jorginho;
//     this.rm = jorginho;
//     this.st1 = messi;
//     this.st2 = messi;
//   }
// }

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

// Example usage of Filter Methods
// const playersFromNetherlands = filterPlayersByNation('Netherlands');
// const playersFromPremierLeague = filterPlayersByLeague('Premier League');
// const playersFromArsenal = filterPlayersByClub('Arsenal');

// Print the results using Map
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
  if (formation == '442') { 
     bestEleven = getBestEleven442(players);
  } else if (formation == '433') {  
    bestEleven = getBestEleven433(players);
  } 
  return bestEleven;
}

const improveTeamChemistry = (team, pivotPos, neighborsMap) => {
  const improvedTeam = team;
  const pivotPlayer = team[pivotPos];

  const pivotNeighborPlayers = [...filterPlayersByNation(pivotPlayer.nation), ...filterPlayersByLeague(pivotPlayer.league), ...filterPlayersByClub(pivotPlayer.club)];

  //console.log("pivotNeighborPlayers length: "+pivotNeighborPlayers.length);
  let pivotNeighborPlayersNoDup = (uniq = [...new Set(pivotNeighborPlayers)]);
  //console.log("pivotNeighborPlayersNoDup length: "+ pivotNeighborPlayersNoDup.length);

  for (const neighborPos of neighborsMap[pivotPos]) {
    const formattedPosition = altPositionsMap.hasOwnProperty(neighborPos) ? altPositionsMap[neighborPos] : neighborPos;
    let potentialPlayersforPos = filterPlayersByPosition(pivotNeighborPlayersNoDup, formattedPosition);

    //console.log("potentialPlayerforPos: "+ neighborPos + " has length: "+ potentialPlayersforPos.length);
    for (const potentialPlayer of potentialPlayersforPos) {
      if (
        calculateChemistryBetween(pivotPlayer, potentialPlayer) >
        calculateChemistryBetween(pivotPlayer, improvedTeam[neighborPos])
      ) {
        improvedTeam[neighborPos] = potentialPlayer;
        //console.log("HIT THE JACKPOT");
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
    //let neighborPlayersNames = "";
    for (const neighborPos of neighborsMap[pos]) {
      //neighborPlayersNames += `${team[neighborPos].name}, `;
      playerChemistry += calculateChemistryBetween(team[pos], team[neighborPos]);
    }

    let roundedChemisty = Math.floor((playerChemistry * 10) / maxPlayerChemistry);
    //console.log(`player = ${team[player].name}, neighbors = ${neighborPlayersNames}, playerChemistry = ${playerChemistry}, roundedChemisty = ${roundedChemisty}, maxPlayerChemistry = ${maxPlayerChemistry} `);
    totalChemistry += roundedChemisty;
  }
  //console.log("---------------------");
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
  if (formation == '442') {
    teamChemistryScore = calculateTeamChemistry(squad, neighbors442);
  } else if (formation == '433') {
    teamChemistryScore = calculateTeamChemistry(squad, neighbors433);
  }
  console.log(`----------------------------------------`);
  console.log(`Successfuly Generated Squad. Chemistry Score = ${teamChemistryScore}/100`);
  console.log(`----------------------------------------`);
  const squadAsArray = Object.values(squad);
  printDetailsForAListOfPlayers(squadAsArray);
  console.log(`----------------------------------------`);
}



/**
 * BEGIN - SERVING HTML FILE
 */

// app.get('/', (req, res) => {
//   console.log("page getting retrieved");
//   res.render('index.html', {
//     title: 'FIFA Squad Builder',
//     players: players
//   });
// });

/**
 * END - SERVING HTML FILE
 */

/*
 ****************************************************************
 */

/**
 * BEGIN - PUG CODE
 */

// app.get('/', (req, res) => {
//   res.render('players_gallery', {
//     title: 'FIFA Squad Builder',
//     players: players
//   });
// });

// app.get('/player', (req, res) => {
//   const player = players.find(p => p.id == req.query.id);
//   player['clubName'] = mapOfClubs.get(player.club) ? mapOfClubs.get(player.club).name : " - ";
//   player['leagueName'] = mapOfLeagues.get(player.league) ? mapOfLeagues.get(player.league).name : " - ";
//   player['nationName'] = mapOfNations.get(player.nation) ? mapOfNations.get(player.nation).name : " - ";
//   res.render('player_profile', {
//     title: `About ${player.common_name}`,
//     player,
//   });
// });

/**
 * END - PUG CODE
 */

// const server = app.listen(port, () => {
//   console.log(`Express running → PORT ${server.address().port}`);
// });

const getUserFormation = () => {
  const userFormation = prompt(`${formationMessage}`);
  console.log(`----------------------------------------`);
  if (userFormation == '442' || userFormation == '433') {
    const userSquad = getBestElevenForFormation(players, userFormation);
    printSquadObject(userSquad, userFormation);
  } else {
    console.log(`Invalid formation input: ${userFormation}.`)
    getUserFormation();
  }
}  

console.log(`Welcome to ${appTitle}!`);
getUserFormation();