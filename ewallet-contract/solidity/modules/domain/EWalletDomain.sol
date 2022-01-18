// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import { IEWalletDomain } from "./IEWalletDomain.sol";
import { EWalletDomainGeneric } from "./EWalletDomainGeneric.sol";

/**
 * @title EWalletDomain
 * @dev Non custodial entity wallet
 */
contract EWalletDomain is IEWalletDomain, EWalletDomainGeneric {

  event DomainRequest(bytes32 indexed requestId, string domainName);

  address public oracle;

  uint256 private uRequestId;

  constructor(address _oracle) EWalletDomainGeneric() {
    oracle = _oracle;
    uRequestId = 0;
  }

  function requestDomainContract(string memory _domainName) public returns (bytes32 requestId)
  {
    uRequestId = uRequestId + 1;
    requestId = bytes32(uRequestId);
    super.requestDomain(_domainName, requestId);
    emit DomainRequest(requestId, _domainName);
    // Sends the request
    return requestId;
  }

  /**
   * Receive the response in the form of uint256
   */

  function fulfill(bytes32 _requestId, address _ownerAddress) virtual override(IEWalletDomain, EWalletDomainGeneric) public
  {
    require(msg.sender == oracle);
    super.fulfill(_requestId, _ownerAddress);
  }
}
