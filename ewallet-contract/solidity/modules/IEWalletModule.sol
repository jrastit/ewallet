// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

interface IEWalletModule {

    function moduleName() external view returns (string memory);

    function moduleVersion() external view  returns (string memory);

    function moduleContract() external view  returns (string memory);

}
