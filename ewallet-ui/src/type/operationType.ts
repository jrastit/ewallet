import { ethers } from 'ethers'
import { BalanceType } from './balanceType'
import { balanceToString, balanceFromString } from './balanceType'


type OperationType = {
  blockNumber: ethers.BigNumber,
  memberId: number,
  message: string,
  category: string,
  balance: Array<BalanceType>,
  date: Date,
  temporary?: boolean,
}

const operationToString = (operation: OperationType | undefined) => {
  if (operation) return {
    blockNumber: operation.blockNumber.toString(),
    memberId: operation.memberId,
    message: operation.message,
    category: operation.category,
    balance: operation.balance.map(balanceToString),
    date: operation.date.toString(),
    temporary: operation.temporary,
  }
}

const operationFromString = (operation: any) => {
  if (operation) return {
    blockNumber: ethers.BigNumber.from(operation.blockNumber),
    memberId: operation.memberId,
    message: operation.message,
    category: operation.category,
    balance: operation.balance.map(balanceFromString),
    date: Date.parse(operation.date),
    temporary: operation.temporary,
  }
}

export type { OperationType }
export { operationToString, operationFromString }
