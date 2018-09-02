'use strict';

const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;

const twilioClient = require('twilio')(twilioAccountSid, twilioAuthToken);

twilioClient.messages.create({
  body: 'yeeeeeeeeeeeehaw',
  from: process.env.TWILIO_PHONE_NUMBER,
  to: process.env.MY_PHONE_NUMBER
}).then(console.log.bind(console)).done();

/*
module.exports.hello = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless v1.0! Your function executed successfully!',
      input: event,
    }),
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};

*/