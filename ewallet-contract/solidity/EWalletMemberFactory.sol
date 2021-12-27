// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import { EWalletMember } from "./EWalletMember.sol";

/*
 * A contract to instanciate EWalletMember
 */
contract EWalletMemberFactory {

    function newEWalletMember(
        string memory _memberName,
        string memory _deviceName,
        address _owner
    ) public returns (EWalletMember){
        return new EWalletMember(_memberName, _deviceName, _owner);
    }

}
