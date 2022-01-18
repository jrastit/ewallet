// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import { IEWalletMember } from "../modules/member/IEWalletMember.sol";
import { IEWalletModule } from "../modules/IEWalletModule.sol";

interface IEWallet is IEWalletMember {
  function getModule(string memory _name) external view returns (IEWalletModule);

}
