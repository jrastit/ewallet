// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import { EWalletDomainGeneric } from "./EWalletDomainGeneric.sol";
import { IEWalletDomain } from "./IEWalletDomain.sol";

/**
 * @title EWalletDomain
 * @dev Non custodial entity wallet
 */
contract EWalletDomainChainlink is ChainlinkClient, IEWalletDomain, EWalletDomainGeneric {
  using Chainlink for Chainlink.Request;

  address public oracle;
  bytes32 public jobId;
  uint256 public fee;

  constructor(address _linkAddress, address _oracle, string memory _jobId)  EWalletDomainGeneric() {
    setChainlinkToken(_linkAddress);
    oracle = _oracle;
    jobId = stringToBytes32(_jobId);
    fee = 0.01 * 10 ** 18; // (Varies by network and job)
  }

  /**
     * Create a Chainlink request to retrieve API response, find the target
     * data.
     */
  function requestDomainContract(string memory _domainName) public returns (bytes32 requestId)
  {
    Chainlink.Request memory request = buildChainlinkRequest(jobId, address(this), this.fulfill.selector);
    // Set the URL to perform the GET request on
    request.add("domain", _domainName);
    // Sends the request
    requestId = sendChainlinkRequestTo(oracle, request, fee);
    super.requestDomain(_domainName, requestId);
    return requestId;
  }


  /**
   * Receive the response in the form of uint256
   */

  function fulfill(bytes32 _requestId, address _ownerAddress) public virtual override(IEWalletDomain, EWalletDomainGeneric) recordChainlinkFulfillment(_requestId)
  {
    super.fulfill(_requestId, _ownerAddress);
  }


  function stringToBytes32(string memory source) private pure returns (bytes32 result) {
    bytes memory tempEmptyStringTest = bytes(source);
    if (tempEmptyStringTest.length == 0) {
      return 0x0;
    }
    assembly { // solhint-disable-line no-inline-assembly
      result := mload(add(source, 32))
    }
  }
}
