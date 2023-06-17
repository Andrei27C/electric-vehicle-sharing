pragma solidity ^0.8.1;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ElectricVehicleToken.sol";

contract PointsBank is Ownable {
    ElectricVehicleToken private _evToken;

    constructor(ElectricVehicleToken evToken) {
        _evToken = evToken;
    }

    function mintPoints(address to, uint256 amount) public onlyOwner {
        _evToken.mintPoints(to, amount);
    }

    function burnPoints(address from, uint256 amount) public onlyOwner {
        _evToken.burnPoints(from, amount);
    }

//    function transferPoints(address from, address to, uint256 amount) public onlyOwner {
//        _evToken.transferPoints(from, to, amount);
//    }
}
