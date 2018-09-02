'use strict';

// const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
// const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
// const twilioClient = require('twilio')(twilioAccountSid, twilioAuthToken);
const {MessagingResponse} = require('twilio').twiml;

/*
twilioClient.messages.create({
  body: 'yeeeeeeeeeeeehaw',
  from: process.env.TWILIO_PHONE_NUMBER,
  to: process.env.MY_PHONE_NUMBER
}).then(console.log.bind(console)).done();
*/
const makeResponse = () => {
  const twiml = new MessagingResponse();
  twiml.message('from my lambda');

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/xml',
      isBase64Encoded: false
      // 'access-control-allow-origin': '*',
      // 'connection': 'close',
    },
    body: twiml.toString()

  };
};
const smsGet = (event, context, callback) => {
  const {headers} = event;
  callback(null, makeResponse(headers));
};

module.exports = {
  sms: smsGet
};
