// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import { IEWalletModule } from "./IEWalletModule.sol";
import { IEWalletModuleAdmin } from "./IEWalletModuleAdmin.sol";

import { IEWallet } from '../ewallet/IEWallet.sol';
import { EWalletRegistry } from '../ewallet/EWalletRegistry.sol';

import { EWallet } from '../ewallet/EWallet.sol';
import { EWalletFactory } from "../ewallet/EWalletFactory.sol";

import { EWalletMember } from './member/EWalletMember.sol';
import { EWalletMemberFactory } from './member/EWalletMemberFactory.sol';

import { EWalletWalletFactory } from './wallet/EWalletWalletFactory.sol';
import { EWalletERC20InfoFactory } from './ERC20Info/EWalletERC20InfoFactory.sol';
import { EWalletENSFactory } from './ENS/EWalletENSFactory.sol';


contract EWalletModuleAdmin is IEWalletModuleAdmin {

    event EWalletCreated(string name, EWallet indexed wallet);

    constructor (
      EWalletFactory _eWalletFactory,
      EWalletMemberFactory _memberFactory,
      string memory _name,
      string memory _ownerName,
      string memory _ownerDeviceName,
      address _ownerAddress,
      EWallet _owner
    ) {
      require(address(_eWalletFactory) != address(0), "EWallet factory is null");
      require(address(_memberFactory) != address(0), "EWallet member factory is null");
      eWalletFactory = _eWalletFactory;
      memberFactory = _memberFactory;
      if (address(_owner) != address(0)){
        owner = _owner;
      } else {
        owner = createEWallet(
          _name,
          createEWalletMember(
            _ownerName,
            _ownerDeviceName,
            _ownerAddress
          )
        );
      }
    }

    /********************** owner *******************************/

    EWallet private owner;

    function getOwner() public view returns(IEWallet){
      return owner;
    }

    function setOwner(EWallet _owner) public isAdmin {
      owner = _owner;
    }

    /********************** registry *******************************/

    EWalletRegistry private eWalletRegistry;

    function setEWalletRegistry (
      EWalletRegistry _eWalletRegistry
    ) public isAdmin {
      require(address(_eWalletRegistry) != address(0));
      require(address(_eWalletRegistry.getModuleAdmin()) == address(this));
      eWalletRegistry = _eWalletRegistry;
      eWalletRegistry.addEntity(owner);
      owner.setEWalletRegistry(eWalletRegistry);
    }

    /********************** role *******************************/

    modifier isAdmin() {
        getOwner().checkManageRole(msg.sender);
        _;
    }

    /********************** entity **********************/
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
      require(address(eWalletRegistry) != address(0), "Registry is null");
      EWallet eWallet = createEWallet(
        _name,
        createEWalletMember(
          _ownerName,
          _ownerDeviceName,
          _ownerAddress
        )
      );
      eWalletRegistry.addEntity(eWallet);
      eWallet.setEWalletRegistry(eWalletRegistry);
      emit EWalletCreated(_name, eWallet);
      return eWallet;
    }

    /********************** ewallet *********************/
    EWalletFactory eWalletFactory;

    function setEWalletFactory(
      EWalletFactory _eWalletFactory
    ) public isAdmin {
      require(address(eWalletFactory) != address(0));
      eWalletFactory = _eWalletFactory;
    }

    function createEWallet(
      string memory _name,
      EWalletMember _member
    ) public returns (EWallet){
      return eWalletFactory.newEWallet(
        _name,
        _member,
        this
      );
    }

    /********************** member *********************/

    EWalletMemberFactory memberFactory;

    function setEWalletMemberFactory(
        EWalletMemberFactory _memberFactory
    ) public isAdmin {
        require(address(memberFactory) != address(0));
        memberFactory = _memberFactory;
    }

    function createEWalletMember(
        string memory _memberName,
        string memory _deviceName,
        address _owner
    ) public returns(EWalletMember){
        return memberFactory.newEWalletMember(
          _memberName,
          _deviceName,
          _owner
        );
    }

    function addModuleEWalletMember(
      string memory _memberName,
      string memory _deviceName,
      address _owner,
      EWallet ewallet
    ) public {
        require(address(ewallet) != address(0));
        ewallet.isModuleManager(msg.sender);
        ewallet.addModule(createEWalletMember(
          _memberName,
          _deviceName,
          _owner
        ));
    }

    /********************** wallet *********************/

    EWalletWalletFactory walletFactory;

    function setEWalletWalletFactory(
      EWalletWalletFactory _walletFactory
    ) public isAdmin {
        walletFactory = _walletFactory;
    }

    function addModuleEWalletWallet(
        EWallet ewallet
    ) public {
        require(address(ewallet) != address(0));
        ewallet.isModuleManager(msg.sender);
        require(address(walletFactory) != address(0));
        ewallet.addModule(walletFactory.newEWalletWallet(
          ewallet
        ));
    }

    /********************** ERC20Info *********************/

    EWalletERC20InfoFactory ERC20InfoFactory;

    function setEWalletERC20InfoFactory(
      EWalletERC20InfoFactory _ERC20InfoFactory
    ) public isAdmin {
        ERC20InfoFactory = _ERC20InfoFactory;
    }

    function addModuleEWalletERC20Info(
        EWallet ewallet
    ) public {
        require(address(ewallet) != address(0));
        ewallet.isModuleManager(msg.sender);
        require(address(ERC20InfoFactory) != address(0));
        ewallet.addModule(ERC20InfoFactory.newEWalletERC20Info(
          ewallet
        ));
    }

    /********************** ENS *********************/

    EWalletENSFactory ENSFactory;

    function setEWalletENSFactory(
      EWalletENSFactory _ENSFactory
    ) public isAdmin {
        ENSFactory = _ENSFactory;
    }

    function addModuleEWalletENS(
        EWallet ewallet
    ) public {
        require(address(ewallet) != address(0));
        ewallet.isModuleManager(msg.sender);
        require(address(ENSFactory) != address(0));
        ewallet.addModule(ENSFactory.newEWalletENS(
          ewallet
        ));
    }

}
