const { vehicleManagerContract, vehicleManagerContractAddress } = require("../config/web3");

const callContractEndRental = async (tokenId, kilometersDriven, privateKey) => {
  try {
    console.log('tokenId: ', tokenId, 'initialTax: ', 'kilometersDriven: ', kilometersDriven, 'privateKey: ', privateKey);
    let currentTime = Math.floor(Date.now() / 1000); // current time in seconds

    //todo remove this
    currentTime = currentTime + 3600;

    const data = vehicleManagerContract.methods.endRental(
      tokenId,
      currentTime,
      kilometersDriven
    ).encodeABI();

    const account = web3.eth.accounts.privateKeyToAccount(privateKey);

    const nonce = await web3.eth.getTransactionCount(account.address);
    const gasPrice = await web3.eth.getGasPrice();
    const gasLimit = 6721975; // you may need to adjust this value

    const tx = {
      from: account.address,
      to: vehicleManagerContractAddress,
      gasLimit,
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
const callContractRentVehicle = async (tokenId, renterPrivateKey) => {
    //calculate start time from now in seconds
    const startTime = Math.floor(Date.now() / 1000);
    console.log("  Input parameters:", { tokenId, startTime, renterPrivateKey });

    try {
      let gas;
      const renterAccount = web3.eth.accounts.privateKeyToAccount(renterPrivateKey);
      gas = 6721970;
      const nonce = await web3.eth.getTransactionCount(renterAccount.address);

      // build the transaction
      const data = vehicleManagerContract.methods.rentVehicle(tokenId).encodeABI();
      const tx = {
        from: renterAccount.address,
        to: vehicleManagerContractAddress,
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
const callContractGetAllVehicleData = async (tokenId) => {
  try {
    return await vehicleManagerContract.methods.getAllVehicleData(tokenId).call();
  } catch (error) {
    console.error(error);
  }
  return false;
}
const callContractCreateVehicle = async (userId, make, model, pricePerHourWei, privateKey) => {
  const account = web3.eth.accounts.privateKeyToAccount(privateKey);

  //todo resolve this
  // Estimate gas
  let gas;
  try {
    const contractMethod = vehicleManagerContract.methods.createVehicle(make, model, pricePerHourWei);
    // gas = await contractMethod.estimateGas();
    gas = 500000;
  } catch (error) {
    console.error("Error estimating gas:", error.message);
    res.status(500).json({ success: false, message: "Error estimating gas", error: error.message });
    return;
  }

  // Create transaction
  try {
    const nonce = await web3.eth.getTransactionCount(account.address);
    console.log("  Nonce:", nonce);
    const tx = {
      from: account.address,
      to: vehicleManagerContractAddress,
      gas,
      nonce,
      data: vehicleManagerContract.methods.createVehicle(make, model, pricePerHourWei).encodeABI()
    };
    const signedTx = await account.signTransaction(tx);
    const txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    return { success: true, message: "Vehicle created", txHash: txReceipt.transactionHash };
  } catch (error) {
    console.error("Error creating vehicle:", error.message);
    return { success: false, message: error.message };
  }
}
const callContractDeleteVehicle = async (tokenId, privateKey) => {
  try {
    const adminAccount = web3.eth.accounts.privateKeyToAccount(privateKey);
    console.log("  Admin address:", adminAccount.address);

    const gas = await vehicleManagerContract.methods.deleteVehicle(tokenId).estimateGas({ from: adminAccount.address });

    console.log("  Estimated gas: ", gas);
    const nonce = await web3.eth.getTransactionCount(adminAccount.address);
    console.log("  Nonce:", nonce);

    // Build the transaction
    const data = vehicleManagerContract.methods.deleteVehicle(tokenId).encodeABI();
    const tx = {
      from: adminAccount.address,
      to: vehicleManagerContractAddress,
      gas,
      nonce,
      data: data
    };
    console.log("tx: ", tx);

    // Sign the transaction
    const signedTx = await adminAccount.signTransaction(tx);

    // Send the transaction
    const txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    return { success: true, message: "Vehicle deleted", txReceipt: txReceipt };

  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
    console.log(error);
  }
}
const callContractGetTotalSupply = async () => {
  try {
    return await vehicleManagerContract.methods.getNoOfVehicles().call();
  } catch (error) {
    console.error(error);
  }
  return false;
}

const getOwner = async () => {
  try {
    return await vehicleManagerContract.methods.owner().call();
  }
  catch (error) {
    console.error(error);
  }
  return false;
};
const getPoints = async (address) => {
  try {
    return await vehicleManagerContract.methods.getPoints(address).call({from: user.address})
  }
  catch (error) {
    console.error(error);
  }
  return false;
}
const getVehicleByAddress = async (address) => {
try {
    return await vehicleManagerContract.methods.getRentedVehicleByAddress().call({from: address});
  } catch (error) {
    console.error(error);
  }
  return false;
}

module.exports = {
  callContractEndRental,
  callContractRentVehicle,
  callContractGetAllVehicleData,
  callContractCreateVehicle,
  callContractDeleteVehicle,
  callContractGetTotalSupply,
  getOwner,
  getPoints,
  getVehicleByAddress
}
