pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ElectricVehicle is ERC1155, Ownable {
    // Add a constructor with a URI parameter
    constructor(string memory uri) ERC1155(uri) {}


    struct Vehicle {
        string make;
        string model;
        uint256 price;
        uint256 startTime;
        uint256 endTime;
        address appAddress;
    }

    mapping(uint256 => Vehicle) private _vehicleData;

    uint256 private _currentTokenId = 0;

    function dummyFunction() public {
        emit DebugEvent("Dummy function called", msg.sender);
    }


    function getContractOwner() public view returns (address, address) {
        return (owner(), msg.sender);
    }

    event DebugEvent(string message, address value);
    event VehicleMinted(uint256 tokenId, address caller);
    function mintVehicle(
        address to,
        string memory make,
        string memory model,
        uint256 price
    ) public onlyOwner {
        emit DebugEvent("Minting vehicle", msg.sender);
        _mint(to, _currentTokenId, 1, "");
        _vehicleData[_currentTokenId] = Vehicle(make, model, price, 0, 0, msg.sender);
        _currentTokenId++;
    }



    function rentVehicle(uint256 tokenId, uint256 startTime, uint256 endTime) public {
        require(balanceOf(_vehicleData[tokenId].appAddress, tokenId) == 1, "The app does not own this vehicle");
        require(_vehicleData[tokenId].endTime < startTime, "Vehicle is already rented during this time");

        // Transfer ownership to the renter
        safeTransferFrom(_vehicleData[tokenId].appAddress, msg.sender, tokenId, 1, "");

        _vehicleData[tokenId].startTime = startTime;
        _vehicleData[tokenId].endTime = endTime;
    }

    event RentalEnded(uint256 tokenId, address renter);

    function endRental(uint256 tokenId) public checkRentalStatus(tokenId) {
        require(balanceOf(msg.sender, tokenId) == 1, "You do not own this vehicle");

        // Transfer ownership back to the app
        safeTransferFrom(msg.sender, _vehicleData[tokenId].appAddress, tokenId, 1, "");

        // Reset rental start and end times
        _vehicleData[tokenId].startTime = 0;
        _vehicleData[tokenId].endTime = 0;

        emit RentalEnded(tokenId, msg.sender);
    }

    modifier checkRentalStatus(uint256 tokenId) {
        if (_vehicleData[tokenId].endTime <= block.timestamp && balanceOf(msg.sender, tokenId) == 1) {
            // Transfer ownership back to the app
            safeTransferFrom(msg.sender, _vehicleData[tokenId].appAddress, tokenId, 1, "");

            // Reset rental start and end times
            _vehicleData[tokenId].startTime = 0;
            _vehicleData[tokenId].endTime = 0;

            emit RentalEnded(tokenId, msg.sender);
        }
        _;
    }

    function getVehicleData(uint256 tokenId)
    public
    view
    returns (
        string memory make,
        string memory model,
        uint256 price,
        uint256 startTime,
        uint256 endTime
    )
    {
        Vehicle storage vehicle = _vehicleData[tokenId];
        return (vehicle.make, vehicle.model, vehicle.price, vehicle.startTime, vehicle.endTime);
    }
}
