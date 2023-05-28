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
        uint256 maxRentalHours; // = in seconds
        uint256 startTime;
        address currentRenter;
    }

    mapping(uint256 => Vehicle) public vehicles;
    uint256 private VEHICLES_TOKEN_ID = 0;
    // This is the ID for the fungible points token. We set it to a large constant to minimize chances of ID collision with the NFTs.
    uint256 public constant POINTS_TOKEN_ID = 0;

    // User balances
    mapping(address => uint256) public balances;
    // User balances for points
    mapping(address => uint256) public pointsBalances;

    // Total income from rentals
    uint256 public totalRentalIncome;

    event VehicleRented(uint256 indexed tokenId, address indexed renter, uint256 startTime);
    event RentalEnded(uint256 indexed tokenId, address indexed renter, uint256 rentalFee, uint256 rentalDuration);
    event FundsDeposited(address indexed user, uint256 amount);

    constructor() ERC1155('') Ownable() {}

    //section User functions
    function depositFunds() public payable {
        balances[msg.sender] = balances[msg.sender].add(msg.value);
        emit FundsDeposited(msg.sender, msg.value); // emit the event
    }

    function withdrawFunds(uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] = balances[msg.sender].sub(amount);
        payable(msg.sender).transfer(amount);
    }

    function checkBalance() public view returns (uint256) {
        return balances[msg.sender];
    }

    function getPoints() public view returns (uint256) {
        return pointsBalances[msg.sender];
    }

    function getOwner() public view returns (address) {
        return owner();
    }

    //todo check if the renter has more than enough balance
    function rentVehicle(uint256 tokenId) public {
        require(vehicles[tokenId].currentRenter == address(0) || vehicles[tokenId].currentRenter == owner(), "Vehicle is currently rented");
        require(balances[msg.sender] >= vehicles[tokenId].pricePerHour, "Insufficient balance to rent this vehicle");

        // Transfer the vehicle token to the renter
        _safeTransferFrom(owner(), msg.sender, tokenId, 1, "");

        // Set the vehicle's current renter, start time
        vehicles[tokenId].startTime = block.timestamp;
        vehicles[tokenId].currentRenter = msg.sender;

        console.log("---rentVehicle---");
        emit VehicleRented(tokenId, msg.sender, vehicles[tokenId].startTime);
    }

    function endRental(uint256 tokenId, uint256 endTime, uint256 initialTax, uint256 kilometersDriven) public {
        console.log("---endRental---");
        require(vehicles[tokenId].currentRenter == msg.sender, "You are not the current renter of this vehicle");

        // Calculate the rental fee
        console.log("   ---startTime: %s", vehicles[tokenId].startTime);
        console.log("   ---endTime: %s", endTime);
        uint256 rentalDuration = endTime.sub(vehicles[tokenId].startTime);
        console.log("   ---rentalDuration: %s", rentalDuration);

        uint256 requiredRentalFee = vehicles[tokenId].pricePerHour.div(3600).mul(rentalDuration);
//        console.log("   ---pricePerHour: %s", vehicles[tokenId].pricePerHour);
        console.log("   ---requiredRentalFee: %s", requiredRentalFee);
        requiredRentalFee.add(initialTax);

        // Subtract the rental fee from the renter's balance
        balances[msg.sender] = balances[msg.sender].sub(requiredRentalFee);
        // Add the rental fee to the total income and to the owner's balance
        addRentalIncome(requiredRentalFee);

        // Transfer the vehicle token back to the owner
        _safeTransferFrom(msg.sender, owner(), tokenId, 1, "");

        // Reset the vehicle's current renter, start time
        vehicles[tokenId].currentRenter = owner();
        vehicles[tokenId].startTime = 0;

        // Award points for kilometers driven.
        addPoints(msg.sender, kilometersDriven);

        emit RentalEnded(tokenId, msg.sender, requiredRentalFee, rentalDuration);
    }

    //subsection points
    // Additional function for users to spend their points.
    function spendPoints(uint256 amount) public {
        require(balanceOf(msg.sender, POINTS_TOKEN_ID) >= amount, "Insufficient points");
        _burn(msg.sender, POINTS_TOKEN_ID, amount);
    }
//    // Add points to a user's account
//    function addPoints(address user, uint256 amount) internal {
//        pointsBalances[user] = pointsBalances[user].add(amount);
//    }
    function addPoints(address user, uint256 amount) internal {
        pointsBalances[user] = pointsBalances[user].add(amount);
        _mint(user, POINTS_TOKEN_ID, amount, "");
    }
    //end subsection points
    //end section User functions

    //section Owner functions
    function createVehicle(
        string memory make,
        string memory model,
        uint256 pricePerHour
    ) public onlyOwner {
        uint256 maxRentalHours = 2 hours;
        console.log("---Creating vehicle---");
        console.log("   ---make: %s", make);
        console.log("   ---model: %s", model);
        console.log("   ---pricePerHour: %s", pricePerHour);
        _mint(owner(), VEHICLES_TOKEN_ID, 1, "");
        vehicles[VEHICLES_TOKEN_ID] = Vehicle(make, model, pricePerHour, maxRentalHours, 0, owner());
        VEHICLES_TOKEN_ID++;
    }

    // Add rental income to owner's account
    function addRentalIncome(uint256 amount) internal {
        totalRentalIncome = totalRentalIncome.add(amount);
        balances[owner()] = balances[owner()].add(amount);
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

    //section getters functions
    function totalSupply() public view returns (uint256) {
        return VEHICLES_TOKEN_ID;
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
        address currentRenter
    )
    {
        Vehicle storage vehicle = vehicles[tokenId];
        return (vehicle.make, vehicle.model, vehicle.pricePerHour, vehicle.maxRentalHours,vehicle.startTime, vehicle.currentRenter);
    }

    function getRentedVehicleByAddress()
    public
    view
    returns (
        uint256 id,
        Vehicle memory vehicle
    )
    {
        for (uint256 i = 0; i < VEHICLES_TOKEN_ID; i++) {
            if (vehicles[i].currentRenter == msg.sender) {
                Vehicle storage vehicleForRent = vehicles[i];
                return (i,vehicleForRent);
            }
        }

        revert("No vehicle currently rented by the provided address");
    }

    //end section getters functions
}
