// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import { IEWalletMember } from './IEWalletMember.sol';
/**
 * @title EWalletMember
 * @dev Non custodial entity wallet mpember management
 */
contract EWalletMember is IEWalletMember {

  /****************** Module ***********************/

  function moduleName() public pure returns (string memory) {
    return "member";
  }

  function moduleVersion() public pure returns (string memory) {
    return "0.0.0";
  }

  function moduleContract() public pure returns (string memory) {
    return "EWalletMember";
  }

  /***************** Constructor *****************/

  constructor(
    string memory _memberName,
    string memory _deviceName,
    address _owner
  ) {
    uint16 memberId = _addMember(_memberName);
    _addDevice(_deviceName, _owner, memberId); // 'msg.sender' is sender of current call, contract deployer for a constructor, or tx.origin
    _setRole(memberId, true, true, true, true, true);
  }

  /**************** Member *******************/

  struct Member {
    string name;
    EWalletMemberRole role;
    bool disable;
    uint16 deviceId;
  }

  Member[] private memberList;
  mapping (string => uint16) private memberListByName;
  mapping (address => uint16) private memberListByAddress;

  modifier checkEnable {
      uint16 memberId = memberListByAddress[msg.sender];
      require(!memberList[memberId].disable, "member is disable");
      uint16 deviceId = deviceListByAddress[memberId][msg.sender];
      require(!deviceList[memberId][deviceId].disable, "device is disable");
      require(deviceList[memberId][deviceId].walletAddress == msg.sender, "device not found");
      _;
  }

  modifier checkEnableAddress(address _address) {
      uint16 memberId = memberListByAddress[_address];
      require(!memberList[memberId].disable, "member is disable");
      uint16 deviceId = deviceListByAddress[memberId][_address];
      require(!deviceList[memberId][deviceId].disable, "device is disable");
      require(deviceList[memberId][deviceId].walletAddress == _address, "device not found");
      _;
  }

  function getMemberList() public view returns(Member[] memory){
      return memberList;
  }

  function getMemberByAddress(address _address) public view returns(uint16){
      return memberListByAddress[_address];
  }

  function getMemberId(address _address) public checkEnableAddress(_address) view returns(uint16){
      return memberListByAddress[_address];
  }

  function getMember(address _address) public checkEnableAddress(_address) view returns(Member memory){
      return memberList[memberListByAddress[_address]];
  }

  function getMemberIdSelf() public checkEnable view returns(uint16){
      return memberListByAddress[msg.sender];
  }

  function getMemberSelf() public checkEnable view returns(Member memory){
      return memberList[memberListByAddress[msg.sender]];
  }

  /*************** Member Admin ********************/

  /**
   * @dev Private Add member to the entity
   */
  function _addMember(string memory _name) private returns(uint16) {
      require(bytes(_name).length > 0);
      require(memberListByName[_name] == 0);
      Member memory member;
      member.name = _name;
      uint16 memberId = uint16(memberList.length);
      memberList.push(member);
      memberListByName[_name] = memberId;
      return memberId;
  }

  function disableMember(uint16 _memberId, bool _disable) public checkEnable roleManageMember {
      require(memberList[_memberId].role.manageRole == false, "Admin member");
      memberList[_memberId].disable = _disable;
  }

  /**
   * @dev add Member
   */
  function addMember(string memory _name, string memory _deviceName, address _walletAddress) public checkEnable roleManageMember {
      _addDevice(_deviceName, _walletAddress, _addMember(_name));
  }

  /*************** Device ********************/

  struct Device {
      string name;
      address payable walletAddress;
      uint16 memberId;
      bool disable;
  }

  mapping(uint16 => Device[]) private deviceList;
  mapping(uint16 =>mapping (string => uint16)) private deviceListByName;
  mapping(uint16 =>mapping (address => uint16)) private deviceListByAddress;

  function getDeviceList(uint16 _memberId) public view returns(Device[] memory){
      return deviceList[_memberId];
  }

  function getDeviceIdSelf(uint16 _memberId) public view returns(uint16){
      return deviceListByAddress[_memberId][msg.sender];
  }

  /*************** Device Admin ******************/

  /**
   * @dev Private Add device to the entity
   */
  function _addDevice(string memory _name, address _walletAddress, uint16 _memberId) private {
      require(bytes(_name).length > 0);
      require(_walletAddress != address(0));

      require(deviceListByName[_memberId][_name] == 0);
      require(memberListByAddress[_walletAddress] == 0);

      Device memory device;

      device.name = _name;
      device.walletAddress = payable(_walletAddress);
      device.memberId = _memberId;

      uint16 deviceId = uint16(deviceList[_memberId].length);

      deviceList[_memberId].push(device);
      deviceListByName[_memberId][_name] = deviceId;
      deviceListByAddress[_memberId][_walletAddress] = deviceId;
      memberListByAddress[_walletAddress] = _memberId;

  }

  function addSelfDevice(string memory _deviceName, address _walletAddress) public checkEnable roleManageSelfDevice {
      _addDevice(_deviceName, _walletAddress, memberListByAddress[msg.sender]);
  }

  function _disableDevice(address _walletAddress, bool _disable, uint16 _memberId) private {
      uint16 _deviceId = deviceListByAddress[_memberId][_walletAddress];
      require(_deviceId != 0, "device not found");
      deviceList[_memberId][_deviceId].disable = _disable;
  }

  function disableSelfDevice(address _walletAddress, bool _disable) public checkEnable roleManageSelfDevice {
      uint16 _memberId = memberListByAddress[msg.sender];
      _disableDevice(_walletAddress, _disable, _memberId);
  }

  function disableDevice(address _walletAddress, bool _disable) public checkEnable roleManageDevice {
      uint16 _memberId = memberListByAddress[_walletAddress];
      _disableDevice(_walletAddress, _disable, _memberId);
  }

  /************************ Role *****************************/

  struct EWalletMemberRole {
      bool manageRole;
      bool manageMember;
      bool manageSelfMember;
      bool manageSelfDevice;
      bool manageDevice;
  }

  modifier roleManageDevice {
      uint16 memberId = memberListByAddress[msg.sender];
      require(memberList[memberId].role.manageDevice);
      _;
  }

  modifier roleManageSelfDevice {
      uint16 memberId = memberListByAddress[msg.sender];
      require(memberList[memberId].role.manageSelfDevice);
      _;
  }

  modifier roleManageMember {
      uint16 memberId = memberListByAddress[msg.sender];
      require(memberList[memberId].role.manageMember);
      _;
  }

  modifier roleManageSelfMember {
      uint16 memberId = memberListByAddress[msg.sender];
      require(memberList[memberId].role.manageSelfMember);
      _;
  }

  modifier roleManageRole {
      uint16 memberId = memberListByAddress[msg.sender];
      require(memberList[memberId].role.manageRole);
      _;
  }

  function checkManageRole(address _address) checkEnableAddress(_address) public view {
      uint16 memberId = memberListByAddress[_address];
      require(memberList[memberId].role.manageRole, "you are not manager");
  }

  function getRole (uint16 memberId) public view returns (EWalletMemberRole memory){
      return memberList[memberId].role;
  }

  /************************* Role Admin ************************/

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
  ) public checkEnable roleManageRole {
      _setRole(
          _memberId,
          _manageRole,
          _manageMember,
          _manageSelfMember,
          _manageSelfDevice,
          _manageDevice
      );
  }



}
