// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import { IEWallet } from '../ewallet/IEWallet.sol';

interface IEWalletModuleAdmin {
    function getOwner() external view returns(IEWallet);
}
