const { Client, Intents } = require("discord.js");
const {
  CONFIG: {
    TOKEN,
    NUMBER_EMOJIS,
    ALPHABET,
    CRYPTOS,
    CRYPTOS_COLORS,
    EVENT: { READY, MESSAGE_CREATE },
  },
  GECKO,
} = require("./constants");
const axios = require("axios");
const dayjs = require("dayjs");
const short = require("short-number");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

client.on(READY, async () => {
  let currentIndex = 0;

  const getSolanaData = async () => {
    const response = await axios.get(GECKO.getCoin(CRYPTOS[currentIndex]));
    const {
      symbol,
      market_data: { price_change_percentage_24h: changePercentage24h },
    } = response.data;

    client.user.setPresence({
      activities: [
        {
          name: `${symbol.toUpperCase()} | ${
            changePercentage24h < 0 ? "↘" : "↗"
          } ${changePercentage24h.toFixed(2)}%`,
          type: "WATCHING",
        },
      ],
      status: `${changePercentage24h < 0 ? "dnd" : "online"}`,
    });

    setTimeout(() => {
      currentIndex = (currentIndex + 1) % CRYPTOS.length;
      getSolanaData();
    }, 5000);
  };

  getSolanaData();
});

client.on(MESSAGE_CREATE, async (message) => {
  const command = message.content.split(" ")[0];

  switch (command) {
    case "!price":
      const arg = message.content.split(" ")[1];

      if (CRYPTOS.includes(arg)) {
        const response = await axios.get(GECKO.getCoin(arg));
        const cryptoData = response.data;
        const {
          name,
          symbol,
          image: { thumb: thumbURL, small: smallURL },
          links: { homepage: homepageLink },
          market_data: {
            price_change_percentage_24h: changePercentage24,
            price_change_percentage_7d: changePercentage7,
            current_price: { usd: priceUSD, eur: priceEUR },
            high_24h: { usd: high24USD, eur: high24EUR },
            low_24h: { usd: low24USD, eur: low24EUR },
            market_cap: { usd: marketCapUSD, eur: marketCapEUR },
            total_volume: { usd: volumeUSD, eur: volumeEUR },
            circulating_supply: circulatingSupply,
            ath: { usd: athUSD, eur: athEUR },
            atl: { usd: atlUSD, eur: atlEUR },
            atl_date: atlDate,
            ath_date: athDate,
          },
        } = cryptoData;

        message.channel.send({
          embeds: [
            {
              author: {
                name: `(${symbol.toUpperCase()}) ${name} | ${
                  changePercentage24 > 0 ? "🟢 " : "🔻 "
                } ${changePercentage24.toFixed(2)}% (24h) | ${
                  changePercentage7 > 0 ? "🟢 " : "🔻 "
                } ${changePercentage7.toFixed(2)}% (7d)`,
                icon_url: thumbURL,
                url: homepageLink[0],
              },
              color: CRYPTOS_COLORS[arg.replace("-", "_")],
              thumbnail: {
                url: smallURL,
              },
              fields: [
                {
                  name: "Current Price",
                  value: `\`💵  ${priceUSD} $\`\n\`💶  ${priceEUR} €\``,
                  inline: true,
                },
                {
                  name: "24h High",
                  value: `\`💵  ${high24USD} $\`\n\`💶  ${high24EUR} €\``,
                  inline: true,
                },
                {
                  name: "24h Low",
                  value: `\`💵  ${low24USD} $\`\n\`💶  ${low24EUR} €\``,
                  inline: true,
                },
                {
                  name: "Market Cap",
                  value: `\`💵  ${short(marketCapUSD)} $\`\n\`💶  ${short(
                    marketCapEUR
                  )} €\``,
                  inline: true,
                },
                {
                  name: "Total Volume",
                  value: `\`💵  ${short(volumeUSD)} $\`\n\`💶  ${short(
                    volumeEUR
                  )} €\``,
                  inline: true,
                },
                {
                  name: "Circulating Supply",
                  value: `\`💵  ${short(
                    circulatingSupply * priceUSD
                  )} $\`\n\`💶  ${short(circulatingSupply * priceEUR)} €\``,
                  inline: true,
                },
                {
                  name: `ATH | ${dayjs(athDate.usd).format("YYYY-MM-DD")}`,
                  value: `\`💵  ${athUSD} $\`\n\`💶  ${athEUR} €\``,
                  inline: true,
                },
                {
                  name: `ATL | ${dayjs(atlDate.usd).format("YYYY-MM-DD")}`,
                  value: `\`💵  ${atlUSD} $\`\n\`💶  ${atlEUR} €\``,
                  inline: true,
                },
              ],
            },
          ],
        });
      }
      break;
    case "!daily":
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto("https://magiceden.io/drops?tab=allDrops");
      await page.waitForSelector(".me-table");
      const html = await page.content();
      await browser.close();

      const $ = cheerio.load(html);
      const drops = $(".me-table").find("tr");
      const dropsData = [];

      drops.each((_, drop) => {
        const dropData = $(drop).find("td");
        if (dropData.length === 6) {
          const imageURL = dropData.eq(1).find("img").attr("src");
          const collectionName = dropData.eq(1).find("a").text();
          const upvoteNumber = dropData.eq(0).find(".tw-text-sm").text();
          const socialsLinks = dropData
            .eq(2)
            .find("a")
            .toArray()
            .map((a) => $(a).attr("href"));
          const mintDate = dropData.eq(3).text();
          const today = dayjs().format("DD MMMM");
          const mintDateFormatted = dayjs(mintDate).format("DD MMMM");

          if (
            mintDateFormatted === today &&
            upvoteNumber > 10 &&
            collectionName !== ""
          ) {
            dropsData.push({
              upvoteNumber,
              imageURL,
              collectionName,
              socialsLinks,
              mintDate: mintDateFormatted,
              mintHour: dayjs(mintDate).format("HH:mm"),
            });
          }
        }
      });

      const getSocialLink = (link) => {
        const isTwitter = link.includes("twitter");
        const isDiscord = link.includes("discord");

        if (isTwitter) {
          return `[🐦 Twitter](${link})\n`;
        }

        if (isDiscord) {
          return `[🤖 Discord](${link})\n`;
        }

        return `[🌐 Website](${link})\n`;
      };

      if (dropsData.length > 0) {
        const sentMessage = message.channel.send({
          embeds: [
            {
              author: {
                name: `💰 Magic Eden NFT Drops | ${dayjs().format(
                  "dddd DD MMMM YYYY"
                )}`,
                icon_url:
                  "https://pbs.twimg.com/media/FULr9ohaIAAvBmk?format=jpg&name=medium",
              },
              color: CRYPTOS_COLORS.solana,
              fields: dropsData
                .sort((a, b) => +b.upvoteNumber - +a.upvoteNumber)
                .map((drop, i) => ({
                  name: `${ALPHABET[i]} | ${drop.collectionName} - ${drop.mintHour}`,
                  value: `❤️ \`${drop.upvoteNumber}\`\n${drop.socialsLinks.map(
                    (link) => getSocialLink(link)
                  )}\n`,
                  inline: false,
                })),
            },
          ],
        });

        sentMessage.then((msg) => {
          dropsData.forEach((_, i) => {
            msg.react(NUMBER_EMOJIS[i]);
          });
        });

        message.delete();
      }

    default:
      break;
  }
});

client.login(TOKEN);
