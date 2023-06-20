const { web3, rentalContract, rentalContractAddress, gasLimit } = require("../config/web3");

const rentVehicle = async (tokenId, renterPrivateKey) => {
  //calculate start time from now in seconds
  const startTime = Math.floor(Date.now() / 1000);
  console.log("  Input parameters:", { tokenId, startTime, renterPrivateKey });

  try {
    let gas;
    const renterAccount = web3.eth.accounts.privateKeyToAccount(renterPrivateKey);
    gas = 6721970;
    const nonce = await web3.eth.getTransactionCount(renterAccount.address);

    // build the transaction
    const data = rentalContract.methods.rentVehicle(tokenId, startTime).encodeABI();
    const tx = {
      from: renterAccount.address,
      to: rentalContractAddress,
      gas,
      nonce,
      data: data
    };
    console.log("tx: ", tx);
    // Sign the transaction
    const signedTx = await renterAccount.signTransaction(tx);
    // Send the transaction
    const txHash = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    return ({ success: true, message: txHash });
  } catch (error) {
    console.log(error);
    return ({ success: false, message: error.message });
  }
}

const endRental = async (tokenId, kilometersDriven, privateKey) => {
  try {
    console.log('tokenId: ', tokenId, 'initialTax: ', 'kilometersDriven: ', kilometersDriven, 'privateKey: ', privateKey);
    let currentTime = Math.floor(Date.now() / 1000); // current time in seconds

    //todo remove this
    currentTime = currentTime + 3600; // we end the rental an hour in the future for demo purposes

    const data = rentalContract.methods.returnVehicle(
      tokenId,
      currentTime,
      kilometersDriven
    ).encodeABI();

    const account = web3.eth.accounts.privateKeyToAccount(privateKey);

    const nonce = await web3.eth.getTransactionCount(account.address);
    // const gasPrice = await web3.eth.getGasPrice();
    // const gasLimit = 6721975; // you may need to adjust this value

    const tx = {
      from: account.address,
      to: rentalContractAddress,
      gas: gasLimit,
      nonce,
      data: data
    };

    const signedTx = await account.signTransaction(tx);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log("    a mers:  ",receipt);
    return true;
  } catch (error) {
    console.error(error);
  }
  return false;
};

module.exports = {
  rentVehicle,
  endRental
}
