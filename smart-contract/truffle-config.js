
require('dotenv').config();

const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {

  networks: {

    development: {
      provider: () => new HDWalletProvider({
        mnemonic: process.env.MNEMONIC,
        providerOrUrl: process.env.ETHER_RPC_URL,
      }),
      network_id: "5777", // Match any network id
      port: 7545, // Update the port to match your Ethereum node or Ganache instance
    },
  },

  // Set default mocha options here, use special reporters, etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.19",      // Fetch exact version from solc-bin (default: truffle's version)

    }
  },


};
