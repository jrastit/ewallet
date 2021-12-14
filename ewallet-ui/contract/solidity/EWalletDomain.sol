// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.7.0;
pragma abicoder v2;

import "@chainlink/contracts/src/v0.7/ChainlinkClient.sol";

/**
 * @title EWalletDomain
 * @dev Non custodial entity wallet
 */
contract EWalletDomain is ChainlinkClient {
  using Chainlink for Chainlink.Request;

  event DomainOwner(string indexed domainName, address indexed owner)

  struct Domain {
    string domainName;
    address ownerAddress;
  }

  Domain[] private domainList;

  mapping(string => uint16) private domainByName;
  mapping(bytes32 => string) private domainNameByRequestId;

  address public oracle;
  bytes32 public jobId;
  uint256 public fee;

  constructor(address _linkAddress, address _oracle, string memory _jobId) {
    setChainlinkToken(_linkAddress);
    oracle = _oracle;
    jobId = stringToBytes32(_jobId);
    fee = 0.01 * 10 ** 18; // (Varies by network and job)
    Domain memory domainNew;
    domainNew.domainName = "";
    domainNew.ownerAddress = address(0);
    domainList.push(domainNew);
    domainByName[""] = 0;
  }

  function getDomainList() public view returns (Domain[] memory)
  {
    return domainList;
  }

  function getDomainOwner(string memory _domainName) public view returns (address domainAddress)
  {
    uint16 domainId = domainByName[_domainName];
    return domainList[domainId].ownerAddress;
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
    requestId = sendChainlinkRequestTo(oracle, request, fee);
    domainNameByRequestId[requestId]=_domainName;
    // Sends the request
    return requestId;
  }


  /**
   * Receive the response in the form of uint256
   */

  function fulfill(bytes32 _requestId, address _ownerAddress) public recordChainlinkFulfillment(_requestId)
  {
    require(_ownerAddress != address(0));
    string memory domainName = domainNameByRequestId[_requestId];
    bytes memory tempEmptyStringTest = bytes(domainName);
    require(tempEmptyStringTest.length > 0);
    uint16 domainId = domainByName[domainName];
    if (domainId == 0){
      Domain memory domainNew;
      domainNew.domainName = domainName;
      domainNew.ownerAddress = address(_ownerAddress);
      uint16 domainIdNew = uint16(domainList.length);
      domainList.push(domainNew);
      domainByName[domainName] = domainIdNew;
    } else {
      domainList[domainId].ownerAddress=address(_ownerAddress);
    }
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
