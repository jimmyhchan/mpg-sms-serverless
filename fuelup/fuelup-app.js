const express = require('express');
const asyncHandler = require('express-async-handler');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const twilio = require('twilio');
const log = require('debug')('twilio-mpg:fuelup');
const fuelupDb = require('./db');

const app = express();
// parse incoming form bodies nec for twilio.webhook validation
app.use(express.urlencoded({extended: true}));
app.use(awsServerlessExpressMiddleware.eventContext());

// validate every request for this entire app
// uses TWILIO_AUTH_TOKEN from dotenv
app.use(twilio.webhook({
  validate: process.env.NODE_ENV !== 'TEST'
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
const registerUser = async (id, phone) => {
  return fuelupDb.putUser(id, phone);
};
const addFuelup = async (id, phone, odometer, mpgString) => {
  return fuelupDb.put(id, phone, odometer, mpgString);
};

const parseIncomingSms = message => {
  // expect  [id] [odometer] [volume]
  // or      register [id]
  const words = message.split(/\s+/);
  // TODO: be nice to badly formatted user input. for now assume the happy path
  const register = words[0].toLowerCase() === 'register';
  if (register) {
    return [words[1]];
  }
  const id = words.shift();
  const [odometer, volume] = words.map(parseFloat);
  return [id, odometer, volume];
};

const getFirstFuelupMessage = odometer => {
  return `We recorded your first fuelup at ${odometer}. We will use this to calculate your mpg on your next recording.`;
};
const registrationMessage = id => {
  return `Welcome ${id}! On your next fuel ups, text: ${id} odometer gallons e.g. ${id} 41020 8.823`;
};

const incomingSmsToResponseMessage = async (message, phone) => {
  let [id, odometerNow, volume] = parseIncomingSms(message);
  // a registation
  if (id) {
    id = id.toUpperCase();
  }
  if (id && !odometerNow && !volume) {
    await registerUser(id, phone);
    return registrationMessage(id);
  }
  const {odometer} = await getPrevFuelup(id, phone);
  const mpgString = odometer ? calculateMpg(volume, odometer, odometerNow) : getFirstFuelupMessage(odometerNow);
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
