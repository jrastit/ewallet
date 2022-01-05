// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import { EWalletERC20Info } from "./EWalletERC20Info.sol";

/*
 * A contract to instanciate EWalletMember
 */
contract EWalletERC20InfoFactory {

    address public ensAddress;

    // ENS registry address: 0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e
    constructor(address ensAddress_) {
      ensAddress = ensAddress_;
    }

    function newEWalletERC20Info(

    ) public returns (EWalletERC20Info){
        return new EWalletERC20Info(ensAddress);
    }

}
