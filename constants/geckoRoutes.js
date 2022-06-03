module.exports = {
    IMAGE_URL: 'https://quiin.s3.us-east-1.amazonaws.com/organizations/pictures/000/004/638/original/CoinGecko_Logo.png?1585529895',
    BASE_URL: 'https://api.coingecko.com/api/v3',
    ping: () => `${module.exports.BASE_URL}/ping`,
    getCoinsList: () => `${module.exports.BASE_URL}/coins/list`,
    getCoin: (coinId) => `${module.exports.BASE_URL}/coins/${coinId}`,
}