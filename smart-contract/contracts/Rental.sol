pragma solidity ^0.8.1;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ElectricVehicleToken.sol";
import "./VehicleManager.sol";
import "truffle/Console.sol";

contract Rental is Ownable {
    VehicleManager private _vehicleManager;
    Bank private _bank;

    constructor(
        VehicleManager vehicleManager,
        Bank bank
    ) {
        _vehicleManager = vehicleManager;
        _bank = bank;
    }

    function rentVehicle(uint256 vehicleId, uint256 startTime) public {
        (, ,uint256 pricePerHour , , , , ) = _vehicleManager.getAllVehicleData(vehicleId);
        require(_bank.getBalance(msg.sender) >= pricePerHour, "Insufficient balance to rent this vehicle");

        // Call VehicleManager contract to rent vehicle
        _vehicleManager.rentVehicle(vehicleId, startTime, msg.sender);
    }

    function returnVehicle(uint256 vehicleId, uint256 endTime, uint256 kilometersDriven) public {
        // Call VehicleManager contract to return vehicle
        uint256 requiredRentalFee = _vehicleManager.endRental(vehicleId, endTime, kilometersDriven, msg.sender);
        // Subtract the rental fee from the renter's balance and add it to the owner's balance
        _bank.internalTransfer(msg.sender, owner(), requiredRentalFee);
    }

    function getRentingStatus(uint256 vehicleId) public view returns (bool) {
        // Get the current renter of the vehicle
        (, , , , , address currentRenter, ) = _vehicleManager.getAllVehicleData(vehicleId);

        // If the current renter is not the owner, the vehicle is being rented
        return currentRenter != owner();
    }

}
