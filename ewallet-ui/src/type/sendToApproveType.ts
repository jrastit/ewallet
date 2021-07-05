import { ethers } from 'ethers'

type SendToApproveType = {
  id: number,
  initiator: number,
  validator?: number,
  to: string,
  tokenName: string,
  value: ethers.BigNumber,
  name: string,
  reason: string,
}

const sendToApproveToString = (sendToApprove: SendToApproveType | undefined) => {
  if (sendToApprove) return {
    id: sendToApprove.id,
    initiator: sendToApprove.initiator,
    validator: sendToApprove.validator,
    to: sendToApprove.to,
    tokenName: sendToApprove.tokenName,
    value: sendToApprove.value.toString(),
    name: sendToApprove.name,
    reason: sendToApprove.reason,

  }
}

const sendToApproveFromString = (sendToApprove: any) => {
  if (sendToApprove) return {
    id: sendToApprove.id,
    initiator: sendToApprove.initiator,
    validator: sendToApprove.validator,
    to: sendToApprove.to,
    tokenName: sendToApprove.tokenName,
    value: ethers.BigNumber.from(sendToApprove.value),
    name: sendToApprove.name,
    reason: sendToApprove.reason,
  }
}

export type { SendToApproveType }
export { sendToApproveToString, sendToApproveFromString }
