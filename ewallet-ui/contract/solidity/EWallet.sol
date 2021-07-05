// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import { IERC20 } from "./IERC20.sol";

/**
 * @title EWallet
 * @dev Non custodial entity wallet
 */
contract EWallet {

    event Deposit(address indexed _from, address _tokenAddress, uint _value);
    event Withdraw(address indexed to, address _tokenAddress, uint _value);
    event Credit(address indexed _from, address _tokenAddress, uint _value, string name, string reason);
    event Debit(address indexed _to, address _tokenAddress, uint _value, string name, string reason);
    event Operation(uint256 indexed _memberId, address indexed _from, address indexed _to, address _tokenAddress, uint _value, string _name, string _reason);

    struct SendToApprove {
        uint256 initiator;
        uint256 validator;
        address payable to;
        address tokenAddress;
        uint value;
        string name;
        string reason;
    }

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
        bool manageAllowance;
    }

    struct Member {
        string name;
        Role role;
        bool disable;
        uint256 deviceId;
        uint256 balanceETH;
        uint256 allowanceETH;
    }

    string public name;

    mapping (uint256 => Member) public memberList;
    mapping (string => uint256) public memberListByName;
    mapping (address => uint256) public memberListByAddress;


    mapping(uint256 => mapping(address => uint256)) public balanceERC20;
    mapping(uint256 => mapping(address => uint256)) public allowanceERC20;
    mapping(uint256 => mapping(uint256 => Device)) public deviceList;
    mapping(uint256 =>mapping (string => uint256)) public deviceListByName;
    mapping(uint256 =>mapping (address => uint256)) public deviceListByAddress;

    mapping (uint256 => SendToApprove) public sendToApproveList;

    uint256 public memberId;
    uint256 public sendToApproveId;

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

    function _addSendToApprove(
        address payable _to,
        address _tokenAddress,
        uint256 _value,
        string memory _name,
        string memory _reason
    ) private {
        sendToApproveId += 1;
        sendToApproveList[sendToApproveId].initiator = memberListByAddress[msg.sender];
        sendToApproveList[sendToApproveId].to = payable(_to);
        sendToApproveList[sendToApproveId].tokenAddress = _tokenAddress;
        sendToApproveList[sendToApproveId].value = _value;
        sendToApproveList[sendToApproveId].name = _name;
        sendToApproveList[sendToApproveId].reason = _reason;
    }

    function _setRole(
        uint256 _memberId,
        bool _manageRole,
        bool _manageMember,
        bool _manageSelfMember,
        bool _manageSelfDevice,
        bool _manageDevice,
        bool _manageAllowance
    ) private {
        memberList[_memberId].role.manageRole = _manageRole;
        memberList[_memberId].role.manageMember = _manageMember;
        memberList[_memberId].role.manageDevice = _manageDevice;
        memberList[_memberId].role.manageSelfMember = _manageSelfMember;
        memberList[_memberId].role.manageSelfDevice = _manageSelfDevice;
        memberList[_memberId].role.manageAllowance = _manageAllowance;
    }

    modifier deviceEnable {
        require(!deviceList[memberListByAddress[msg.sender]][deviceListByAddress[memberListByAddress[msg.sender]][msg.sender]].disable);
        _;
    }

    modifier memberEnable {
        require(!memberList[memberListByAddress[msg.sender]].disable);
        _;
    }

    modifier roleManageDevice {
        require(memberList[memberListByAddress[msg.sender]].role.manageDevice);
        _;
    }

    modifier roleManageAllowance {
        require(memberList[memberListByAddress[msg.sender]].role.manageAllowance);
        _;
    }

    modifier roleManageSelfDevice {
        require(memberList[memberListByAddress[msg.sender]].role.manageSelfDevice);
        _;
    }

    modifier roleManageMember {
        require(memberList[memberListByAddress[msg.sender]].role.manageMember);
        _;
    }

    modifier roleManageSelfMember {
        require(memberList[memberListByAddress[msg.sender]].role.manageSelfMember);
        _;
    }

    modifier roleManageRole {
        require(memberList[memberListByAddress[msg.sender]].role.manageRole);
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
        bool _manageDevice,
        bool _manageAllowance
    ) public memberEnable deviceEnable roleManageRole {
        _setRole(
            _memberId,
            _manageRole,
            _manageMember,
            _manageSelfMember,
            _manageSelfDevice,
            _manageDevice,
            _manageAllowance
        );
    }

    function _sendETH(
        address payable _to,
        uint256 _amount,
        string memory _name,
        string memory _reason
    ) private {
        payable(_to).transfer(_amount);
        //emit Debit(_to, address(0), _amount, _name, _reason);
        emit Operation(memberListByAddress[msg.sender], address(0), _to, address(0), _amount, _name, _reason);
    }

    function _sendERC20Token(
        address payable _to,
        address _tokenAddress,
        uint256 _amount,
        string memory _name,
        string memory _reason
    ) private {
        IERC20 token = IERC20(_tokenAddress);
        token.transfer(_to, _amount);
        //emit Debit(_to, _tokenAddress, _amount, _name, _reason);
        emit Operation(memberListByAddress[msg.sender], address(0), _to, _tokenAddress, _amount, _name, _reason);
    }

    function depositETH(

    ) public payable memberEnable deviceEnable {
        memberList[memberListByAddress[msg.sender]].balanceETH += msg.value;
        //emit Deposit(msg.sender, address(0), msg.value);
        emit Operation(memberListByAddress[msg.sender], msg.sender, address(0), address(0), msg.value, "", "Deposit fund");
    }

    function depositERC20Token(
        address _tokenAddress,
        uint256 _amount
    ) public memberEnable deviceEnable {
        IERC20 token = IERC20(_tokenAddress);
        bool transferSucceeded  = token.transferFrom(msg.sender, address(this), _amount);
        require(transferSucceeded, "token transfer error");
        balanceERC20[memberListByAddress[msg.sender]][_tokenAddress] += _amount;
        emit Operation(memberListByAddress[msg.sender], msg.sender, address(0), _tokenAddress, _amount, "", "Deposit fund");
    }

    function withdrawETH(
        uint256 _amount
    ) public memberEnable deviceEnable {
        require(memberList[memberListByAddress[msg.sender]].balanceETH >= _amount);
        memberList[memberListByAddress[msg.sender]].balanceETH -= _amount;
        _sendETH(payable(msg.sender), _amount, "", "Withdraw fund");
    }

    function withdrawERC20Token(
        address _tokenAddress,
        uint256 _amount
    ) public memberEnable deviceEnable {
        require(balanceERC20[memberListByAddress[msg.sender]][_tokenAddress] >= _amount);
        balanceERC20[memberListByAddress[msg.sender]][_tokenAddress] -= _amount;
        _sendERC20Token(payable(msg.sender), _tokenAddress, _amount, "", "Withdraw fund");
    }

    function receiveETH(
        string memory _name,
        string memory _reason
    ) public payable {
        emit Operation(memberListByAddress[msg.sender], msg.sender, address(0), address(0), msg.value, _name, _reason);
    }

    function receiveERC20Token(
        address _tokenAddress,
        uint256 _amount,
        string memory _name,
        string memory _reason
    ) public {
        IERC20 token = IERC20(_tokenAddress);
        bool transferSucceeded  = token.transferFrom(msg.sender, address(this), _amount);
        require(transferSucceeded, "token transfer error");
        emit Operation(memberListByAddress[msg.sender], msg.sender, address(0), _tokenAddress, _amount, _name, _reason);
    }

    function sendETH(
        address payable _to,
        uint256 _amount,
        string memory _name,
        string memory _reason
    ) public memberEnable deviceEnable{
        require(memberList[memberListByAddress[msg.sender]].allowanceETH >= _amount);
        memberList[memberListByAddress[msg.sender]].allowanceETH -= _amount;
        _sendETH(_to, _amount, _name, _reason);
    }

    function sendERC20Token(
        address payable _to,
        address _tokenAddress,
        uint256 _amount,
        string memory _name,
        string memory _reason
    ) public memberEnable deviceEnable {
        require(allowanceERC20[memberListByAddress[msg.sender]][_tokenAddress] >= _amount);
        allowanceERC20[memberListByAddress[msg.sender]][_tokenAddress] -= _amount;
        _sendERC20Token(_to, _tokenAddress, _amount, _name, _reason);
    }

    function sendETHToApprove(
        address payable _to,
        uint256 _amount,
        string memory _name,
        string memory _reason
    ) public memberEnable deviceEnable{
        _addSendToApprove(_to, address(0), _amount, _name, _reason);
    }

    function sendERC20TokenToApprove(
        address payable _to,
        address _tokenAddress,
        uint256 _amount,
        string memory _name,
        string memory _reason
    ) public memberEnable deviceEnable {
        _addSendToApprove(_to, _tokenAddress, _amount, _name, _reason);
    }

    function validateSendToApprove(
        uint256 _id
    ) public memberEnable deviceEnable roleManageAllowance {
        require(sendToApproveList[_id].validator == 0);
        sendToApproveList[_id].validator = memberListByAddress[msg.sender];
        if (sendToApproveList[_id].tokenAddress == address(0)){
            _sendETH(sendToApproveList[_id].to, sendToApproveList[_id].value, sendToApproveList[_id].name, sendToApproveList[_id].reason);
        } else {
            _sendERC20Token(sendToApproveList[_id].to, sendToApproveList[_id].tokenAddress, sendToApproveList[_id].value, sendToApproveList[_id].name, sendToApproveList[_id].reason);
        }
    }

    function allowanceETH (
        uint256 _amount,
        uint256 _memberId
    ) public memberEnable deviceEnable roleManageAllowance {
        memberList[_memberId].allowanceETH = _amount;
    }

    function allowanceToken (
        uint256 _amount,
        address _tokenAddress,
        uint256 _memberId
    ) public memberEnable deviceEnable roleManageAllowance {
        allowanceERC20[_memberId][_tokenAddress] -= _amount;
    }

    /**
     * @dev Set contract deployer as owner
     */
    constructor(string memory _name, string memory _memberName, string memory _deviceName) {
        name = _name;
        memberId = _addMember(_memberName);
        _addDevice(_deviceName, tx.origin, memberId); // 'msg.sender' is sender of current call, contract deployer for a constructor
        _setRole(memberId, true, true, true, true, true, true);
    }

}
