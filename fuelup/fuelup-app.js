const express = require('express');
const asyncHandler = require('express-async-handler');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const twilio = require('twilio');
const fuelupDb = require('./db');
const log = require('debug')('twilio-mpg:fuelup');

const app = express();
// parse incoming form bodies nec for twilio.webhook validation
app.use(express.urlencoded({extended: true}));
app.use(awsServerlessExpressMiddleware.eventContext());

// validate every request for this entire app
// uses TWILIO_AUTH_TOKEN from dotenv
// TODO: why is this failing to validate
app.use(twilio.webhook({
  validate: false // process.env.NODE_ENV !== 'TEST'
}));

// const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
// const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
// const twilioClient = require('twilio')(twilioAccountSid, twilioAuthToken);
const {MessagingResponse} = twilio.twiml;

// number -> string
const formatMpg = mpg => {
  return `${mpg} mpg`;
};
const calculateMpg = (amount, odometerPrev, odometerNow, formatter = formatMpg) => {
  log(`found data ${odometerPrev}`);
  // TODO: mpg and other units
  return formatter(Number.parseFloat((odometerNow - odometerPrev) / amount).toFixed(1));
};

const getPrevFuelup = async (id, phone) => {
  // TODO: sanitize id / phone data
  return fuelupDb.get(id, phone);
};
const addFuelup = async (id, phone, odometer, mpgString) => {
  return fuelupDb.put(id, phone, odometer, mpgString);
};

const parseIncomingSms = message => {
  // expect  [id] [odometer] [volume]
  const [id, odometer, volume] = message.split(/\s+/).map(parseFloat);
  return [id, odometer, volume];
};

const incomingSmsToResponseMessage = async (message, phone) => {
  const [id, odometerNow, volume] = parseIncomingSms(message);
  const {odometer} = await getPrevFuelup(id, phone);
  const mpgString = calculateMpg(volume, odometer, odometerNow);
  await addFuelup(id, phone, odometerNow, mpgString);
  return mpgString;
};

app.post('/fuelup', asyncHandler(async (req, res, next) => {
  const incoming = req.body.Body;
  const from = req.body.From;
  const twiml = new MessagingResponse();
  twiml.message(await incomingSmsToResponseMessage(incoming, from));
  res.type('text/xml');
  res.send(twiml.toString());
}));

app.get('/fuelup', (req, res) => {
  res.send('hello from server');
});

module.exports = {
  app,
  parseIncomingSms,
  calculateMpg
};
