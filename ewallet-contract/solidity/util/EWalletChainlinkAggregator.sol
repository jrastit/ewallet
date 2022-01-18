// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import { AggregatorV3Interface } from  "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract EWalletChainlinkAggregator is AggregatorV3Interface {
  struct Round {
    int256 answer;
    uint256 startedAt;
    uint256 updatedAt;
    uint80 answeredInRound;
  }

  mapping(uint80 => Round) private roundListFromId;

  uint80 private latestRound;

  uint8 private myDecimals;
  string private myDescription;
  uint256 private myVersion;
  address private owner;

  modifier isOwner {
      require(msg.sender == address(owner));
      _;
  }

  constructor(uint8 _decimals, string memory _description, uint256 _version){
    myDecimals = _decimals;
    myDescription = _description;
    myVersion = _version;
    owner = msg.sender;
  }

  function decimals() public override view returns (uint8) {
    return myDecimals;
  }

  function description() public override view returns (string memory) {
    return myDescription;
  }

  function version() public override view returns (uint256) {
    return myVersion;
  }


  function addNewRoundData (
    int256 answer
  ) public isOwner {
    latestRound = latestRound + 1;
    roundListFromId[latestRound].answer = answer;
    roundListFromId[latestRound].startedAt = block.timestamp;
    roundListFromId[latestRound].updatedAt = block.timestamp;
    roundListFromId[latestRound].answeredInRound = 1;
  }

  // getRoundData and latestRoundData should both raise "No data present"
  // if they do not have data to report, instead of returning unset values
  // which could be misinterpreted as actual reported values.
  function getRoundData(uint80 _roundId)
    public
    view
    override
    returns (
      uint80 roundId,
      int256 answer,
      uint256 startedAt,
      uint256 updatedAt,
      uint80 answeredInRound
    ) {
    Round memory round = roundListFromId[_roundId];
    require(round.startedAt != 0, "No data present");
    return (_roundId, round.answer, round.startedAt, round.updatedAt, round.answeredInRound);
  }

  function latestRoundData()
    public
    view
    override
    returns (
      uint80 roundId,
      int256 answer,
      uint256 startedAt,
      uint256 updatedAt,
      uint80 answeredInRound
    ){
    return getRoundData(latestRound);
  }

}
