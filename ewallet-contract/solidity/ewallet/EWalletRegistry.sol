// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import { EWallet } from "./EWallet.sol";
import { IEWalletRegistry } from "./IEWalletRegistry.sol";
import { IEWalletModuleAdmin } from "../modules/IEWalletModuleAdmin.sol";

contract EWalletRegistry is IEWalletRegistry {

  event EWalletCreated(string name, EWallet indexed wallet);

  /****************** ModuleAdmin ***********************/

  IEWalletModuleAdmin private moduleAdmin;

  constructor(
    IEWalletModuleAdmin _moduleAdmin
  ) {
    require(address(_moduleAdmin) != address(0));
    moduleAdmin = _moduleAdmin;
  }

  function updateModuleAdmin(
    IEWalletModuleAdmin _moduleAdmin
  ) public isAdmin {
    moduleAdmin = _moduleAdmin;
  }

  function getModuleAdmin() public view returns(IEWalletModuleAdmin) {
      return moduleAdmin;
  }

  /**************** EWalletEntity ********************/

  EWallet[] private entityList;

  function addEntity(
    EWallet eWallet
  ) public isAdmin {
    entityList.push(eWallet);
    emit EWalletCreated(eWallet.name(), eWallet);
  }

  function getEntityList() public view returns (EWallet[] memory){
      return entityList;
  }

  /********************** role *******************************/

  modifier isAdmin() {
      if (address(moduleAdmin) != address(msg.sender)){
        moduleAdmin.getOwner().checkManageRole(msg.sender);
      }
      _;
  }

}
