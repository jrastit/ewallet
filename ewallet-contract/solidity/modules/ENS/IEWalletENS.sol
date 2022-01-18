// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

interface IEWalletENS {

  // Use ID Hash instead of readable name
  // ETH / USD hash: 0xf599f4cd075a34b92169cf57271da65a7a936c35e3f31e854447fbb3e7eb736d
  function resolveENS(bytes32 node) external view returns(address);

}
