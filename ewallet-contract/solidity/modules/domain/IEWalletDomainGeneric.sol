// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

interface IEWalletDomainGeneric {

  event DomainOwner(string indexed domainName, address indexed owner);

  function getDomainList() external view returns (Domain[] memory);

  function getDomainOwner(string memory _domainName) external view returns (address domainAddress);

  struct Domain {
    string domainName;
    address ownerAddress;
  }

}
