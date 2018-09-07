const debug = require('debug')('twilio-mpg:firebase');
const firebase = require('firebase');

firebase.initializeApp({
  apiKey: process.env.FIREBASE_API_KEY,
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

const db = firebase.database();

firebase.auth().signInWithEmailAndPassword(process.env.FIREBASE_AUTH_EMAIL, process.env.FIREBASE_AUTH_PASSWORD);

if (debug.enabled) {
  firebase.database.enableLogging(debug);
}
const userCarKey = (id, phone) => {
  return `${id}${phone}`;
};

/**
 *
 * @param {number} id
 * @param {number} phone
 * @returns {Promise<object>} db entry
 */
const get = (id, phone) => {
  const ukey = userCarKey(id, phone);
  const ref = db.ref(`/cars/${ukey}/fuelups/`);
  // get the single latest fuelup for this user-car
  return ref.limitToLast(1).orderByChild('timestamp').once('value').then(snapshot => {
    let val;
    snapshot.forEach(childSnapshot => {
      val = childSnapshot.val();
      // this should only be length 1 but explicitly end anyway
      return true;
    });
    debug(`db call with ${ukey} returned ${JSON.stringify(val)}`);
    return val;
  });
};

const put = (id, phone, odometer, mpgString) => {
  const ukey = userCarKey(id, phone);
  const ref = db.ref(`/cars/${ukey}/fuelups/`);
  return ref.push({
    timestamp: firebase.database.ServerValue.TIMESTAMP,
    odometer,
    plate: id,
    phone,
    mpgString
  });
};
const putUser = (id, phone) => {
  const ukey = userCarKey(id, phone);
  const ref = db.ref(`/cars/${ukey}/fuelups/`);
  return ref.push({
    timestamp: firebase.database.ServerValue.TIMESTAMP,
    plate: id,
    phone
  });
};

module.exports = {
  get,
  put,
  putUser
};
