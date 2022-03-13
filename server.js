// const port = 3000;
// const express = require('express');

const players = require('./data/players.json');
const nations = require('./data/nations.json');
const clubs = require('./data/clubs.json');
const leagues = require('./data/leagues.json');

const messi = require('./data/individuals/messi.json');
const dias = require('./data/individuals/dias.json');
const jorginho = require('./data/individuals/jorginho.json');
const donnarumma = require('./data/individuals/donnarumma.json');

const mapOfNations = new Map(nations.map(obj => [obj.id, obj]));
const mapOfClubs = new Map(clubs.map(obj => [obj.id, obj]));
const mapOfLeagues= new Map(leagues.map(obj => [obj.id, obj]));


// const app = express();
// app.use(express.static(__dirname + '/public'));
// app.set('view engine', 'pug');

class SquadOfEleven {
  constructor() {
    this.gk = donnarumma;
    this.lb = dias;
    this.cb1 = dias;
    this.cb2 = dias;
    this.rb = dias;
    this.lm = jorginho;
    this.cm1 = jorginho;
    this.cm2 = jorginho;
    this.rm = jorginho;
    this.st1 = messi;
    this.st2 = messi;
  }
}

const filterPlayersByNation = (name) => {
  return players.filter(player => mapOfNations.get(player.nation) && mapOfNations.get(player.nation).name == name);
}

const filterPlayersByLeague = (name) => {
  return players.filter(player => mapOfLeagues.get(player.league) && mapOfLeagues.get(player.league).name == name);
}

const filterPlayersByClub = (name) => {
  return players.filter(player => mapOfClubs.get(player.club) && mapOfClubs.get(player.club).name == name);
}

// Example usage of Filter Methods
// const playersFromNetherlands = filterPlayersByNation('Netherlands');
// const playersFromPremierLeague = filterPlayersByLeague('Premier League');
// const playersFromArsenal = filterPlayersByClub('Arsenal');

// Print the results using Map
const printDetailsForAListOfPlayers = (listOfPlayers) => {
  console.log(`| ${"PLAYER NAME".padEnd(25)} | ${"AGE".padEnd(3)} | ${"RATING".padEnd(6)} | ${"POSITION".padEnd(8)} |`);
  listOfPlayers.map(player => printDetailsForOnePlayer(player));
  console.log("")
}

const printDetailsForOnePlayer = (player) => {
  console.log(`| ${player.name.padEnd(25)} | ${player.age.toString().padEnd(3)} | ${player.rating.toString().padEnd(6)} | ${player.position.padEnd(8)} |`);
}

// console.log(`PRINTING ----- playersFromNetherlands`);
// printDetailsForAListOfPlayers(playersFromNetherlands);
// console.log(`PRINTING ----- playersFromPremierLeague`);
// printDetailsForAListOfPlayers(playersFromPremierLeague);
// console.log(`PRINTING ----- playersFromArsenal`);
// printDetailsForAListOfPlayers(playersFromArsenal);

/**
 * // create 2 or 3 squads: 442 and 433 // return the one with most chemistry
 * @param {*} players 
 * @returns bestEleven squad
 */
const getBestEleven = (players) => {
  const bestEleven442 = getBestEleven442(players);
  const bestEleven433 = getBestEleven433(players);
  return bestEleven442;
}

/**
 * // start with goal-keeper // add one CB, CM, ST // add one CB, CM, ST
 * @param {*} players 
 * @returns bestEleven442 squad
 */
 const getBestEleven442 = (players) => {
  const bestEleven442 = {};
  let numberOfPlayerAdded = 0;
  players.map(player => {
    numberOfPlayerAdded++;
    if (player.position == 'GK'){
      bestEleven442["gk"] = player;
    }
    else if (player.position == 'LB'){
      bestEleven442["lb"] = player;
    }
    else if (player.position == 'CB'){
      if (bestEleven442.clcbb1 === undefined) {
        bestEleven442["lcb"] = player;
      } else if(bestEleven442.rcb === undefined) {
        bestEleven442["rcb"] = player;
      }
    }
    else if (player.position == 'RB'){
      bestEleven442["rb"] = player;
    }
    else if (player.position == 'LM'){
      bestEleven442["lm"] = player;
    }
    else if (player.position == 'CM' || player.position == 'CAM' || player.position == 'CDM'){
      if (bestEleven442.lcm === undefined) {
        bestEleven442["lcm"] = player;
      } else if(bestEleven442.rcm === undefined) {
        bestEleven442["rcm"] = player;
      }
    }
    else if (player.position == 'RM'){
      bestEleven442["rm"] = player;
    }
    else if (player.position == 'ST' || player.position == 'CF'){
      if (bestEleven442.lst === undefined) {
        bestEleven442["lst"] = player;
      } else if(bestEleven442.rst === undefined) {
        bestEleven442["rst"] = player;
      }
    } else {
      numberOfPlayerAdded--;
    }

    if (numberOfPlayerAdded === 11) {
      return bestEleven442;
    }
  });
  return bestEleven442;
}

const getBestEleven433 = (players) => {
  const bestEleven433 = {};
  let numberOfPlayerAdded = 0;
  players.map(player => {
    numberOfPlayerAdded++;
    if (player.position == 'GK'){
      bestEleven433["gk"] = player;
    }
    else if (player.position == 'LB'){
      bestEleven433["lb"] = player;
    }
    else if (player.position == 'CB'){
      if (bestEleven433.lcb === undefined) {
        bestEleven433["lcb"] = player;
      } else if(bestEleven433.rcb === undefined) {
        bestEleven433["rcb"] = player;
      }
    }
    else if (player.position == 'RB'){
      bestEleven433["rb"] = player;
    }
    else if (player.position == 'CM' || player.position == 'CAM' || player.position == 'CDM'){
      if (bestEleven433.lcm === undefined) {
        bestEleven433["lcm"] = player;
      } else if(bestEleven433.cm === undefined) {
        bestEleven433["cm"] = player;
      } else if(bestEleven433.rcm === undefined) {
        bestEleven433["rcm"] = player;
      }
    }
    else if (player.position == 'LW' || player.position == 'LM'){ 
      bestEleven433["lw"] = player;
    }
    else if (player.position == 'ST' || player.position == 'CF'){
      bestEleven433["st"] = player;
    }
    else if (player.position == 'RW' || player.position == 'RM'){
      bestEleven433["rw"] = player;
    } else {
      numberOfPlayerAdded--;
    }

    if (numberOfPlayerAdded === 11) {
      return bestEleven433;
    }
  });
  return bestEleven433;
}

console.log(`PRINTING ----- BEST SQUAD SO FAR`);
const bestSquadAsArray = Object.values(getBestEleven(players));
printDetailsForAListOfPlayers(bestSquadAsArray);

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
