const axios = require('axios');
const Web3 = require('web3');
const BN = require('bn.js');

const WEI_PER_ETHER = new BN('1000000000000000000'); // 1 Ether = 1e18 Wei

async function getEthToUsdRate() {
  let url = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd';
  try {
    //commented this line as coingecko api is not working
    // const response = await axios.get(url);
    //changed to static value
    const response = {data: {ethereum: {usd: 1000}}};
    return new BN(response.data.ethereum.usd.toString());
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

const convertUsdToWei = async (usd) => {
  try {
    const etherPriceUSD = await getEthToUsdRate(); // this is in USD
    const usdAmount = new BN(usd.toString());
    return usdAmount.mul(WEI_PER_ETHER).div(etherPriceUSD); // return in Wei (BN instance)
  } catch (error) {
    console.error(error);
    throw new Error("Could not calculate rental fee");
  }
};

const convertUsdToEther = async (usd) => {
  try {
    const etherPriceUSD = await getEthToUsdRate(); // this is in USD
    const usdAmount = new BN(usd.toString());
    return usdAmount.div(etherPriceUSD); // return in Ether (BN instance)
  } catch (error) {
    console.error(error);
    throw new Error("Could not calculate rental fee");
  }
};

// const convertUsdToWei = convertUsdToEther; // both are the same

async function convertWeiToUsd (weiAmount) {
  const wei = new BN(weiAmount.toString());
  const ethToUsdRate = await getEthToUsdRate(); // this is in USD
  return wei.mul(ethToUsdRate).div(WEI_PER_ETHER); // return in USD (BN instance)
}

module.exports.getEthToUsdRate = getEthToUsdRate;
module.exports.convertUsdToEther = convertUsdToEther;
module.exports.convertUsdToWei = convertUsdToWei;
module.exports.convertWeiToUsd = convertWeiToUsd;

