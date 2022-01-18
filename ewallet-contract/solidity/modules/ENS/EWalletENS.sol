// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import { IEWalletModule } from "../IEWalletModule.sol";
import { IEWallet } from "../../ewallet/IEWallet.sol";

// ENS Registry Contract
interface ENS {
  function resolver(bytes32 node) external view returns (Resolver);
}

// Chainlink Resolver
interface Resolver {
    function addr(bytes32 node) external view returns (address);
}

contract EWalletENS is IEWalletModule {

  function moduleName() public pure returns (string memory) {
    return "ENS";
  }

  function moduleVersion() public pure returns (string memory) {
    return "0.0.0";
  }

  function moduleContract() public pure returns (string memory) {
    return "EWalletENS";
  }


  IEWallet private ewallet;

  // ENS registry address: 0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e
  constructor(IEWallet _ewallet, address _ensAddress) {
    ens = ENS(_ensAddress);
    ewallet = _ewallet;
  }

  /*************** ENS ***************/
  ENS ens;

  // Use ID Hash instead of readable name
  // ETH / USD hash: 0xf599f4cd075a34b92169cf57271da65a7a936c35e3f31e854447fbb3e7eb736d
  function resolveENS(bytes32 node) public view returns(address) {
      Resolver resolver = ens.resolver(node);
      return resolver.addr(node);
  }

}
