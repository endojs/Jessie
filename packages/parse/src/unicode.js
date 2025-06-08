/* eslint-disable no-bitwise */

export const codePointToHex = (n, prefix = '0x', quantum = 2) => {
  const hex = n.toString(16).padStart(4, '0');

  // Pad to a minimum of 4 hexits.
  let pad = Math.max(hex.length, 4);
  if (pad % 2) {
    // Even number of hexits.
    pad += 1;
  }

  const padded = hex.padStart(pad, '0');
  return `U+${padded}`;
};

/**
 * @param {number | string} [b]
 * @returns {number}
 */
const getByte = b => {
  if (b === undefined) {
    return undefined;
  }
  let code = b;
  if (typeof b === 'string') {
    assert.equal(b.length, 1);
    code = b.charCodeAt(0);
  }

  assert(
    code >= 0x00 && code <= 0xff,
    `Invalid character code for byte: ${code}`,
  );
  return code;
};

/**
 * @param {string} b0
 * @param {string} [b1]
 * @param {string} [b2]
 * @param {string} [b3]
 * @returns {number}
 */
export const fromUtf8 = (b0, b1, b2, b3) => {
  let lowestValidCodePoint;
  let codePoint;

  const octets = [b0, b1, b2, b3].map(getByte);
  assert(octets[0] !== undefined, 'First argument must be a valid byte');
  if (octets[1] === undefined) {
    lowestValidCodePoint = 0;
    codePoint = octets[0] & 0x7f;
  } else if (octets[2] === undefined) {
    lowestValidCodePoint = 0x80;
    codePoint = ((octets[0] & 0x1f) << 6) | (octets[1] & 0x3f);
  } else if (octets[3] === undefined) {
    lowestValidCodePoint = 0x800;
    codePoint =
      ((octets[0] & 0x0f) << 12) |
      ((octets[1] & 0x3f) << 6) |
      (octets[2] & 0x3f);
  } else {
    lowestValidCodePoint = 0x010000;
    codePoint =
      ((octets[0] & 0x07) << 18) |
      ((octets[1] & 0x3f) << 12) |
      ((octets[2] & 0x3f) << 6) |
      (octets[3] & 0x3f);
  }

  if (codePoint < lowestValidCodePoint) {
    throw Error(
      `Overlong UTF-8 sequence: ${codePointToHex(codePoint)} < ${codePointToHex(
        lowestValidCodePoint,
      )}`,
    );
  }
  return codePoint;
};

export const toUtf8 = codePoint => {
  const utf8 = [];
  if (codePoint <= 0x7f) {
    utf8.push(codePoint);
  } else if (codePoint <= 0x7ff) {
    utf8.push(0xc0 | (codePoint >> 6));
    utf8.push(0x80 | (codePoint & 0x3f));
  } else if (codePoint <= 0xffff) {
    utf8.push(0xe0 | (codePoint >> 12));
    utf8.push(0x80 | ((codePoint >> 6) & 0x3f));
    utf8.push(0x80 | (codePoint & 0x3f));
  } else {
    utf8.push(0xf0 | (codePoint >> 18));
    utf8.push(0x80 | ((codePoint >> 12) & 0x3f));
    utf8.push(0x80 | ((codePoint >> 6) & 0x3f));
    utf8.push(0x80 | (codePoint & 0x3f));
  }
  return utf8.map(b => String.fromCodePoint(b)).join('');
};
