pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

contract VehicleRentalEscrow {
    IERC1155 public token;
    uint256 public badParkingTax;

    mapping(uint256 => address) public originalOwner;
    mapping(uint256 => uint256) public rentStartTime;
    mapping(uint256 => uint256) public rentEndTime;
    mapping(uint256 => uint256) public parkingTaxPaid;

    constructor(address _token, uint256 _badParkingTax) {
        token = IERC1155(_token);
        badParkingTax = _badParkingTax;
    }

    function rentVehicle(uint256 tokenId) public payable {
        require(msg.value >= badParkingTax, "Insufficient parking tax paid");
        token.safeTransferFrom(msg.sender, address(this), tokenId, 1, "");
        originalOwner[tokenId] = msg.sender;
        rentStartTime[tokenId] = block.timestamp;
        parkingTaxPaid[tokenId] = msg.value;
    }

    function endRental(uint256 tokenId, bool parkedProperly) public {
        require(msg.sender == originalOwner[tokenId], "Not the renter");
        require(block.timestamp > rentStartTime[tokenId], "Rental hasn't started yet");

        rentEndTime[tokenId] = block.timestamp;

        if (parkedProperly) {
            payable(msg.sender).transfer(parkingTaxPaid[tokenId]);
        }

        token.safeTransferFrom(address(this), originalOwner[tokenId], tokenId, 1, "");
    }

    function reclaimVehicle(uint256 tokenId) public {
        require(msg.sender == originalOwner[tokenId], "Not the original owner");
        require(block.timestamp > rentStartTime[tokenId] + 24 hours, "Rental period hasn't ended yet");
        token.safeTransferFrom(address(this), originalOwner[tokenId], tokenId, 1, "");
    }
}
