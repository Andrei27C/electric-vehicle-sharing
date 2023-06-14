pragma solidity ^0.8.1;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ElectricVehicleToken.sol";

contract VehicleManager is Ownable {
    using SafeMath for uint256;

    struct Vehicle {
        string make;
        string model;
        uint256 pricePerHour;
        uint256 maxRentalHours; // = in seconds
        uint256 startTime;
        address currentRenter;
        bool active;
    }

    mapping(uint256 => Vehicle) public vehicles;

    ElectricVehicleToken public evToken;

    event VehicleRented(uint256 indexed tokenId, address indexed renter, uint256 startTime);
    event RentalEnded(uint256 indexed tokenId, address indexed renter, uint256 rentalFee, uint256 rentalDuration);
    event FundsDeposited(address indexed user, uint256 amount);

    constructor(ElectricVehicleToken _evToken) {
        evToken = _evToken;
    }

    function rentVehicle(uint256 tokenId) public {
        require(vehicles[tokenId].active == true, "Vehicle is not active");
        require(vehicles[tokenId].currentRenter == owner(), "Vehicle is currently rented");
        require(balances[msg.sender] >= vehicles[tokenId].pricePerHour, "Insufficient balance to rent this vehicle");

//        // Transfer the vehicle token to the renter
//        evToken.transferVehicle(tokenId, owner(), msg.sender);

        // Set the vehicle's current renter, start time
        vehicles[tokenId].startTime = block.timestamp;
        vehicles[tokenId].currentRenter = msg.sender;

        emit VehicleRented(tokenId, msg.sender, vehicles[tokenId].startTime);
    }

    function endRental(uint256 tokenId, uint256 endTime, uint256 initialTax, uint256 kilometersDriven) public {
        require(vehicles[tokenId].currentRenter == msg.sender, "You are not the current renter of this vehicle");

        // Calculate the rental fee
        uint256 rentalDuration = endTime.sub(vehicles[tokenId].startTime);
        uint256 requiredRentalFee = vehicles[tokenId].pricePerHour.div(3600).mul(rentalDuration);
        requiredRentalFee.add(initialTax);

        // Subtract the rental fee from the renter's balance
        balances[msg.sender] = balances[msg.sender].sub(requiredRentalFee);

//        // Transfer the vehicle token back to the owner
//        evToken.transferVehicle(tokenId, msg.sender, owner());

        // Reset the vehicle's current renter, start time
        vehicles[tokenId].currentRenter = owner();
        vehicles[tokenId].startTime = 0;

        // Award points for kilometers driven.
        evToken.mintPoints(msg.sender, kilometersDriven);

        emit RentalEnded(tokenId, msg.sender, requiredRentalFee, rentalDuration);
    }

    function createVehicle(
        string memory make,
        string memory model,
        uint256 pricePerHour
    ) public onlyOwner {
        uint256 maxRentalHours = 2 hours;

        evToken.mintVehicle();

        uint256 tokenId = evToken.totalVehicleSupply().sub(1);

        vehicles[tokenId] = Vehicle(make, model, pricePerHour, maxRentalHours, 0, owner(), true);
    }

    function deleteVehicle(uint256 tokenId) public onlyOwner {
        require(tokenId < evToken.totalVehicleSupply(), "Vehicle does not exist");
        require(vehicles[tokenId].currentRenter == owner(), "Vehicle is currently rented");
        require(vehicles[tokenId].active, "Vehicle is already deleted");

        // Burn the vehicle token
        evToken.burnVehicle(tokenId);

        // Set vehicle data to default values
        vehicles[tokenId].active = false;
    }

    function getAllVehicleData(uint256 tokenId)
    public
    view
    returns (
        string memory make,
        string memory model,
        uint256 pricePerHour,
        uint256 maxRentalHours,
        uint256 startTime,
        address currentRenter,
        bool active
    )
    {
        Vehicle storage vehicle = vehicles[tokenId];
        return (vehicle.make, vehicle.model, vehicle.pricePerHour, vehicle.maxRentalHours,vehicle.startTime, vehicle.currentRenter, vehicle.active);
    }

    function getRentedVehicleByAddress()
    public
    view
    returns (
        uint256 id,
        Vehicle memory vehicle
    )
    {
        for (uint256 i = 0; i < evToken.totalVehicleSupply(); i++) {
            if (vehicles[i].currentRenter == msg.sender) {
                return (i, vehicles[i]);
            }
        }

        revert("No vehicle currently rented by the provided address");
    }

}
