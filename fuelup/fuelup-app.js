const express = require('express');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const twilio = require('twilio');

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
  // TODO: mpg and other units
  return formatter(Number.parseFloat((odometerNow - odometerPrev) / amount).toFixed(1));
};

const getPrevOdometer = id => {
  // TODO: firebase or dynamodb here
  return {
    id,
    odometer: 123456
    // date?
    // price?
  };
};

const parseIncomingSms = message => {
  // expect  [id] [odometer] [volume]
  const [id, odometer, volume] = message.split(/\s+/).map(parseFloat);
  return [id, odometer, volume];
};

const incomingSmsToResponseMessage = message => {
  const [id, odometerNow, volume] = parseIncomingSms(message);
  const {odometer} = getPrevOdometer(id);
  return calculateMpg(volume, odometer, odometerNow);
};

app.post('/fuelup', (req, res) => {
  const incoming = req.body.Body;
  const twiml = new MessagingResponse();
  twiml.message(incomingSmsToResponseMessage(incoming));
  res.type('text/xml');
  res.send(twiml.toString());
});

app.get('/fuelup', (req, res) => {
  res.send('hello from server');
});

module.exports = {
  app,
  parseIncomingSms,
  calculateMpg
};
