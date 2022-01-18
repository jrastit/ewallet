// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import { IEWalletModule } from "../IEWalletModule.sol";

interface IEWalletMember is IEWalletModule {

    function getMemberId(address _address) external view returns(uint16);

    function checkManageRole(address _address) external view;
}
