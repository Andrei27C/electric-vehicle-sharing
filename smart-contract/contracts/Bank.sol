pragma solidity ^0.8.1;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Bank is Ownable {
    using SafeMath for uint256;
    mapping(address => uint256) private balances;

    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);

    address private rentalServiceAddress;

    modifier onlyRentalService {
        require(msg.sender == rentalServiceAddress, "Caller is not the Rental Service");
        _;
    }

    constructor(address _rentalServiceAddress) {
        rentalServiceAddress = _rentalServiceAddress;
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

    function getBalance() public view returns (uint256) {
        return balances[msg.sender];
    }

    function internalTransfer(address from, address to, uint256 amount) public onlyOwner {
        require(_balances[from] >= amount, "Insufficient balance");
        _balances[from] = _balances[from].sub(amount);
        _balances[to] = _balances[to].add(amount);
    }

    function updateRentalServiceAddress(address newAddress) public onlyOwner {
        rentalServiceAddress = newAddress;
    }
}
