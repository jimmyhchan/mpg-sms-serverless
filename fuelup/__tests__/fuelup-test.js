import test from 'ava';
import request from 'supertest';
import {app, calculateMpg, parseIncomingSms} from '../fuelup-app';

test('calculations for mpg', t => {
  t.is(calculateMpg(5, 100, 200), '20.0 mpg');
  t.is(calculateMpg(5, 199, 200), '0.2 mpg');
});
test('parse incoming sms', t => {
  t.deepEqual(parseIncomingSms('123 456 789'), [123, 456, 789]);
});
test('endPoint testing', async t => {
  t.plan(1);
  const resGet = await request(app).get('/fuelup');
  // const resPost = await request(app).post('/fuelup').send({
  //   Body: '123 456 789'
  // });
  t.is(resGet.status, 200);
  // t.is(resGet.body, 'hello from server');

  // t.is(resPost.status, 200);
  // t.is(resPost.body, 'blah');
});
