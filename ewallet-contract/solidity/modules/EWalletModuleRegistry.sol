// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import { IEWalletModuleAdmin } from "../modules/IEWalletModuleAdmin.sol";

contract EWalletModuleRegistry {
  /*********************** module **********************************/

  IEWalletModuleAdmin private moduleAdmin;

  function updateModuleAdminFromRegistry() public {
    require(address(eWalletRegistry) != address(0), "registry is null");
    moduleAdmin = eWalletRegistry.getModuleAdmin();
  }

  function getModuleAdmin() public view returns(IEWalletModuleAdmin) {
    return moduleAdmin;
  }

  string[] private moduleNameList;

  mapping(string => IEWalletModule) private walletModuleFromName;

  function getModule(string memory _name) public view returns (IEWalletModule) {
    return walletModuleFromName[_name];
  }

  function getModuleNameList() public view returns (string[] memory){
    return moduleNameList;
  }

  function addModule(IEWalletModule _module) roleManageModule public {
    _addModule(_module);
  }

  event AddModuleEvent(string name, IEWalletModule module);

  function _addModule(IEWalletModule _module) private {
    if (keccak256(abi.encodePacked(_module.moduleName())) ==
          keccak256(abi.encodePacked("member"))){
      _updateMemberContract(IEWalletMember(address(_module)));
    }
    if (address(walletModuleFromName[_module.moduleName()]) == address(0)){
      moduleNameList.push(_module.moduleName());
    }
    walletModuleFromName[_module.moduleName()] = _module;
    emit AddModuleEvent(_module.moduleName(), _module);
  }
}
