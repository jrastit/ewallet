// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC777/ERC777.sol";

contract EWalletToken is ERC777 {
    constructor(string memory _name, string memory _symbol, uint256 initialSupply, address[] memory defaultOperators)
        ERC777(_name, _symbol, defaultOperators)
    {
        _mint(msg.sender, initialSupply, "", "");
    }
}
