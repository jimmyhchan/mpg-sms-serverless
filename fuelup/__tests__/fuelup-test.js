import test from 'ava';
import {calculateMpg, parseIncomingSms} from '../fuelup-app';

test('calculations for mpg', t => {
  t.is(calculateMpg(5, 100, 200), '20.0 mpg');
  t.is(calculateMpg(5, 199, 200), '0.2 mpg');
});
test('parse incoming sms', t => {
  t.deepEqual(parseIncomingSms('123 456 789'), [123, 456, 789]);
});
