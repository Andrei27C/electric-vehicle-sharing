const axios = require('axios');
const Web3 = require('web3');
const web3 = new Web3();

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

const convertUsdToEther = async (usd) => {
  try {
    const etherPriceUSD = await getEthToUsdRate();
    const ethAmount = usd / etherPriceUSD;
    console.log("ethAmount: ", ethAmount.toFixed(18));
    return ethAmount.toFixed(18);
  } catch (error) {
    console.error(error);
    throw new Error("Could not calculate rental fee");
  }
};

const convertUsdToWei = async (usd) => {
  try {
    return web3.utils.toWei(await convertUsdToEther(usd), "ether");
  } catch (error) {
    console.error(error);
    throw new Error("Could not calculate rental fee");
  }
};

async function convertWeiToUsd (weiAmount) {
  const ethAmount = web3.utils.fromWei(weiAmount, 'ether');
  const ethToUsdRate = await getEthToUsdRate();
  return Math.ceil((ethAmount * ethToUsdRate));
}

module.exports.getEthToUsdRate = getEthToUsdRate;
module.exports.convertUsdToEther = convertUsdToEther;
module.exports.convertUsdToWei = convertUsdToWei;
module.exports.convertWeiToUsd = convertWeiToUsd;

