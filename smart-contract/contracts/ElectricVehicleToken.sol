pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ElectricVehicleToken is ERC1155, Ownable {
    uint256 private VEHICLES_TOKEN_ID = 0;
    uint256 public constant POINTS_TOKEN_ID = type(uint256).max; // Assign a large number to prevent collisions with NFTs

    address private vehicleManagerAddress;

    modifier onlyVehicleManager() {
        require(msg.sender == vehicleManagerAddress, "Caller is not the Rental contract");
        _;
    }

    // User balances for points
    mapping(address => uint256) public balances;

    constructor() ERC1155('') Ownable() {
    }

    // Vehicle Token related functions
    function mintVehicle() public onlyVehicleManager {
        _mint(owner(), VEHICLES_TOKEN_ID, 1, "");
        VEHICLES_TOKEN_ID++;
    }

    function burnVehicle(uint256 tokenId) public onlyVehicleManager{
        _burn(owner(), tokenId, 1);
    }

    function totalVehicleSupply() public view returns (uint256) {
        return VEHICLES_TOKEN_ID;
    }

    // Points system related functions
    function mintPoints(address account, uint256 points) public onlyVehicleManager{
        _mint(account, POINTS_TOKEN_ID, points, "");
        balances[account] += points;
    }

    function burnPoints(address account, uint256 points) public onlyVehicleManager{
        require(balances[account] >= points, "Not enough points to burn");
        _burn(account, POINTS_TOKEN_ID, points);
        balances[account] -= points;
    }

    function balanceOfPoints(address account) public view returns (uint256) {
        return balances[account];
    }

    function updateVehicleManagerAddress(address newAddress) public onlyOwner {
        vehicleManagerAddress = newAddress;
    }
}
