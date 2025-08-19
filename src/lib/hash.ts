const hash = (str: string, seed = 0): number => {
  let h = seed;
  const len = str.length;
  let i = 0;

  while (i + 4 <= len) {
    let k =
      (str.charCodeAt(i) & 0xff) |
      ((str.charCodeAt(i + 1) & 0xff) << 8) |
      ((str.charCodeAt(i + 2) & 0xff) << 16) |
      ((str.charCodeAt(i + 3) & 0xff) << 24);

    k = (k << 15) | (k >>> 17);
    k = k * 0x1b873593;

    h ^= k;
    h = (h << 13) | (h >>> 19);
    h = h * 5 + 0xe6546b64;

    i += 4;
  }

  let remaining = len - i;
  if (remaining > 0) {
    let k = 0;
    while (remaining-- > 0) {
      k |= (str.charCodeAt(i++) & 0xff) << (remaining * 8);
    }
    k = (k << 15) | (k >>> 17);
    k = k * 0x1b873593;
    h ^= k;
  }

  h ^= len;
  h ^= h >>> 16;
  h = h * 0x85ebca6b;
  h ^= h >>> 13;
  h = h * 0xc2b2ae35;
  h ^= h >>> 16;

  return h >>> 0;
};

export default hash;
