const debug = require('debug')('twilio-mpg:firebase');
const firebase = require('firebase');

firebase.initializeApp({
  apiKey: process.env.FIREBASE_API_KEY,
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

const db = firebase.database();
if (debug.enabled) {
  firebase.database.enableLogging(debug);
}
const userCarKey = (id, phone) => {
  return `${id}${phone}`;
};
const fuelupKey = (id) => {
  return `uniq-${id}`;
};

/**
 *
 * @param {number} id
 * @param {number} phone
 * @returns {Promise<object>} db entry
 */
const get = (id, phone) => {
  const ukey = userCarKey(id, phone);
  const fkey = fuelupKey(id);
  const ref = db.ref(`/cars/${ukey}/fuelups/${fkey}/`);
  return ref.limitToLast(1).once('value').then(snapshot => {
    const val = snapshot.val();
    debug(`db call with ${ukey} returned ${JSON.stringify(val)}`);
    return val;
  });
};

const put = (id, phone, odometer) => {
  const ukey = userCarKey(id, phone);
  const ref = db.ref(`/cars/${ukey}/fuelups/`);
  return ref.push({
    timestamp: firebase.database.ServerValue.TIMESTAMP,
    odometer
  });
};

module.exports = {
  get,
  put
};
