const express = require('express');
const path = require('path');

const app = express();

app.use("/public", express.static(__dirname + "/built"));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'built/index.html')));

app.listen(3000, () => console.log('coool!'));
