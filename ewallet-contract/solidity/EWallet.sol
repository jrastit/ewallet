// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { EWalletMember } from "./EWalletMember.sol";

/**
 * @title EWallet
 * @dev Non custodial entity wallet
 */
contract EWallet {

    EWalletMember public memberContract;

    event Operation(uint16 indexed _memberId, address indexed _from, address indexed _to, address _tokenAddress, uint _value, string _name, string _reason);

    struct SendToApprove {
        uint16 initiator;
        uint16 validator;
        address payable to;
        address tokenAddress;
        uint value;
        string name;
        string reason;
    }

    string public name;

    IERC20[] ERC20TokenList;

    struct Balance {
      address token;
      uint256 balance;
    }

    mapping(uint16 => Balance[]) private balanceList;
    mapping(uint16 => Balance[]) private allowanceList;

    mapping(uint16 => mapping(address => uint16)) private balanceListByMember;
    mapping(uint16 => mapping(address => uint16)) private allowanceListByMember;

    modifier roleManageAllowance {
        EWalletMember.Member memory member = memberContract.getMember(msg.sender);
        require(member.role.manageAllowance);
        _;
    }

    SendToApprove[] private sendToApproveList;

    function _addSendToApprove(
        address payable _to,
        address _tokenAddress,
        uint256 _value,
        string memory _name,
        string memory _reason
    ) private {
        SendToApprove memory sendToApprove;
        sendToApprove.initiator = memberContract.getMemberId(msg.sender);
        sendToApprove.to = payable(_to);
        sendToApprove.tokenAddress = _tokenAddress;
        sendToApprove.value = _value;
        sendToApprove.name = _name;
        sendToApprove.reason = _reason;
        sendToApproveList.push(sendToApprove);
    }

    function _sendETH(
        address payable _to,
        uint256 _amount,
        string memory _name,
        string memory _reason
    ) private {
        payable(_to).transfer(_amount);
        emit Operation(memberContract.getMemberId(msg.sender), address(0), _to, address(0), _amount, _name, _reason);
    }

    function _sendERC20Token(
        address payable _to,
        address _tokenAddress,
        uint256 _amount,
        string memory _name,
        string memory _reason
    ) private {
        IERC20 token = IERC20(_tokenAddress);
        token.transfer(_to, _amount);
        emit Operation(memberContract.getMemberId(msg.sender), address(0), _to, _tokenAddress, _amount, _name, _reason);
    }

    function depositETH(

    ) public payable {
        _deposit(address(0), msg.value);
    }

    function depositERC20Token(
        address _tokenAddress,
        uint256 _amount
    ) public {
        IERC20 token = IERC20(_tokenAddress);
        bool transferSucceeded  = token.transferFrom(msg.sender, address(this), _amount);
        require(transferSucceeded, "token transfer error");
        _deposit(_tokenAddress, _amount);
    }

    function _deposit(
      address _tokenAddress,
      uint256 _amount
    ) private {
      uint16 memberId = memberContract.getMemberId(msg.sender);
      uint16 balanceId = balanceListByMember[memberId][_tokenAddress];
      if (balanceId == 0 && (balanceList[memberId].length == 0 || balanceList[memberId][0].token != _tokenAddress)){
        Balance memory balance;
        balance.token = _tokenAddress;
        balance.balance = _amount;
        balanceId = uint16(balanceList[memberId].length);
        balanceList[memberId].push(balance);
        balanceListByMember[memberId][_tokenAddress] = balanceId;
      } else {
        balanceList[memberId][balanceId].balance += _amount;
      }
      emit Operation(memberId, msg.sender, address(0), _tokenAddress, _amount, "", "Deposit fund");
    }

    function withdrawETH(
        uint256 _amount
    ) public {
        _withdraw(address(0), _amount);
    }

    function withdrawERC20Token(
        address _tokenAddress,
        uint256 _amount
    ) public {
        _withdraw(_tokenAddress, _amount);
    }

    function _withdraw(
      address _tokenAddress,
      uint256 _amount
    ) private {
      uint16 memberId = memberContract.getMemberId(msg.sender);
      uint16 balanceId = balanceListByMember[memberId][_tokenAddress];
      require(balanceId > 0 || (balanceList[memberId].length > 0 && balanceList[memberId][0].token == _tokenAddress));
      require(balanceList[memberId][balanceId].balance >= _amount);
      if (_tokenAddress != address(0)){
        _sendERC20Token(payable(msg.sender), _tokenAddress, _amount, "", "Withdraw fund");
      } else {
        _sendETH(payable(msg.sender), _amount, "", "Withdraw fund");
      }
      balanceList[memberId][balanceId].balance -= _amount;
    }

    function receiveETH(
        string memory _name,
        string memory _reason
    ) public payable {
        emit Operation(memberContract.getMemberId(msg.sender), msg.sender, address(0), address(0), msg.value, _name, _reason);
    }

    function receiveERC20Token(
        address _tokenAddress,
        uint256 _amount,
        string memory _name,
        string memory _reason
    ) public {
        IERC20 token = IERC20(_tokenAddress);
        bool transferSucceeded  = token.transferFrom(msg.sender, address(this), _amount);
        require(transferSucceeded, "token transfer error");
        emit Operation(memberContract.getMemberId(msg.sender), msg.sender, address(0), _tokenAddress, _amount, _name, _reason);
    }

    function _withdrawAllowance(
      address payable _to,
      address _tokenAddress,
      uint256 _amount,
      string memory _name,
      string memory _reason
    ) private {
      uint16 memberId = memberContract.getMemberId(msg.sender);
      uint16 balanceId = allowanceListByMember[memberId][_tokenAddress];
      require(balanceId > 0 || (allowanceList[memberId].length > 0 && allowanceList[memberId][0].token == _tokenAddress));
      require(allowanceList[memberId][balanceId].balance >= _amount);
      if (_tokenAddress != address(0)){
        _sendERC20Token(payable(_to), _tokenAddress, _amount, _name, _reason);
      } else {
        _sendETH(payable(_to), _amount, _name, _reason);
      }
      allowanceList[memberId][balanceId].balance -= _amount;
    }

    function sendETH(
        address payable _to,
        uint256 _amount,
        string memory _name,
        string memory _reason
    ) public {
        _withdrawAllowance(_to, address(0), _amount, _name, _reason);
    }

    function sendERC20Token(
        address payable _to,
        address _tokenAddress,
        uint256 _amount,
        string memory _name,
        string memory _reason
    ) public {
        _withdrawAllowance(_to, _tokenAddress, _amount, _name, _reason);
    }

    function sendETHToApprove(
        address payable _to,
        uint256 _amount,
        string memory _name,
        string memory _reason
    ) public {
        _addSendToApprove(_to, address(0), _amount, _name, _reason);
    }

    function sendERC20TokenToApprove(
        address payable _to,
        address _tokenAddress,
        uint256 _amount,
        string memory _name,
        string memory _reason
    ) public {
        _addSendToApprove(_to, _tokenAddress, _amount, _name, _reason);
    }

    function validateSendToApprove(
        uint16 _id
    ) public roleManageAllowance {
        require(sendToApproveList[_id].validator == 0);
        sendToApproveList[_id].validator = memberContract.getMemberId(msg.sender);
        if (sendToApproveList[_id].tokenAddress == address(0)){
            _sendETH(sendToApproveList[_id].to, sendToApproveList[_id].value, sendToApproveList[_id].name, sendToApproveList[_id].reason);
        } else {
            _sendERC20Token(sendToApproveList[_id].to, sendToApproveList[_id].tokenAddress, sendToApproveList[_id].value, sendToApproveList[_id].name, sendToApproveList[_id].reason);
        }
    }

    function allowanceETH (
        uint256 _amount,
        uint16 _memberId
    ) public roleManageAllowance {
        allowanceToken(_amount, address(0), _memberId);
    }

    function allowanceToken (
        uint256 _amount,
        address _tokenAddress,
        uint16 _memberId
    ) public roleManageAllowance {
      uint16 balanceId = allowanceListByMember[_memberId][_tokenAddress];
      if (balanceId == 0 && (allowanceList[_memberId].length == 0 || allowanceList[_memberId][0].token != _tokenAddress)){
        Balance memory balance;
        balance.token = _tokenAddress;
        balance.balance = _amount;
        balanceId = uint16(allowanceList[_memberId].length);
        allowanceList[_memberId].push(balance);
        allowanceListByMember[_memberId][_tokenAddress] = balanceId;
      } else {
        allowanceList[_memberId][balanceId].balance = _amount;
      }
      emit Operation(_memberId, msg.sender, address(0), _tokenAddress, _amount, "", "Deposit fund");
    }

    function getMemberBalance (
      uint16 _memberId
    ) public view returns(Balance[] memory){
      return balanceList[_memberId];
    }

    function getMemberAllowance (
      uint16 _memberId
    ) public view returns(Balance[] memory){
      return allowanceList[_memberId];
    }

    /**
     * @dev Set contract deployer as owner
     */
    constructor(string memory _name, EWalletMember _memberContract) {
        memberContract = _memberContract;
        name = _name;
    }

}
