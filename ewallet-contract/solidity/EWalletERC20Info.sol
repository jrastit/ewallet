// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import { AggregatorV3Interface } from  "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

// ENS Registry Contract
interface ENS {
  function resolver(bytes32 node) external view returns (Resolver);
}

// Chainlink Resolver
interface Resolver {
    function addr(bytes32 node) external view returns (address);
}

contract EWalletERC20Info {

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

  address private owner;

  modifier isOwner {
      require(msg.sender == address(owner));
      _;
  }

  ERC20Info MainToken;
  ERC20Info[] ERC20TokenList;

  uint16 ERC20TokenListId;

  mapping(IERC20 => uint) private TokenToERC20TokenList;

  ENS ens;

  // ENS registry address: 0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e
  constructor(address ensAddress) {
    ens = ENS(ensAddress);
    owner = msg.sender;
  }

  /*************** utils ****************/

  function getTokenInfo(IERC20 _address) public view returns (ERC20Info memory) {
    ERC20Info memory info;
    if (address(_address) != address(0)){
      info = ERC20TokenList[getTokenInfoId(_address)];
    } else {
      info = MainToken;
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

  function getERC20TokenList() public view returns(ERC20Info[] memory) {
    return ERC20TokenList;
  }

  function getERC20TokenListLength() public view returns(uint) {
    return ERC20TokenList.length;
  }


  /*************** ENS ***************/

  // Use ID Hash instead of readable name
  // ETH / USD hash: 0xf599f4cd075a34b92169cf57271da65a7a936c35e3f31e854447fbb3e7eb736d
  function resolveENS(bytes32 node) public view returns(address) {
      Resolver resolver = ens.resolver(node);
      return resolver.addr(node);
  }

  /*************** token ***********/

  function _addERC20Token(IERC20 _address, string memory _symbol, string memory _name, uint8 _decimals) private returns(ERC20Info memory){
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
      MainToken = info;
    }
    return info;
  }

  /** 0x0000000000000000000000000000000000000000 for ETH
  */
  function addERC20Token(IERC20 _address, string memory _symbol, string memory _name, uint8 _decimals) public isOwner {
    _addERC20Token(_address, _symbol, _name, _decimals);
  }

  function addERC20TokenWithMeta(IERC20Metadata _address) public isOwner {
    _addERC20Token(_address, _address.symbol(), _address.name(), _address.decimals());
  }

  function removeERC20Token(IERC20 _address) public isOwner {
    uint256 i = getTokenInfoId(_address);
    ERC20TokenList[i] = ERC20TokenList[ERC20TokenList.length - 1];
    TokenToERC20TokenList[ERC20TokenList[i].token] = i;
    TokenToERC20TokenList[_address] = 0;
    ERC20TokenList.pop();
  }

  /******************* chainlink ******************/

  function setChainlinkUSDNode(IERC20 _address, bytes32 _chainlinkUSDNode) public isOwner {
    ERC20Info storage info;
    if (address(_address) != address(0)){
      info = ERC20TokenList[getTokenInfoId(_address)];
    } else {
      info = MainToken;
    }
    info.chainlinkUSDNode = _chainlinkUSDNode;
  }

  function updateChainlinkUSD(IERC20 _address) public isOwner {
    ERC20Info storage info;
    if (address(_address) != address(0)){
      info = ERC20TokenList[getTokenInfoId(_address)];
    } else {
      info = MainToken;
    }
    require(info.chainlinkUSDNode != "", "Chainlink node is empty");
    info.chainlinkUSD = AggregatorV3Interface(resolveENS(info.chainlinkUSDNode));
  }

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



}
