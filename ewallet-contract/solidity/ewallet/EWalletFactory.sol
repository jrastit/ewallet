// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import { EWallet } from "./EWallet.sol";
import { EWalletMember } from "../modules/member/EWalletMember.sol";
import { IEWalletModuleAdmin } from "../modules/IEWalletModuleAdmin.sol";


/*
 * A contract to instanciate ewallet
 */
contract  EWalletFactory {

    function newEWallet(
        string memory _name,
        EWalletMember _member,
        IEWalletModuleAdmin _eWalletModuleAdmin
    ) public returns (EWallet){
        return new EWallet(_name, _member, _eWalletModuleAdmin);
    }

}
