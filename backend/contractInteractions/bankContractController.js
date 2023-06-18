const { bankContract, bankContractAddress, web3 } = require('../config/web3');

const depositFunds = async (amount, userAddress) => {
  try {
    const gasPrice = await web3.eth.getGasPrice();
    //todo resolve this
    let gasEstimate;
    // await electricVehicleContract.methods.depositFunds().estimateGas({
    //   from: userAddress,
    //   value: web3.utils.toWei(amount, 'ether')
    // });
    gasEstimate = 5000000;

    const result = await bankContract.methods.depositFunds().send({
      from: userAddress,
      gas: gasEstimate,
      gasPrice: gasPrice,
      value: web3.utils.toWei(amount, 'ether')
    });
    if(result.status === true)
      return {
        success: true,
        funds: result.events.FundsDeposited.returnValues.amount,
      };
  } catch (error) {
    console.error(error);
  }
  return false;
}

const withdrawFunds = async (amount, privateKey) => {
  //todo
}

const getUserFunds = async (address) => {
  try {
    return await bankContract.methods.getBalance().call({from: address});
  }
  catch (error) {
    console.error(error);
  }
  return false;

}


module.exports = {
  depositFunds,
  withdrawFunds,
  getUserFunds
}
