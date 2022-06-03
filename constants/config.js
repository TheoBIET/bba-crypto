require("dotenv").config();

module.exports = {
  TOKEN: process.env.TOKEN,
  EVENT: {
    READY: "ready",
    MESSAGE_CREATE: "messageCreate",
  },
  CURRENCIES: ["usd", "eur"],
  CRYPTOS: [
    "bitcoin",
    "solana",
    "ethereum",
    "tether",
    "usd-coin",
    "binancecoin",
    "cardano",
    "ripple",
    "binance-usd",
    "dogecoin",
  ],
  CRYPTOS_COLORS: {
    bitcoin: "#f9a825",
    solana: "#DC1FFF",
    ethereum: "#3c3c3d",
    tether: "#50AF95",
    usd_coin: "#307BCC",
    binancecoin: "#F0B90B",
    cardano: "#2a71d0",
    ripple: "#434c54",
    binance_usd: "#F0B90B",
    dogecoin: "#cb9800",
  },
  NUMBER_EMOJIS: [
    "🇦",
    "🇧",
    "🇨",
    "🇩",
    "🇪",
    "🇫",
    "🇬",
    "🇭",
    "🇮",
    "🇯",
    "🇰",
    "🇱",
    "🇲",
    "🇳",
    "🇴",
    "🇵",
    "🇶",
    "🇷",
    "🇸",
    "🇹",
    "🇺",
    "🇻",
    "🇼",
    "🇽",
    "🇾",
    "🇿",
  ],
  ALPHABET: [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
  ],
};
