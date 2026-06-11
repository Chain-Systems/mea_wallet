import { DefaultToken } from "@/types/DefaultToken";

export const imageBucket = "https://ramp.meccain.com/uploads";
export const apiBaseUrl = `https://mapi.pingwallet.info`;
// export const apiBaseUrl = `http://192.168.109.78:8080`;
export const apiKey = "450692dcc1664131acaaf3c58ff2d51a";

export const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.meccain.ping";
// TODO: replace with the real numeric App Store ID once published
export const APP_STORE_ID = "123456789";
// TODO: confirm the official website download page URL
export const WEBSITE_DOWNLOAD_URL = "https://pingwallet.info/download";
export const defaultTokenList: DefaultToken[] = [
  {
    symbol: "MEA",
    chartProvider: "coingecko",
  },
  {
    symbol: "RECON",
    chartProvider: "mea_api",
  },
  {
    symbol: "SOL",
    chartProvider: "coingecko",
  },
];

export const avatarEmojis: string[] = [
  // Faces
  "😀",
  "😃",
  "😄",
  "😁",
  "😆",
  "😅",
  "😇",
  "😉",
  "😊",
  "😎",
  "😍",
  "😘",
  "😜",
  "😝",
  "🤓",
  "🧐",
  "🥸",
  "🤠",
  "🥳",
  "🤗",
  // Animals
  "🐶",
  "🐱",
  "🐭",
  "🐹",
  "🐰",
  "🦊",
  "🐻",
  "🐼",
  "🐨",
  "🐯",
  "🦁",
  "🐮",
  "🐷",
  "🐸",
  "🐵",
  "🙈",
  "🐧",
  "🐦",
  "🦄",
  "🐉",
  // Creatures
  "👽",
  "🤖",
  "👾",
  "💀",
  "🎃",
  "👻",
  "🧙",
  "🧛",
  "🧜",
  "🧚",
  // Cute icons
  "🧸",
  "🪅",
  "🎈",
  "🍭",
  "🍩",
  "🌈",
  "⭐",
  "⚡",
  "🔥",
  "🌟",
];
