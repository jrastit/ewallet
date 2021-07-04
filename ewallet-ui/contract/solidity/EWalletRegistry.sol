// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import { EWallet } from "./EWallet.sol";


contract EWalletRegistry {

  EWallet[] public entityList;
  uint256 public entityListSize;

  event EntityCreated(uint256 _index);

  function createEntity(string memory _name, string memory _memberName, string memory _deviceName) public{
    entityList.push(new EWallet(_name, _memberName, _deviceName));
    emit EntityCreated(entityListSize);
    entityListSize++;
  }
}
