// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import { EWalletENS } from "./EWalletENS.sol";
import { IEWallet } from "../../ewallet/IEWallet.sol";

/*
 * A contract to instanciate EWalletMember
 */
contract EWalletENSFactory {

    address public ensAddress;

    // ENS registry address: 0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e
    constructor(address ensAddress_) {
      ensAddress = ensAddress_;
    }

    function newEWalletENS(
      IEWallet _ewallet
    ) public returns (EWalletENS){
        return new EWalletENS(_ewallet, ensAddress);
    }

}
