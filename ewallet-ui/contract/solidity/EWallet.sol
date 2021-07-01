// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

/**
 * @title EWallet
 * @dev Non custodial entity wallet
 */
contract EWallet {

    struct TokenBalance {
        address tokenAddress;
        uint256 balance;
    }

    struct Device {
        string name;
        address walletAddress;
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
        mapping(address => uint256) tokenBalance;

        uint256 deviceId;
        mapping (uint256 => Device) deviceList;
        mapping (string => uint256) deviceListByName;
        mapping (address => uint256) deviceListByAddress;
    }

    mapping (uint256 => Member) public memberList;
    mapping (string => uint256) public memberListByName;
    mapping (address => uint256) public memberListByAddress;

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

        require(memberList[_memberId].deviceListByName[_name] == 0, "Dupplicate name");
        require(memberListByAddress[_walletAddress] == 0, "Dupplicate address");

        memberList[_memberId].deviceId += 1;

        memberList[_memberId].deviceList[memberList[_memberId].deviceId].name = _name;
        memberList[_memberId].deviceList[memberList[_memberId].deviceId].walletAddress = _walletAddress;
        memberList[_memberId].deviceList[memberList[_memberId].deviceId].memberId = _memberId;

        memberList[_memberId].deviceListByName[_name] = memberList[_memberId].deviceId;
        memberList[_memberId].deviceListByAddress[_walletAddress] = memberList[_memberId].deviceId;
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
        require(!memberList[memberListByAddress[msg.sender]].deviceList[memberList[memberListByAddress[msg.sender]].deviceListByAddress[msg.sender]].disable, "Device disable");
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
        uint256 _deviceId = memberList[_memberId].deviceListByAddress[_walletAddress];
        require(_deviceId != 0, "device not found");
        memberList[_memberId].deviceList[_deviceId].disable = _disable;
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

    /**
     * @dev Set contract deployer as owner
     */
    constructor(string memory _memberName, string memory _deviceName) {
        memberId = _addMember(_memberName);
        _addDevice(_deviceName, msg.sender, memberId); // 'msg.sender' is sender of current call, contract deployer for a constructor
        _setRole(memberId, true, true, true, true, true);
    }

}
