// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import { IEWallet } from "./IEWallet.sol";
import { IEWalletModuleAdmin } from "../modules/IEWalletModuleAdmin.sol";
import { IEWalletRegistry } from "./IEWalletRegistry.sol";
import { IEWalletMember } from "../modules/member/IEWalletMember.sol";
import { IEWalletModule } from "../modules/IEWalletModule.sol";

contract EWallet is IEWallet {

  /****************** Module ***********************/

  function moduleName() public pure returns (string memory) {
    return "EWallet";
  }

  function moduleVersion() public pure returns (string memory) {
    return "0.0.0";
  }

  function moduleContract() public pure returns (string memory) {
    return "EWallet";
  }

  string public name;

  /**
   * @dev Set contract deployer as owner
   */
  constructor(
    string memory _name,
    IEWalletMember _memberContract,
    IEWalletModuleAdmin _moduleAdmin
  ) {
      //require(address(_memberContract) != address(0), "memberContract is null");
      //memberContract = _memberContract;
      _addModule(_memberContract);
      name = _name;
      moduleAdmin = _moduleAdmin;
  }

  /*********************** registry **********************************/

  IEWalletRegistry eWalletRegistry;

  function setEWalletRegistry(
    IEWalletRegistry _eWalletRegistry
  ) roleManageModule public {
    eWalletRegistry = _eWalletRegistry;
  }

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

  /****************** member *****************************/

  IEWalletMember public memberContract;

  function _updateMemberContract(
    IEWalletMember _memberContract
  ) private {
      require(address(_memberContract) != address(0), "memberContract is null");
      //_memberContract.checkManageRole(msg.sender);
      memberContract = _memberContract;
      //_setRole(getMemberId(msg.sender), true);
  }

  function getMemberId(address _address) public view returns(uint16){
      return memberContract.getMemberId(_address);
  }

  function checkManageRole(address _address) public view {
      memberContract.checkManageRole(_address);
  }

  /*************** role *******************************/

  struct EWalletRole {
    bool manageModule;
  }

  mapping(uint16 => EWalletRole) private roleList;

  modifier roleManageModule {
      if (address(moduleAdmin) != address(0)) {
        require(address(moduleAdmin) == address(msg.sender));
      } else {
        uint16 memberId = getMemberId(msg.sender);
        require(roleList[memberId].manageModule, "not module manager");
      }
      _;
  }

  function isModuleManager (address _address) public view {
      uint16 memberId = getMemberId(_address);
      require(roleList[memberId].manageModule, "not module manager");
  }

  modifier roleManageRole {
      checkManageRole(msg.sender);
      _;
  }

  /******************* role admin ******************/
  function _setRole(
      uint16 _memberId,
      bool _manageModuleRole
  ) private {
      roleList[_memberId].manageModule = _manageModuleRole;
  }


  function setRole(
      uint16 _memberId,
      bool _manageModuleRole
  ) public roleManageRole {
      _setRole(
          _memberId,
          _manageModuleRole
      );
  }

}
