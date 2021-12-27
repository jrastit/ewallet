// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import { EWallet } from "./EWallet.sol";
import { EWalletFactory } from "./EWalletFactory.sol";

contract EWalletRegistry {

  event EWalletCreated(string name, EWallet indexed wallet);

  EWalletFactory eWalletFactory;

  EWallet[] private entityList;

  constructor(EWalletFactory _eWalletFactory) {
      eWalletFactory = _eWalletFactory;
  }

  function createEntitySelf(
    string memory _name,
    string memory _ownerName,
    string memory _ownerDeviceName
  ) public {
    createEntity(_name, _ownerName, _ownerDeviceName, msg.sender);
  }

  function createEntity(
    string memory _name,
    string memory _ownerName,
    string memory _ownerDeviceName,
    address _ownerAddress
  ) public {
    EWallet eWallet = eWalletFactory.newEWallet(_name, _ownerName, _ownerDeviceName, _ownerAddress);
    entityList.push(eWallet);
    emit EWalletCreated(_name, eWallet);
  }

  function getEntityList() public view returns (EWallet[] memory){
      return entityList;
  }
}
