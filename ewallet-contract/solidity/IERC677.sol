// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

interface IERC677 is IERC20, IERC20Metadata {
  function transferAndCall(
    address to,
    uint256 value,
    bytes memory data
  ) external returns (bool ok);

  event TransferWithData(address indexed from, address indexed to, uint256 value, bytes data);
}
