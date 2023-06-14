pragma solidity ^0.8.1;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ElectricVehicleToken.sol";
import "./VehicleManager.sol";
import "./PointsManager.sol";

contract Rental is Ownable {
    ElectricVehicleToken private _evToken;
    VehicleManager private _vehicleManager;
    PointsManager private _pointsManager;

    constructor(
        ElectricVehicleToken evToken,
        VehicleManager vehicleManager,
        PointsManager pointsManager
    ) {
        _evToken = evToken;
        _vehicleManager = vehicleManager;
        _pointsManager = pointsManager;
    }

    function rentVehicle(uint256 vehicleId) public {
        // Call VehicleManager contract to rent vehicle
        _vehicleManager.rentVehicle(vehicleId);
    }

    function returnVehicle(uint256 vehicleId, uint256 endTime, uint256 initialTax, uint256 kilometersDriven) public {
        // Call VehicleManager contract to return vehicle
        _vehicleManager.returnVehicle(vehicleId, endTime, initialTax, kilometersDriven);

        // Award points to the user
        _pointsManager.addPoints(msg.sender, kilometersDriven);
    }

    function getRentingStatus(uint256 vehicleId) public view returns (bool) {
        // Get the current renter of the vehicle
        (, , , , , address currentRenter, ) = _evToken.getAllVehicleData(vehicleId);

        // If the current renter is not the owner, the vehicle is being rented
        return currentRenter != owner();
    }

}
