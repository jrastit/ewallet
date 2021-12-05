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

  struct Domain {
    string domainName;
    address ownerAddress;
  }

  Domain[] private domainList;

  mapping(string => uint16) private domainByName;
  mapping(bytes32 => string) private domainNameByRequestId;

  address private oracle;
  bytes32 private jobId;
  uint256 private fee;

  constructor(address _linkAddress, address _oracle, bytes32 _jobId) {
    setChainlinkToken(_linkAddress);
    oracle = _oracle;
    jobId = _jobId;
    fee = 0.1 * 10 ** 18; // (Varies by network and job)
  }

    function getDomainList() public view returns (Domain[] memory)
    {
      return domainList;
    }

    function getDomainAddress(string memory _domainName) public view returns (address domainAddress)
    {
      uint16 domainId = domainByName[_domainName];
      if (domainId == 0 && (keccak256(abi.encodePacked(domainList[domainId].domainName)) != keccak256(abi.encodePacked(_domainName)))){
        return address(0);
      }
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
        request.add("get", string(abi.encodePacked("https://nft4.domains:3001/api/dns/owner?domain=", _domainName)));

        request.add("path", "domain.txt.nft4domains.owner");

        requestId = sendChainlinkRequestTo(oracle, request, fee);

        domainNameByRequestId[requestId]=_domainName;

        // Sends the request
        return requestId;
    }

    /**
     * Receive the response in the form of uint256
     */
    function fulfill(bytes32 _requestId, uint256 _ownerAddress) public recordChainlinkFulfillment(_requestId)
    {
        require(_ownerAddress > 0);
        string memory domainName = domainNameByRequestId[_requestId];
        uint16 domainId = domainByName[domainName];
        if (domainId == 0 && (keccak256(abi.encodePacked(domainList[domainId].domainName)) != keccak256(abi.encodePacked(domainName)))){
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
}
