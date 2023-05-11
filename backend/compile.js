const fs = require('fs');
const path = require('path');
const solc = require('solc');

const contractPath = path.resolve(__dirname, 'contracts', 'ElectricVehicle.sol');
const source = fs.readFileSync(contractPath, 'utf8');

const input = {
  language: 'Solidity',
  sources: {
    'ElectricVehicle.sol': {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['*'],
      },
    },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));
const contract = output.contracts['ElectricVehicle.sol'].VehicleOwnership;

module.exports = {
  abi: contract.abi,
  bytecode: contract.evm.bytecode.object,
};
