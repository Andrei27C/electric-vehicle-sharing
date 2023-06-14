pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ElectricVehicleToken is ERC1155, Ownable {
    uint256 private VEHICLES_TOKEN_ID = 0;
    uint256 public constant POINTS_TOKEN_ID = type(uint256).max; // Assign a large number to prevent collisions with NFTs

    constructor() ERC1155('') Ownable() {}

    // Vehicle Token related functions
    function mintVehicle() public onlyOwner {
        _mint(owner(), VEHICLES_TOKEN_ID, 1, "");
        VEHICLES_TOKEN_ID++;
    }

    function burnVehicle(uint256 tokenId) public onlyOwner {
        _burn(owner(), tokenId, 1);
    }

    function transferVehicle(uint256 tokenId, address from, address to) public {
        require(msg.sender == from || isApprovedForAll(from, msg.sender), "Caller is not owner nor approved");
        _safeTransferFrom(from, to, tokenId, 1, "");
    }

    function totalVehicleSupply() public view returns (uint256) {
        return VEHICLES_TOKEN_ID;
    }
}
