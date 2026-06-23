/**
 * Generates a 6-digit TOTP code (RFC 6238) from a base32 secret.
 * Reads TOTP_SECRET from the first CLI arg or TOTP_SECRET env var.
 *
 * Usage:
 *   npx tsx scripts/gen_totp.ts [BASE32_SECRET]
 *   TOTP_SECRET=JBSWY3DPEHPK3PXP npx tsx scripts/gen_totp.ts
 */

import { createHmac } from "crypto";

function base32Decode(input: string): Buffer {
  const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const clean = input.toUpperCase().replace(/[=\s]/g, "");
  const bytes: number[] = [];
  let buf = 0;
  let bits = 0;

  for (const ch of clean) {
    const idx = CHARS.indexOf(ch);
    if (idx === -1) throw new Error(`Invalid base32 character: ${ch}`);
    buf = (buf << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((buf >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

function totp(secret: string, digits = 6, period = 30): string {
  const key = base32Decode(secret);
  const counter = Math.floor(Date.now() / 1000 / period);

  // counter as big-endian 8-byte buffer
  const msg = Buffer.alloc(8);
  msg.writeBigInt64BE(BigInt(counter));

  const hmac = createHmac("sha1", key).update(msg).digest();

  // Dynamic truncation (RFC 4226)
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return String(code % 10 ** digits).padStart(digits, "0");
}

const secret = process.argv[2] ?? process.env.TOTP_SECRET;
if (!secret) {
  console.error(
    "Error: provide secret as CLI arg or set TOTP_SECRET env var"
  );
  process.exit(1);
}

console.log(totp(secret));
