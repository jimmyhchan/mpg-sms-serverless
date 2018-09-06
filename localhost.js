#!/usr/bin/env node
// usage
//   localhost fuelup
// will bring up the fuelup express app locally
require('dotenv').config()

const func = process.argv.slice(2)[0];

process.env.NODE_ENV = 'TEST';
if (!func) {
  console.error('Need a second argument');
  process.exit(1);
}
const {app} = require(`./${func}/${func}-app`);
const port = 3000;
app.listen(port);

console.log(`listening on http://localhost:${port}/${func}`);
