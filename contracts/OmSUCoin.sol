// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract OmSUCoin is ERC20, Ownable {
    constructor() ERC20("OmSUCoin", "OMSU") {
        // Initial minting can be done here if needed
    }

    // Function to mint tokens to a specific address
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    // Batch mint function to efficiently mint tokens to multiple addresses
    function batchMint(address[] memory recipients, uint256[] memory amounts) public onlyOwner {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        for (uint256 i = 0; i < recipients.length; i++) {
            _mint(recipients[i], amounts[i]);
        }
    }
}
