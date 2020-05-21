import tap from 'tap';
import { protect, suspect } from '../src/main.js';

const { test } = tap;

test('this-capture', t => {
  const mallory = suspect(function(arg) {
    try {
      // console.log('in mallory');
      t.equals(arg.mood, 'happy', 'mallory is happy');
      t.equals(this.secret, undefined, `mallory didn't find the secret`);
      let ex;
      try {
        arg.mood = 'upset';
      } catch (e) {
        ex = e;
      }
      t.assert(ex instanceof TypeError, `mallory failed to upset the mood`);
      t.equals(arg.mood, 'happy', `mallory really didn't upset the mood`);
      return arg;
    } finally {
      // console.log('leaving mallory');
    }
  });

  const alice = protect(arg => {
    try {
      // console.log('in alice');
      t.equals(arg.mood, 'happy', 'alice is happy');
      let ex;
      try {
        arg.accident = 'oops';
      } catch (e) {
        ex = e;
      }
      t.assert(ex instanceof TypeError, `alice didn't have an accident`);
      t.equals(arg.accident, undefined, `alice really didn't have an accident`);
      return arg;
    } finally {
      // console.log('leaving alice');
    }
  });
  
  const bob = protect(() => {
    console.log('in bob');
    const obj = { secret: 'sensitive', a: alice, m: mallory };
    const arg = { mood: 'happy' };
    const aarg = obj.a(arg);
    t.equals(aarg, arg, `alice's identity is preserved`);
    const marg = obj.m(arg);
    t.equals(marg, arg, `mallory's identity is preserved`);
    t.equals(arg.mood, 'happy', 'bob remains happy');
    console.log('leaving bob');
  });
  
  bob();
  t.end();
});

test('mutable between suspects', t => {
  const carol = suspect(a => (a.counter += 1));
  const dave = suspect(() => {
    const a = { counter: 0 };
    carol(a);
    t.equals(a.counter, 1, 'mutation allowed');
  });
  dave();
  t.end();
});

test('mutable given to protect', t => {
  const carol = protect(a => (a.counter += 1));
  const dave = suspect(() => {
    const a = { counter: 0 };
    carol(a);
    t.equals(a.counter, 1, 'mutation allowed');
  });
  dave();
  t.end();
});

test('immutable from protect/suspect', t => {
  const carol = suspect(a => {
    try {
      a.counter += 1;
    } catch (e) {
      t.assert(e instanceof TypeError, 'carol cannot mutate');
    }
  });
  const dave = protect(() => {
    const a = { counter: 0 };
    carol(a);
    t.equals(a.counter, 0, 'mutation not allowed');
  });
  dave();
  t.end();
});

test('mutable when not suspected', t => {
  const carol = a => a.counter += 1;
  const dave = protect(() => {
    const a = { counter: 0 };
    carol(a);
    t.equals(a.counter, 1, 'mutation allowed');
  });
  dave();
  t.end();
});
