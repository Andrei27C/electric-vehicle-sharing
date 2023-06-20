const { bankContract, bankContractAddress, web3, gasPrice, gasLimit } = require('../config/web3');
const exchange = require('../utils/exchangeRate');

const depositFunds = async (amountUSD, userAddress) => {
  try {
    const amountWei = await exchange.convertUsdToWei(amountUSD);

    // const gasPrice = await web3.eth.getGasPrice();
    //todo resolve this
    // let gasEstimate;
    // await electricVehicleContract.methods.depositFunds().estimateGas({
    //   from: userAddress,
    //   value: web3.utils.toWei(amount, 'ether')
    // });
    // gasEstimate = 6721975;

    const result = await bankContract.methods.deposit().send({
      from: userAddress,
      gas: gasLimit,
      gasPrice: gasPrice,
      value: amountWei
    });
    if(result.status === true)
      return {
        success: true,
        // funds: result.events.FundsDeposited.returnValues.amount,
        funds: result.events.Deposit.returnValues.amount,
        message: "Funds deposited successfully"
      };
  } catch (error) {
    console.error(error);
  }
  return false;
}

// todo withdraw funds and convert to usd
const withdrawFunds = async (amount, privateKey) => {
  //todo
  try {
    const userAddress = web3.eth.accounts.privateKeyToAccount(privateKey).address;
    // const gasPrice = await web3.eth.getGasPrice();
    // const gasEstimate = await bankContract.methods.withdraw(web3.utils.toWei(amount, 'ether')).estimateGas({
    //   from: userAddress,
    // });

    const result = await bankContract.methods.withdraw(web3.utils.toWei(amount, 'ether')).send({
      from: userAddress,
      gas: gasLimit,
      gasPrice: gasPrice,
    });

    if (result.status) {
      return {
        success: true,
        funds: result.events.Withdraw.returnValues.amount,
      };
    } else {
      throw new Error('Transaction failed');
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}

const getUserFunds = async (address) => {
  try {
    return await bankContract.methods.getBalance(address).call();
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
