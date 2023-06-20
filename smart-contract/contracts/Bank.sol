pragma solidity ^0.8.1;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Bank is Ownable {
    using SafeMath for uint256;
    mapping(address => uint256) private balances;

    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event Transfer(address indexed from, address indexed to, uint256 value);

    address private rentalAddress;
    address private vehicleManagerAddress;

    modifier onlyRentalAddress {
        require(msg.sender == rentalAddress, "Bank.sol: Caller is not the Rental Service");
        _;
    }

    constructor() {
    }

    function deposit() public payable {
        balances[msg.sender] = balances[msg.sender].add(msg.value);
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        payable(msg.sender).transfer(amount);
        balances[msg.sender] = balances[msg.sender].sub(amount);
        emit Withdraw(msg.sender, amount);
    }

    function getBalance(address sender) public view returns (uint256) {
        return balances[sender];
    }

    function internalTransfer(address from, address to, uint256 amount) public onlyRentalAddress {
        require(balances[from] >= amount, "Insufficient balance");
        balances[from] = balances[from].sub(amount);
        balances[to] = balances[to].add(amount);
        emit Transfer(from, to, amount);

    }

    function updateRentalAddress(address newAddress) public onlyOwner {
        rentalAddress = newAddress;
    }
}
