const port = 3000;
const express = require('express');

const players = require('./data/players.json');
const nations = require('./data/nations.json');
const clubs = require('./data/clubs.json');
const leagues = require('./data/leagues.json');

const mapOfNations = new Map(nations.map(obj => [obj.id, obj]));
const mapOfClubs = new Map(clubs.map(obj => [obj.id, obj]));
const mapOfLeagues= new Map(leagues.map(obj => [obj.id, obj]));


const app = express();
app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));

const server = app.listen(port, () => {
  console.log(`Express running → PORT ${server.address().port}`);
});

app.get('/', (req, res) => {
  res.render('index', {
    title: 'FIFA Squad Builder',
    players: players
  });
});

app.get('/player', (req, res) => {
  const player = players.find(p => p.id == req.query.id);
  // console.log(player.club);
  // console.log(mapOfClubs[`${player.club}`]);
  // console.log(mapOfClubs);
  // console.log(typeof mapOfClubs);
  if (mapOfClubs[`${player.club}`]) {

    console.log("player club: " + mapOfClubs[player.club]);
    player['clubName'] = mapOfClubs[player.club].name;
  } else {
    player['clubName']= "";
  }
  player['clubName'] = mapOfClubs.get(player.club) ? mapOfClubs.get(player.club).name : " - ";
  player['leagueName'] = mapOfLeagues.get(player.league) ? mapOfLeagues.get(player.league).name : " - ";
  player['nationName'] = mapOfNations.get(player.nation) ? mapOfNations.get(player.nation).name : " - ";
  res.render('player', {
    title: `About ${player.common_name}`,
    player,
  });
});
