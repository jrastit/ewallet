// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import { EWalletERC20Info } from "./EWalletERC20Info.sol";
import { IEWallet } from "../../ewallet/IEWallet.sol";

/*
 * A contract to instanciate EWalletMember
 */
contract EWalletERC20InfoFactory {

    function newEWalletERC20Info(
      IEWallet _ewallet
    ) public returns (EWalletERC20Info){
        return new EWalletERC20Info(_ewallet);
    }

}
