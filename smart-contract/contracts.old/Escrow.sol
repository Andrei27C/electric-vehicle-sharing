pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./ElectricVehicle.sol";

contract Escrow is ERC1155Holder, Ownable, ReentrancyGuard {
    ElectricVehicle public electricVehicle;
    mapping(address => uint256) public balances;

    constructor(address electricVehicleAddress) {
        electricVehicle = ElectricVehicle(electricVehicleAddress);
    }

    function startRental(uint256 tokenId) external nonReentrant {
        require(electricVehicle.isApprovedForAll(electricVehicle.owner(), address(this)), "Escrow must be approved to transfer tokens");
        require(!electricVehicle.vehicles[tokenId].isRented, "The vehicle is already rented");

        electricVehicle.safeTransferFrom(electricVehicle.vehicles[tokenId].appOwner, _msgSender(), tokenId, 1, "");
        electricVehicle.toggleRentalStatus(tokenId);
    }

    function endRental(uint256 tokenId) external payable nonReentrant {
        require(electricVehicle.isApprovedForAll(_msgSender(), address(this)), "Renter must approve escrow to transfer tokens back");
        require(electricVehicle.vehicles[tokenId].isRented, "The vehicle is not rented");

        uint256 rentalFee = electricVehicle.vehicles[tokenId].price;
        require(msg.value >= rentalFee, "Sent value must cover the rental fee");

        balances[owner()] += msg.value;

        electricVehicle.safeTransferFrom(_msgSender(), electricVehicle.vehicles[tokenId].appOwner, tokenId, 1, "");
        electricVehicle.toggleRentalStatus(tokenId);
    }

    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = balances[_msgSender()];
        require(balance > 0, "No funds to withdraw");

        balances[_msgSender()] = 0;

        payable(_msgSender()).transfer(balance);
    }
}

