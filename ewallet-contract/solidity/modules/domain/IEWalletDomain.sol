// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "./IEWalletDomainGeneric.sol";

interface IEWalletDomain is IEWalletDomainGeneric {

  function requestDomainContract(string memory _domainName) external returns (bytes32 requestId);

  function fulfill(bytes32 _requestId, address _ownerAddress) external;
}
