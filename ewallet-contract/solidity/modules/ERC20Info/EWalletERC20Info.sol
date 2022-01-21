// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import { AggregatorV3Interface } from  "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import { IEWalletModule } from "../IEWalletModule.sol";
import { IEWallet } from "../../ewallet/IEWallet.sol";
import { IEWalletENS } from "../ENS/IEWalletENS.sol";

contract EWalletERC20Info is IEWalletModule {

  function moduleName() public pure returns (string memory) {
    return "ERC20Info";
  }

  function moduleVersion() public pure returns (string memory) {
    return "0.0.0";
  }

  function moduleContract() public pure returns (string memory) {
    return "EWalletERC20Info";
  }

  struct ERC20Info {
    IERC20 token;
    string symbol;
    string name;
    uint8 decimals;
    bytes32 chainlinkUSDNode;
    AggregatorV3Interface chainlinkUSD;
    int256 valueInUSD;
    uint8 decimalsInUSD;
  }

  IEWallet private ewallet;

  ERC20Info mainToken;
  ERC20Info[] ERC20TokenList;

  uint16 ERC20TokenListId;

  mapping(IERC20 => uint) private TokenToERC20TokenList;

  // ENS registry address: 0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e
  constructor(IEWallet _ewallet) {
    ewallet = _ewallet;
  }

  /*************** Token ****************/

  function getTokenInfo(IERC20 _address) public view returns (ERC20Info memory) {
    ERC20Info memory info;
    if (address(_address) != address(0)){
      info = ERC20TokenList[getTokenInfoId(_address)];
    } else {
      info = mainToken;
    }
    return info;
  }

  function getTokenInfoIdTest(IERC20 _address) public view returns (uint256) {
    uint i = TokenToERC20TokenList[_address];
    return i;
  }

  function getTokenInfoId(IERC20 _address) public view returns (uint256) {
    uint i = TokenToERC20TokenList[_address];
    require(address(ERC20TokenList[i].token) == address(_address), "Token not found");
    return i;
  }

  function getMainToken() public view returns(ERC20Info memory) {
    return mainToken;
  }

  function getERC20TokenList() public view returns(ERC20Info[] memory) {
    return ERC20TokenList;
  }

  function getERC20TokenListLength() public view returns(uint) {
    return ERC20TokenList.length;
  }

  /*********************** token value *********************************/

  function getERC20TokenDecimalsInUSD(IERC20 _address) public view returns(uint256){
    ERC20Info memory info = getTokenInfo(_address);
    if (address(info.chainlinkUSD) != address(0)){
      return (info.chainlinkUSD.decimals());
    }
    return info.decimalsInUSD;
  }

  function getERC20TokenValueInUSD(IERC20 _address) public view returns(int256){
    ERC20Info memory info = getTokenInfo(_address);
    if (address(info.chainlinkUSD) != address(0)){
      (
            /*uint80 roundID*/,
            int256 price,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = info.chainlinkUSD.latestRoundData();
      return (price);
    }
    return info.valueInUSD;
  }

  /*************** token admin ***********/

  function _addERC20Token(
    IERC20 _address,
    string memory _symbol,
    string memory _name,
    uint8 _decimals
  ) private returns(ERC20Info memory){
    ERC20Info memory info;
    info.token = _address;
    info.symbol = _symbol;
    info.name = _name;
    info.decimals = _decimals;
    if (address(_address) != address(0)){
      if (ERC20TokenList.length > 0){
        uint i = TokenToERC20TokenList[_address];
        require(address(ERC20TokenList[i].token) != address(_address), "Address already present");
      }
      TokenToERC20TokenList[_address] = ERC20TokenList.length;
      ERC20TokenList.push(info);
    } else {
      mainToken = info;
    }
    return info;
  }




  /** 0x0000000000000000000000000000000000000000 for ETH
  */
  function addERC20Token(
    IERC20 _address,
    string memory _symbol,
    string memory _name,
    uint8 _decimals)
    public roleManageToken() {
    _addERC20Token(_address, _symbol, _name, _decimals);
  }

  function addERC20TokenWithMeta(
    IERC20Metadata _address
  ) public roleManageToken {
    _addERC20Token(_address, _address.symbol(), _address.name(), _address.decimals());
  }

  function removeERC20Token(
    IERC20 _address
  ) public roleManageToken {
    uint256 i = getTokenInfoId(_address);
    ERC20TokenList[i] = ERC20TokenList[ERC20TokenList.length - 1];
    TokenToERC20TokenList[ERC20TokenList[i].token] = i;
    TokenToERC20TokenList[_address] = 0;
    ERC20TokenList.pop();
  }

  /******************* chainlink ******************/


  function setChainlinkUSDNode(
    IERC20 _address,
    bytes32 _chainlinkUSDNode
  ) public roleManageToken {
    ERC20Info storage info;
    if (address(_address) != address(0)){
      info = ERC20TokenList[getTokenInfoId(_address)];
    } else {
      info = mainToken;
    }
    info.chainlinkUSDNode = _chainlinkUSDNode;
  }

  function updateChainlinkUSD(
    IERC20 _address
  ) public roleManageToken {
    ERC20Info storage info;
    if (address(_address) != address(0)){
      info = ERC20TokenList[getTokenInfoId(_address)];
    } else {
      info = mainToken;
    }
    require(info.chainlinkUSDNode != "", "Chainlink node is empty");
    require(address(ewallet) != address(0), "EWallet is not set");
    info.chainlinkUSD = AggregatorV3Interface(IEWalletENS(address(ewallet.getModule("ENS"))).resolveENS(info.chainlinkUSDNode));
  }

  /********************** Role *****************************/

  struct EWalletRole {
    bool manageToken;
  }

  mapping(uint16 => EWalletRole) private roleList;

  modifier roleManageToken {
      uint16 memberId = ewallet.getMemberId(msg.sender);
      require(roleList[memberId].manageToken, "not token manager");
      _;
  }

  modifier roleManageRole {
      ewallet.checkManageRole(msg.sender);
      _;
  }

  /******************** Role Admin *************************/

  function setRole(
      uint16 _memberId,
      bool _manageToken
  ) public roleManageRole {
      _setRole(_memberId, _manageToken);
  }

  function _setRole(
      uint16 _memberId,
      bool _manageToken
  ) private {
      roleList[_memberId].manageToken = _manageToken;
  }

}
