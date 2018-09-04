const awsServerlessExpress = require('aws-serverless-express');
const {app: fuelupApp} = require('./fuelup-app');

const server = awsServerlessExpress.createServer(fuelupApp);
module.exports = {
  add: (event, context) => awsServerlessExpress.proxy(server, event, context)
};
