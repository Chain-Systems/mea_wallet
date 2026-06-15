// Pure-JS SHA-1 + HMAC-SHA1 + RFC 6238 TOTP
// No imports — runs in Maestro runScript (sandboxed JS engine)
// Input:  `secret` global injected by Maestro from runScript.env
// Output: `output.totp` — 6-digit string consumed by next flow step

function sha1(msg) {
  var h0 = 0x67452301, h1 = 0xEFCDAB89, h2 = 0x98BADCFE,
      h3 = 0x10325476, h4 = 0xC3D2E1F0;

  var bitLen = msg.length * 8;
  msg.push(0x80);
  while (msg.length % 64 !== 56) msg.push(0);
  // 64-bit big-endian bit length (high 32 bits are 0 for our message sizes)
  msg.push(0, 0, 0, 0,
    (bitLen >>> 24) & 0xff, (bitLen >>> 16) & 0xff,
    (bitLen >>> 8) & 0xff,  bitLen & 0xff);

  for (var blk = 0; blk < msg.length; blk += 64) {
    var w = [];
    for (var i = 0; i < 16; i++) {
      w[i] = ((msg[blk + i * 4]     << 24) |
              (msg[blk + i * 4 + 1] << 16) |
              (msg[blk + i * 4 + 2] << 8)  |
               msg[blk + i * 4 + 3]) >>> 0;
    }
    for (var i = 16; i < 80; i++) {
      var n = (w[i-3] ^ w[i-8] ^ w[i-14] ^ w[i-16]);
      w[i] = ((n << 1) | (n >>> 31)) >>> 0;
    }

    var a = h0, b = h1, c = h2, d = h3, e = h4;

    for (var i = 0; i < 80; i++) {
      var f, k;
      if      (i < 20) { f = (b & c) | (~b & d);         k = 0x5A827999; }
      else if (i < 40) { f = b ^ c ^ d;                  k = 0x6ED9EBA1; }
      else if (i < 60) { f = (b & c) | (b & d) | (c & d); k = 0x8F1BBCDC; }
      else             { f = b ^ c ^ d;                  k = 0xCA62C1D6; }

      var temp = (((a << 5) | (a >>> 27)) + f + e + k + w[i]) >>> 0;
      e = d; d = c; c = ((b << 30) | (b >>> 2)) >>> 0; b = a; a = temp;
    }

    h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0; h4 = (h4 + e) >>> 0;
  }

  var result = [];
  [h0, h1, h2, h3, h4].forEach(function(h) {
    result.push((h >>> 24) & 0xff, (h >>> 16) & 0xff, (h >>> 8) & 0xff, h & 0xff);
  });
  return result;
}

function hmacSha1(key, msg) {
  var BLOCK = 64;
  if (key.length > BLOCK) key = sha1(key.slice());
  while (key.length < BLOCK) key.push(0);
  var opad = key.map(function(b) { return b ^ 0x5c; });
  var ipad = key.map(function(b) { return b ^ 0x36; });
  return sha1(opad.concat(sha1(ipad.concat(msg))));
}

function base32Decode(s) {
  var ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  var clean = s.toUpperCase().replace(/[=\s]/g, '');
  var bytes = [], buf = 0, bits = 0;
  for (var i = 0; i < clean.length; i++) {
    buf = (buf << 5) | ALPHA.indexOf(clean[i]);
    bits += 5;
    if (bits >= 8) { bytes.push((buf >>> (bits - 8)) & 0xff); bits -= 8; }
  }
  return bytes;
}

var key = base32Decode(secret);
var counter = Math.floor(Date.now() / 1000 / 30);
var msg = [0, 0, 0, 0,
  (counter >>> 24) & 0xff, (counter >>> 16) & 0xff,
  (counter >>> 8)  & 0xff,  counter & 0xff];

var hmac  = hmacSha1(key, msg);
var off   = hmac[hmac.length - 1] & 0x0f;
var code  = ((hmac[off] & 0x7f) << 24 | (hmac[off+1] & 0xff) << 16 |
              (hmac[off+2] & 0xff) << 8 |  hmac[off+3] & 0xff) >>> 0;

var otp = String(code % 1000000);
while (otp.length < 6) otp = '0' + otp;
output.totp = otp;
