const axios = require('axios');

async function getEthToUsdRate() {
  let url = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd';
  try {
    const response = await axios.get(url);
    return response.data.ethereum.usd;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

const convertRentalFeeToEther = async (usd) => {
  try {
    const response = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
    const etherPriceUSD = response.data.ethereum.usd;
    return web3.utils.toWei((usd / etherPriceUSD).toString(), "ether");
  } catch (error) {
    throw new Error("Could not calculate rental fee");
  }
};

module.exports.getEthToUsdRate = getEthToUsdRate;
module.exports.convertRentalFeeToEther = convertRentalFeeToEther;
