pragma solidity ^0.8.1;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "truffle/Console.sol";

contract ElectricVehicle is ERC1155, Ownable {
    using SafeMath for uint256;

    struct Vehicle {
        string make;
        string model;
        uint256 pricePerHour;
        uint256 maxRentalHours;
        uint256 startTime;
        uint256 endTime;
        address currentRenter;
    }

    mapping(uint256 => Vehicle) public vehicles;
    uint256 private currentTokenId = 0;

    // User balances
    mapping(address => uint256) public balances;

    // Total income from rentals
    uint256 public totalRentalIncome;

    event VehicleRented(uint256 indexed tokenId, address indexed renter, uint256 startTime, uint256 endTime);
    event RentalEnded(uint256 indexed tokenId, address indexed renter);

    constructor() ERC1155('') Ownable() {}

    //section User functions
    function depositFunds() public payable {
        balances[msg.sender] = balances[msg.sender].add(msg.value);
    }

    function withdrawFunds(uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] = balances[msg.sender].sub(amount);
        payable(msg.sender).transfer(amount);
    }

    function checkBalance() public view returns (uint256) {
        return balances[msg.sender];
    }

    function rentVehicle(uint256 tokenId, uint256 rentalHours) public {
        require(rentalHours <= vehicles[tokenId].maxRentalHours, "Rental duration exceeds the maximum allowed");
        require(vehicles[tokenId].currentRenter == address(0), "Vehicle is currently rented");

        // Make sure the user has enough balance to rent the vehicle
        uint256 requiredRentalFee = vehicles[tokenId].pricePerHour.mul(rentalHours);
        require(balances[msg.sender] >= requiredRentalFee, "Insufficient balance to rent this vehicle");

        // Subtract the required rental fee from the user's balance
        balances[msg.sender] = balances[msg.sender].sub(requiredRentalFee);

        // Add the rental fee to the total income
        totalRentalIncome = totalRentalIncome.add(requiredRentalFee);

        // Set the vehicle's current renter, start time and end time
        vehicles[tokenId].startTime = block.timestamp;
        vehicles[tokenId].endTime = block.timestamp + (rentalHours * 1 hours);
        vehicles[tokenId].currentRenter = msg.sender;

        emit VehicleRented(tokenId, msg.sender, vehicles[tokenId].startTime, vehicles[tokenId].endTime);
    }

    function endRental(uint256 tokenId) public {
        require(vehicles[tokenId].currentRenter == msg.sender, "You are not the current renter of this vehicle");

        uint256 rentalHours = (vehicles[tokenId].endTime - vehicles[tokenId].startTime) / 1 hours;
        uint256 rentalCost = vehicles[tokenId].pricePerHour * rentalHours;
        balances[owner()] += rentalCost;

        vehicles[tokenId].currentRenter = address(0);
        vehicles[tokenId].startTime = 0;
        vehicles[tokenId].endTime = 0;

        emit RentalEnded(tokenId, msg.sender);
    }
    //end section User functions

    //section Owner functions
    function createVehicle(
        address to,
        string memory make,
        string memory model,
        uint256 pricePerHour,
        uint256 maxRentalHours
    ) public onlyOwner {
        console.log("Creating vehicle");
        _mint(to, currentTokenId, 1, "");
        vehicles[currentTokenId] = Vehicle(make, model, pricePerHour, maxRentalHours, 0, 0, address(0));
        currentTokenId++;
    }

    function withdrawIncome(uint256 amount) public onlyOwner {
        // Ensure the contract has earned enough income
        require(totalRentalIncome >= amount, "Insufficient income");

        // Subtract the amount from the total income
        totalRentalIncome = totalRentalIncome.sub(amount);

        // Send the amount to the owner
        payable(msg.sender).transfer(amount);
    }
    //end section Owner functions
}
