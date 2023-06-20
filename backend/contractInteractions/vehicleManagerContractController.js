const { vehicleManagerContract, vehicleManagerContractAddress, web3, gasPrice, gasLimit } = require("../config/web3");

//todo rename these functions
const createVehicle = async (make, model, pricePerHourWei, privateKey) => {
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
const deleteVehicle = async (tokenId, privateKey) => {
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
const fundPoints = async (address, amount, privateKey) => {
  const adminAccount = web3.eth.accounts.privateKeyToAccount(privateKey);
  console.log("  Admin address:", adminAccount.address);

  const nonce = await web3.eth.getTransactionCount(adminAccount.address);
  console.log("  Nonce:", nonce);

  // Build the transaction
  const data = vehicleManagerContract.methods.fundPoints(address, amount).encodeABI();
  const tx = {
    from: adminAccount.address,
    to: vehicleManagerContractAddress,
    gasLimit,
    nonce,
    data: data
  };
  console.log("tx: ", tx);

  // Sign the transaction
  const signedTx = await adminAccount.signTransaction(tx);

  // Send the transaction
  const txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

  return { success: true, message: "Vehicle deleted", txReceipt: txReceipt };
}

const getAllVehicleData = async (tokenId) => {
  try {
    return await vehicleManagerContract.methods.getAllVehicleData(tokenId).call();
  } catch (error) {
    console.error(error);
  }
  return false;
}
const getTotalSupply = async () => {
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
    return await vehicleManagerContract.methods.getPoints(address).call();
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
    // console.error(error);
    return false;
  }
}



module.exports = {
  getAllVehicleData,
  createVehicle,
  deleteVehicle,
  fundPoints,
  getTotalSupply,
  getOwner,
  getPoints,
  getVehicleByAddress
}
