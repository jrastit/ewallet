// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.7.0;
pragma abicoder v2;

import { EWallet } from "./EWallet.sol";

contract EWalletRegistry {

  EWallet[] private entityList;

  function createEntity(EWallet _ewallet) public returns (EWallet){
    entityList.push(_ewallet);
    return _ewallet;
  }

  function getEntityList() public view returns (EWallet[] memory){
      return entityList;
  }
}
