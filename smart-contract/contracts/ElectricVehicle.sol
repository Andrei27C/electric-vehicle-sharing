pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
//import "hardhat/console.sol";
import "truffle/Console.sol";


contract ElectricVehicle is ERC1155, Ownable {
    struct Vehicle {
        string make;
        string model;
        uint256 price;
        uint256 startTime;
        address renter;
    }

    mapping(uint256 => Vehicle) public vehicleData;

    uint256 private _currentTokenId = 0;

    constructor(string memory uri) ERC1155(uri) {}


    function mintVehicle(
        string memory make,
        string memory model,
        uint256 price
    ) public onlyOwner {
        console.log("Vehicle Minted");
        _mint(msg.sender, _currentTokenId, 1, "");
        vehicleData[_currentTokenId] = Vehicle(make, model, price, 0, address(0));
        _currentTokenId++;
    }

    function rentVehicle(uint256 tokenId, uint256 startTime) public {
        require(balanceOf(msg.sender, tokenId) == 1, "User does not own the vehicle token");
        require(vehicleData[tokenId].renter == address(0), "Vehicle is already rented");

        vehicleData[tokenId].startTime = startTime;
        vehicleData[tokenId].renter = msg.sender;
    }

    function endRental(uint256 tokenId) public {
        require(msg.sender == vehicleData[tokenId].renter, "Caller is not the renter");

        vehicleData[tokenId].startTime = 0;
        vehicleData[tokenId].renter = address(0);

        // Logic to transfer the rental fee from the renter's balance goes here
        // This would likely involve interaction with a separate contract or system that manages user balances
    }

    function getVehicleData(uint256 tokenId)
    public
    view
    returns (
        string memory make,
        string memory model,
        uint256 price,
        uint256 startTime,
        address renter
    )
    {
        Vehicle memory vehicle = vehicleData[tokenId];
        return (vehicle.make, vehicle.model, vehicle.price, vehicle.startTime, vehicle.renter);
    }

    function ownerAddress() public view returns (address) {
        return owner();
    }

//
//    function rentVehicle(uint256 tokenId, uint256 startTime, uint256 endTime) public payable{
//        console.log("Rented vehicle %s from %s to %s", tokenId, startTime, endTime);
//
//        require(_vehicleData[tokenId].price != 0, "Vehicle does not exist");
//        require(balanceOf(_vehicleData[tokenId].appAddress, tokenId) == 1, "The app does not own this vehicle");
//        require(_vehicleData[tokenId].endTime < startTime, "Vehicle is already rented during this time");
//
//        uint256 rentalHours = (endTime - startTime) / 1 hours;
//        uint256 requiredRentalFee = rentalHours * _vehicleData[tokenId].price;
//
////        require(msg.value >= requiredRentalFee, "Rental fee is not enough");
//
//        // Send rental fee to the app owner
//        payable(_vehicleData[tokenId].appAddress).transfer(msg.value);
//
//        _vehicleData[tokenId].startTime = startTime;
//        _vehicleData[tokenId].endTime = endTime;
//
//        console.log("Rented vehicle %s from %s to %s", tokenId, startTime, endTime);
////        Console.log("Rented vehicle %s from %s to %s", tokenId, startTime, endTime);
//
//        // Transfer ownership to the renter
////        safeTransferFrom(_vehicleData[tokenId].appAddress, msg.sender, tokenId, 1, "");
//        _vehicleData[tokenId].appAddress = msg.sender;
//
//        // Emit the event
//        emit VehicleRented(tokenId, startTime, endTime);
//    }

    //

//    function rentVehicle(uint256 tokenId, uint256 startTime) public payable {
//        require(_vehicleData[tokenId].price != 0, "Vehicle does not exist");
//        require(balanceOf(_vehicleData[tokenId].appAddress, tokenId) == 1, "The app does not own this vehicle");
//        require(_vehicleData[tokenId].endTime < startTime, "Vehicle is already rented during this time");
//
//        uint256 endTime = startTime + MAX_RENTAL_TIME;
//
//        uint256 rentalHours = MAX_RENTAL_TIME / 1 hours;
//        uint256 requiredRentalFee = rentalHours * _vehicleData[tokenId].price;
//
//        require(msg.value >= requiredRentalFee, "Rental fee is not enough");
//
//        // Send rental fee to the app owner
//        payable(_vehicleData[tokenId].appAddress).transfer(msg.value);
//
//        _vehicleData[tokenId].startTime = startTime;
//        _vehicleData[tokenId].endTime = endTime;
//
//        // Transfer ownership to the renter
//        _vehicleData[tokenId].appAddress = msg.sender;
//
//        // Emit the event
//        emit VehicleRented(tokenId, startTime, endTime);
//    }
    //




    // region checkRentalStatus

//    function endRental(uint256 tokenId) public checkRentalStatus(tokenId) {
//        // Transfer ownership back to the app
//        safeTransferFrom(msg.sender, _vehicleData[tokenId].appAddress, tokenId, 1, "");
//
//        // Reset rental start and end times
//        _vehicleData[tokenId].startTime = 0;
//        _vehicleData[tokenId].endTime = 0;
//
//        emit RentalEnded(tokenId, msg.sender);
//    }
    //endregion

    //region vehicle data
//    function getVehicleData(uint256 tokenId)
//    public
//    view
//    returns (
//        string memory make,
//        string memory model,
//        uint256 price,
//        uint256 startTime,
//        uint256 endTime
//    )
//    {
//        Vehicle storage vehicle = _vehicleData[tokenId];
//        return (vehicle.make, vehicle.model, vehicle.price, vehicle.startTime, vehicle.endTime);
//    }
//
//    function getAllVehicleData(uint256 tokenId)
//    public
//    view
//    returns (
//        string memory make,
//        string memory model,
//        uint256 price,
//        uint256 startTime,
//        uint256 endTime,
//        address appAddress
//    )
//    {
//        Vehicle storage vehicle = _vehicleData[tokenId];
//        return (vehicle.make, vehicle.model, vehicle.price, vehicle.startTime, vehicle.endTime, vehicle.appAddress);
//    }

    function totalSupply() public view returns (uint256) {
        return _currentTokenId;
    }
    //endregion

    //getters
    function getOwner(uint256 tokenId) public view returns (address) {
        return vehicleData[tokenId].renter;
    }

    function getStartTime(uint256 tokenId) public view returns (uint256) {
        return vehicleData[tokenId].startTime;
    }

}
