// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import { IEWalletModuleAdmin } from "../modules/IEWalletModuleAdmin.sol";

interface IEWalletRegistry {
  function getModuleAdmin() external view returns(IEWalletModuleAdmin);
}
