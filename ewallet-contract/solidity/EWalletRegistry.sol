// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import { EWallet } from "./EWallet.sol";
import { EWalletFactory } from "./EWalletFactory.sol";

contract EWalletRegistry {

  event EWalletCreated(string name, EWallet indexed wallet);

  EWalletFactory eWalletFactory;

  EWallet[] private entityList;

  EWallet owner;

  modifier isOwner {
      require(msg.sender == address(owner));
      _;
  }

  constructor(EWalletFactory _eWalletFactory) {
    eWalletFactory = _eWalletFactory;
    owner = createEntitySelf("admin", "admin", "admin");
  }

  function updateEWalletFactory(EWalletFactory _eWalletFactory) public isOwner {
    eWalletFactory = _eWalletFactory;
  }

  function createEntitySelf(
    string memory _name,
    string memory _ownerName,
    string memory _ownerDeviceName
  ) public returns (EWallet){
    return createEntity(_name, _ownerName, _ownerDeviceName, msg.sender);
  }

  function createEntity(
    string memory _name,
    string memory _ownerName,
    string memory _ownerDeviceName,
    address _ownerAddress
  ) public returns (EWallet){
    EWallet eWallet = eWalletFactory.newEWallet(_name, _ownerName, _ownerDeviceName, _ownerAddress);
    entityList.push(eWallet);
    emit EWalletCreated(_name, eWallet);
    return eWallet;
  }

  function getEntityList() public view returns (EWallet[] memory){
      return entityList;
  }
}
