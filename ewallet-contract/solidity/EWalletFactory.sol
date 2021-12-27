// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import { EWallet } from "./EWallet.sol";
import { EWalletMemberFactory } from "./EWalletMemberFactory.sol";

/*
 * A contract to instanciate ewallet
 */
contract  EWalletFactory {

    EWalletMemberFactory eWalletMemberFactory;

    constructor(EWalletMemberFactory _eWalletMemberFactory) {
        eWalletMemberFactory = _eWalletMemberFactory;
    }

    function newEWallet(
        string memory _name,
        string memory _ownerName,
        string memory _ownerDeviceName,
        address _ownerAddress
    ) public returns (EWallet){
            return new EWallet(_name,
              eWalletMemberFactory.newEWalletMember(
                _ownerName,
                _ownerDeviceName,
                _ownerAddress
                ));
    }

}
