pragma solidity ^0.8.1;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "truffle/Console.sol";
import "./ElectricVehicleToken.sol";
import "./Bank.sol";
import "./Rental.sol";

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
//    Bank public bank;

    address private rentalContractAddress;

    modifier onlyRentalContract {
        require(msg.sender == rentalContractAddress, "Caller is not the Rental contract");
        _;
    }

    event VehicleRented(uint256 indexed tokenId, address indexed renter, uint256 startTime);
    event RentalEnded(uint256 indexed tokenId, address indexed renter, uint256 rentalFee, uint256 rentalDuration);
    event FundsDeposited(address indexed user, uint256 amount);

    constructor(ElectricVehicleToken _evToken) {
        evToken = _evToken;
//        bank = _bank;
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

    function rentVehicle(uint256 tokenId, uint256 startTime, address sender) public onlyRentalContract{
        require(vehicles[tokenId].active == true, "Vehicle is not active");
        require(vehicles[tokenId].currentRenter == owner(), "Vehicle is currently rented");
        require(startTime > 0, "Cannot rent a vehicle in the past");

        // Set the vehicle's current renter, start time
        vehicles[tokenId].startTime = startTime;
        vehicles[tokenId].currentRenter = sender;

        emit VehicleRented(tokenId, sender, vehicles[tokenId].startTime);
    }

    function endRental(uint256 tokenId, uint256 endTime, uint256 kilometersDriven, address sender) public onlyRentalContract returns (uint256){
        require(vehicles[tokenId].currentRenter == sender, "You are not the current renter of this vehicle");
        require(endTime > vehicles[tokenId].startTime, "Cannot end rental in the past");
        require(kilometersDriven > 0, "Kilometers driven must be greater than 0");

        // Calculate the rental fee
        uint256 rentalDuration = endTime.sub(vehicles[tokenId].startTime);
        uint256 requiredRentalFee = vehicles[tokenId].pricePerHour.div(3600).mul(rentalDuration);

        // Reset the vehicle's current renter, start time
        vehicles[tokenId].currentRenter = owner();
        vehicles[tokenId].startTime = 0;

        // Award points for kilometers driven.
        evToken.mintPoints(sender, kilometersDriven);

        emit RentalEnded(tokenId, sender, requiredRentalFee, rentalDuration);
        return requiredRentalFee;
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

    //section getters

    function getNoOfVehicles() public view returns (uint256) {
        return evToken.totalVehicleSupply();
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

    function updateRentalAddress(address newAddress) public onlyOwner {
        rentalContractAddress = newAddress;
    }

}
