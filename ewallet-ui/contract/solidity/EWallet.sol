// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import { IERC20 } from "./IERC20.sol";

/**
 * @title EWallet
 * @dev Non custodial entity wallet
 */
contract EWallet {

    event Deposit(address indexed _from, address _tokenAddress, uint _value);

    struct Device {
        string name;
        address payable walletAddress;
        uint256 memberId;
        bool disable;
    }

    struct Role {
        bool manageRole;
        bool manageMember;
        bool manageSelfMember;
        bool manageSelfDevice;
        bool manageDevice;
    }

    struct Member {
        string name;
        Role role;
        bool disable;
        uint256 deviceId;
        uint256 balanceETH;
    }

    string public name;

    mapping (uint256 => Member) public memberList;
    mapping (string => uint256) public memberListByName;
    mapping (address => uint256) public memberListByAddress;


    mapping(uint256 => mapping(address => uint256)) public balanceERC20;
    mapping(uint256 => mapping(uint256 => Device)) public deviceList;
    mapping(uint256 =>mapping (string => uint256)) public deviceListByName;
    mapping(uint256 =>mapping (address => uint256)) public deviceListByAddress;

    uint256 public memberId;

    /**
     * @dev Private Add member to the entity
     */
    function _addMember(string memory _name) private returns(uint256) {
        require(bytes(_name).length > 0, "Name is empty");
        require(memberListByName[_name] == 0, "Dupplicate name");
        memberId += 1;
        memberList[memberId].name = _name;
        memberListByName[_name] = memberId;
        return memberId;
    }

    /**
     * @dev Private Add device to the entity
     */
    function _addDevice(string memory _name, address _walletAddress, uint256 _memberId) private {
        require(bytes(_name).length > 0, "Name is empty");
        require(_walletAddress != address(0), "Address is empty");

        require(deviceListByName[_memberId][_name] == 0, "Dupplicate name");
        require(memberListByAddress[_walletAddress] == 0, "Dupplicate address");

        memberList[_memberId].deviceId += 1;

        deviceList[_memberId][memberList[_memberId].deviceId].name = _name;
        deviceList[_memberId][memberList[_memberId].deviceId].walletAddress = payable(_walletAddress);
        deviceList[_memberId][memberList[_memberId].deviceId].memberId = _memberId;

        deviceListByName[_memberId][_name] = memberList[_memberId].deviceId;
        deviceListByAddress[_memberId][_walletAddress] = memberList[_memberId].deviceId;
        memberListByAddress[_walletAddress] = _memberId;

    }

    function _setRole(
        uint256 _memberId,
        bool _manageRole,
        bool _manageMember,
        bool _manageSelfMember,
        bool _manageSelfDevice,
        bool _manageDevice
    ) private {
        memberList[_memberId].role.manageRole = _manageRole;
        memberList[_memberId].role.manageMember = _manageMember;
        memberList[_memberId].role.manageDevice = _manageDevice;
        memberList[_memberId].role.manageSelfMember = _manageSelfMember;
        memberList[_memberId].role.manageSelfDevice = _manageSelfDevice;

    }

    modifier deviceEnable {
        require(!deviceList[memberListByAddress[msg.sender]][deviceListByAddress[memberListByAddress[msg.sender]][msg.sender]].disable, "Device disable");
        _;
    }

    modifier memberEnable {
        require(!memberList[memberListByAddress[msg.sender]].disable, "Member disable");
        _;
    }

    modifier roleManageDevice {
        require(memberList[memberListByAddress[msg.sender]].role.manageDevice, "Not allowed");
        _;
    }

    modifier roleManageSelfDevice {
        require(memberList[memberListByAddress[msg.sender]].role.manageSelfDevice, "Not allowed");
        _;
    }

    modifier roleManageMember {
        require(memberList[memberListByAddress[msg.sender]].role.manageMember, "Not allowed");
        _;
    }

    modifier roleManageSelfMember {
        require(memberList[memberListByAddress[msg.sender]].role.manageSelfMember, "Not allowed");
        _;
    }

    modifier roleManageRole {
        require(memberList[memberListByAddress[msg.sender]].role.manageRole, "Not allowed");
        _;
    }

    function addSelfDevice(string memory _deviceName, address _walletAddress) public memberEnable deviceEnable roleManageSelfDevice {
        _addDevice(_deviceName, _walletAddress, memberListByAddress[msg.sender]);
    }

    function _disableDevice(address _walletAddress, bool _disable, uint256 _memberId) private {
        uint256 _deviceId = deviceListByAddress[_memberId][_walletAddress];
        require(_deviceId != 0, "device not found");
        deviceList[_memberId][_deviceId].disable = _disable;
    }

    function disableSelfDevice(address _walletAddress, bool _disable) public memberEnable deviceEnable roleManageSelfDevice {
        uint256 _memberId = memberListByAddress[msg.sender];
        _disableDevice(_walletAddress, _disable, _memberId);
    }

    function disableDevice(address _walletAddress, bool _disable) public memberEnable deviceEnable roleManageDevice {
        uint256 _memberId = memberListByAddress[_walletAddress];
        _disableDevice(_walletAddress, _disable, _memberId);
    }

    function disableMember(uint256 _memberId, bool _disable) public memberEnable deviceEnable roleManageMember {
        require(memberList[_memberId].role.manageRole == false, "Admin member");
        memberList[_memberId].disable = _disable;
    }

    /**
     * @dev add Member
     */
    function addMember(string memory _name, string memory _deviceName, address _walletAddress) public memberEnable deviceEnable roleManageMember {
        _addDevice(_deviceName, _walletAddress, _addMember(_name));
    }

    /**
     * @dev set role
     */

    function setRole(
        uint256 _memberId,
        bool _manageRole,
        bool _manageMember,
        bool _manageSelfMember,
        bool _manageSelfDevice,
        bool _manageDevice
    ) public memberEnable deviceEnable roleManageRole {
        _setRole(
            _memberId,
            _manageRole,
            _manageMember,
            _manageSelfMember,
            _manageSelfDevice,
            _manageDevice
        );
    }

    function depositETH(

    ) public payable memberEnable deviceEnable {
        memberList[memberListByAddress[msg.sender]].balanceETH += msg.value;
    }

    function depositERC20Token(
        address _tokenAddress,
        uint256 _amount
    ) public memberEnable deviceEnable {
        IERC20 token = IERC20(_tokenAddress);
        bool transferSucceeded  = token.transferFrom(msg.sender, address(this), _amount);
        require(transferSucceeded, "token transfer error");
        balanceERC20[memberListByAddress[msg.sender]][_tokenAddress] += _amount;
    }

    function withdrawETH(
        uint256 _amount
    ) public memberEnable deviceEnable {
        require(memberList[memberListByAddress[msg.sender]].balanceETH >= _amount, "Not enought found");
        memberList[memberListByAddress[msg.sender]].balanceETH -= _amount;
        payable(msg.sender).transfer(_amount);
    }

    function withdrawERC20Token(
        address _tokenAddress,
        uint256 _amount
    ) public memberEnable deviceEnable {
        require(balanceERC20[memberListByAddress[msg.sender]][_tokenAddress] >= _amount, "Not enought found");
        IERC20 token = IERC20(_tokenAddress);
        balanceERC20[memberListByAddress[msg.sender]][_tokenAddress] -= _amount;
        token.transfer(msg.sender, _amount);
    }

    /**
     * @dev Set contract deployer as owner
     */
    constructor(string memory _name, string memory _memberName, string memory _deviceName) {
        name = _name;
        memberId = _addMember(_memberName);
        _addDevice(_deviceName, tx.origin, memberId); // 'msg.sender' is sender of current call, contract deployer for a constructor
        _setRole(memberId, true, true, true, true, true);
    }

}
