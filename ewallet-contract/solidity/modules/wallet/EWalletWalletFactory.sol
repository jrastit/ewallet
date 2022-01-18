// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import { EWalletWallet } from "./EWalletWallet.sol";
import { IEWallet } from "../../ewallet/IEWallet.sol";

/*
 * A contract to instanciate ewallet
 */
contract  EWalletWalletFactory {

    function newEWalletWallet(
      IEWallet _ewallet
    ) public returns (EWalletWallet){
            return new EWalletWallet(_ewallet);
    }

}
