// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

/**
 * @title EWalletDomain
 * @dev Non custodial entity wallet
 */
import "./IEWalletDomainGeneric.sol";

contract EWalletDomainGeneric is IEWalletDomainGeneric {

  Domain[] private domainList;

  mapping(string => uint16) private domainByName;
  mapping(bytes32 => string) private domainNameByRequestId;

  constructor() {
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

  function requestDomain(string memory _domainName, bytes32 _requestId) public
  {
    domainNameByRequestId[_requestId]=_domainName;
  }

  /**
   * Receive the response in the form of uint256
   */

  function fulfill(bytes32 _requestId, address _ownerAddress) virtual public
  {
    //require(_ownerAddress != address(0));
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
}
