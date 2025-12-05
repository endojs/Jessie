/**
 * @file Tests for complete code examples from Hardened JavaScript slides.
 * These are reference examples showing what valid Jessie code looks like.
 * @see https://gist.githubusercontent.com/dckc/88670346a52ae4e6e693fdfa2f5cfd14/raw/131d45d0dda7fc06fbe91c0e2baa9a76ac6ce448/hardened-js-intro.md
 */

import { describe, it, expect } from 'vitest';

/**
 * Complete code examples from the Hardened JavaScript intro slides.
 * These represent the target output that our Blockly tools should be able to generate.
 */
describe('Hardened JavaScript Slides Examples', () => {
  it('origin - simple object with arrow functions', () => {
    const code = `const origin = {
    getX: () => 0,
    getY: () => 0,
};`;
    expect(code).toBeTruthy();
  });

  it('makeCounter - basic version', () => {
    const code = `const makeCounter = init => {
  let value = init;
  return {
    increment: () => (value += 1),
    decrement: () => (value -= 1),
    makeOffsetCounter: delta => makeCounter(value + delta),
  };
};`;
    expect(code).toBeTruthy();
  });

  it('makeCounter - with harden', () => {
    const code = `const makeCounter = init => {
  let value = init;
  return harden({
    increment: () => (value += 1),
    decrement: () => (value -= 1),
    makeOffsetCounter: delta => makeCounter(value + delta),
  });
};`;
    expect(code).toBeTruthy();
  });

  it('makeCounter - with TypeScript annotations', () => {
    const code = `// @ts-check

/** @param {number} init */
const makeCounter = init => {
  let value = init;
  return {
    increment: () => (value += 1),
    decrement: () => (value -= 1),
    /** @param {number} delta */
    makeOffsetCounter: delta => makeCounter(value + delta),
  };
};`;
    expect(code).toBeTruthy();
  });

  it('makeCounter - with Nat type guards', () => {
    const code = `/** @param {number | bignum} init */
const makeCounter = init => {
  let value = Nat(init);
  return harden({
    increment: () => (value += 1n),
    /** @param {number | bignum} delta */
    makeOffsetCounter: delta => makeCounter(value + Nat(delta)),
  });
};`;
    expect(code).toBeTruthy();
  });

  it('makeMint - complete electronic rights example', () => {
    const code = `const makeMint = () => {
  const ledger = makeWeakMap();

  const issuer = harden({
    makeEmptyPurse: () => mint.makePurse(0),
  });

  const mint = harden({
    makePurse: initialBalance => {
      const purse = harden({
        getIssuer: () => issuer,
        getBalance: () => ledger.get(purse),

        deposit: (amount, src) => {
          Nat(ledger.get(purse) + Nat(amount));
          ledger.set(src, Nat(ledger.get(src) - amount));
          ledger.set(purse, ledger.get(purse) + amount);
        },
        withdraw: amount => {
          const newPurse = issuer.makeEmptyPurse();
          newPurse.deposit(amount, purse);
          return newPurse;
        },
      });
      ledger.set(purse, initialBalance);
      return purse;
    },
  });

  return mint;
};`;
    expect(code).toBeTruthy();
  });

  it('makeFlexList - linked list example', () => {
    const code = `const makeFlexList = () => {
  let head;
  let tail;
  const list = harden({
    push: item => {
      const cell = { item, next: undefined, previous: tail };
      tail = cell;
      if (head === undefined) {
        head = cell;
      }
    },
    at: target => {
      if (!Number.isInteger(target) || target < 0) {
        throw RangeError(target);
      }
      const position = 0;
      for (let cell = head; cell !== undefined; cell = cell.next) {
        if (position === target) {
          return cell.item;
        }
        position += 1;
      }
      return undefined;
    },
    forEach: f => {
      let position = 0;
      for (let cell = head; cell !== undefined; cell = cell.next) {
        f(cell.item, position, list);
        position += 1;
      }
      return false;
    },
  });
  return list;
};`;
    expect(code).toBeTruthy();
  });

  it('makeGame - rest parameters example', () => {
    const code = `const makeGame = (...players) => {
  // TODO: harden(players)
  return harden({
    playing: () => players,
  });
};`;
    expect(code).toBeTruthy();
  });

  it('arrow function with block body', () => {
    const code = `const f = (a, b) => {
  g(a);
  h(b);
  return a + b;
};`;
    expect(code).toBeTruthy();
  });

  it('switch statement', () => {
    const code = `switch (value) {
  case 'a':
  case 'b': {
    /* 'a' and 'b' block */
    break;
  }
  default: {
    /* default block */
  }
}`;
    expect(code).toBeTruthy();
  });

  it('destructuring - object property access alternatives', () => {
    const code = `const s = order.size;     // better as... 
const { size: s } = order;

const size = order.size; // better as...
const { size } = order;`;
    expect(code).toBeTruthy();
  });

  it('destructuring - array examples', () => {
    const code = `const s1 = sizes[0];
const s2 = sizes[1];
const rest = sizes.slice(2);  // better as...

const [s1, s2, ...rest] = sizes;`;
    expect(code).toBeTruthy();
  });

  it('destructuring - complex nested pattern', () => {
    const code = `const [{ size: s1, color, ...details }, { size: s2 }] = orders;`;
    expect(code).toBeTruthy();
  });

  it('destructuring - function parameter', () => {
    const code = `const serviceOrder = ({ size, shape }) => {
  ...
};`;
    expect(code).toBeTruthy();
  });

  it('default parameter - typeof check', () => {
    const code = `const f = (a, opt) => {
  if (typeof opt !== 'undefined') {
    ...
  }
};`;
    expect(code).toBeTruthy();
  });

  it('default parameter - direct syntax', () => {
    const code = `const f = (a, b = 0) => {
}`;
    expect(code).toBeTruthy();
  });
});
