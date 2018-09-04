'use strict';

// const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
// const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
// const twilioClient = require('twilio')(twilioAccountSid, twilioAuthToken);
const {MessagingResponse} = require('twilio').twiml;
const {makeXmlResponse} = require('./utils');

/*
twilioClient.messages.create({
  body: 'yeeeeeeeeeeeehaw',
  from: process.env.TWILIO_PHONE_NUMBER,
  to: process.env.MY_PHONE_NUMBER
}).then(console.log.bind(console)).done();
*/
const smsGet = (event, context, callback) => {
  const twiml = new MessagingResponse();
  twiml.message('from my lambda');
  callback(null, makeXmlResponse(twiml.toString));
};

module.exports = {
  sms: smsGet
};
