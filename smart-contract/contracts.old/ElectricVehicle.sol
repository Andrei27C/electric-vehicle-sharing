pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ElectricVehicle is ERC1155, Ownable {
    struct Vehicle {
        string make;
        string model;
        uint256 price;
        address appOwner;
        uint256 startTime;
        uint256 endTime;
        bool isRented;
    }

    mapping(uint256 => Vehicle) public vehicles;
    uint256 public totalVehicles;

    constructor() ERC1155("") Ownable() {}

    function mintVehicle(
        address to,
        string memory make,
        string memory model,
        uint256 price
    ) public onlyOwner {
        _mint(to, totalVehicles, 1, "");
        vehicles[totalVehicles] = Vehicle(make, model, price, to, false);
        totalVehicles++;
    }

    function isVehicleRented(uint256 tokenId) public view returns (bool) {
        return vehicles[tokenId].isRented;
    }

    function toggleRentalStatus(uint256 tokenId) public {
        require(_msgSender() == owner(), "Only the contract owner can change rental status");
        vehicles[tokenId].isRented = !vehicles[tokenId].isRented;
    }


    //getters
    function getOwner(uint256 tokenId) public view returns (address) {
        return vehicles[tokenId].appOwner;
    }

    function getStartTime(uint256 tokenId) public view returns (uint256) {
        return vehicles[tokenId].startTime;
    }

    function getEndTime(uint256 tokenId) public view returns (uint256) {
        return vehicles[tokenId].endTime;
    }
}
