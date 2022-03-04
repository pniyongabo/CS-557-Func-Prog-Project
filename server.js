// const http = require("http");
const player = require("./player");

// const hostname = "127.0.0.1";
const port = 3000;
const express = require('express');

const app = express();
app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));

// const server = http.createServer((req, res) => {
//   res.statusCode = 200;
//   res.setHeader("Content-Type", "text/plain");
//   res.end(`Hello Player  - ${player.first} ${player.first}`);
// });

const server = app.listen(port, () => {
  console.log(`Express running → PORT ${server.address().port}`);
});

// server.listen(port, hostname, () => {
//   console.log(`Server running at http://${hostname}:${port}/`);
// });

app.get('/', (req, res) => {
  //res.statusCode = 200;
  //res.setHeader("Content-Type", "text/html");
  //res.send(`Hello Player  - ${player.first} ${player.last}!`);
  res.render('index', {
    // firstName: player.first,
    // lastName: player.last
    title: 'FIFA Squad Builder'
  });
});
