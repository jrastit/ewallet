import { ethers } from 'ethers'
import { EntityType, LocalEntityType } from '../type/entityType'
import { saveEntity } from '../type/entityType'
import { userCreate, userGet } from './userChain'
import { BalanceType } from '../type/tokenType'
import { balanceAdd, balanceSub, balanceGte } from '../type/tokenType'


const entityGetBalance = async (entity: EntityType) => {
  if (entity.localEntity) {
    return entity.localEntity.balance
  } else {
    throw new Error("Only local entity supported")
  }
}

const entityGetToken = async (entity: EntityType, tokenName : string) => {
  if (entity.localEntity) {
    const token = entity.token.filter(token => token.name === tokenName)
    if (token.length === 1){
      return token[0]
    }
    throw new Error("Token not found '" + tokenName + "'")
  } else {
    throw new Error("Only local entity supported")
  }
}

const entityGetTokenList = async (entity: EntityType) => {
  if (entity.localEntity) {
    return entity.token
  } else {
    throw new Error("Only local entity supported")
  }
}

const entityGetOperationList = async (entity: EntityType) => {
  if (entity.localEntity) {
    return entity.localEntity.operation
  } else {
    throw new Error("Only local entity supported")
  }
}

const entityGetUserList = async (entity: EntityType) => {
  if (entity.localEntity) {
    return entity.localEntity.user
  } else {
    throw new Error("Only local entity supported")
  }
}

const localEntityAddLog = (
  localEntity: LocalEntityType,
  userId: number,
  message: string,
  category: string,
  balance: Array<BalanceType>,
) => {
  localEntity.operation.push({
    blockNumber: localEntity.blockNumber,
    userId,
    message,
    category,
    balance,
    date: new Date()
  })
  localEntity.blockNumber = localEntity.blockNumber.add(1)
}

const entityDepositFund = async (
  userId: number,
  entity: EntityType,
  amount: string,
  tokenName: string,
) => {
  const token = await entityGetToken(entity, tokenName)
  const amountBN = ethers.utils.parseUnits(amount, token.decimal)
  if (amountBN.lte(0)){
    throw new Error("Amount should be a positive value")
  }
  if (entity.localEntity) {
    const balance = [{token : token.name, balance : amountBN}]
    balanceAdd(entity.localEntity.balance, balance)
    const user = await userGet(userId, entity)
    balanceAdd(user.balance, balance)
    localEntityAddLog(
      entity.localEntity,
      userId,
      "Deposit of fund",
      "funding",
      balance,
    )
    saveEntity(entity)
  } else {
    throw new Error("Only local entity supported")
  }
}

const entityPay = async (
  userId: number,
  entity: EntityType,
  amount: string,
  tokenName: string,
  name : string,
  reason : string,
  address : string,
) => {
  const token = await entityGetToken(entity, tokenName)
  const amountBN = ethers.utils.parseUnits(amount, token.decimal)
  if (amountBN.lte(0)){
    throw new Error("Amount should be a positive value")
  }
  if (entity.localEntity) {
    const balance = [{token : token.name, balance : amountBN}]
    balanceAdd(entity.localEntity.balance, balance)
    localEntityAddLog(
      entity.localEntity,
      userId,
      name + " : " + reason,
      "credit",
      balance,
    )
    saveEntity(entity)
  } else {
    throw new Error("Only local entity supported")
  }
}

const entityWithdrawFund = async (
  userId: number,
  entity: EntityType,
  amount: string,
  tokenName: string,
) => {
  const token = await entityGetToken(entity, tokenName)
  const amountBN = ethers.utils.parseUnits(amount, token.decimal)
  if (amountBN.lte(0)){
    throw new Error("Amount should be a positive value")
  }
  if (entity.localEntity) {
    const balance = [{token : token.name, balance : amountBN}]
    if (balanceGte(entity.localEntity.balance, balance)) {
      const user = await userGet(userId, entity)
      if (balanceGte(user.balance, balance)) {
        balanceSub(user.balance, balance)
        balanceSub(entity.localEntity.balance, balance)
        localEntityAddLog(
          entity.localEntity,
          userId,
          "Withdraw of fund",
          "funding",
          [{token : token.name, balance : ethers.BigNumber.from(0).sub(amountBN)}],
        )
        saveEntity(entity)
      } else {
        throw new Error("Not enought user fund")
      }
    } else {
      throw new Error("Not enought fund")
    }
  } else {
    throw new Error("Only local entity supported")
  }
}

const entityCreate = async (
  name: string,
  networkName: string,
  address: string,
  firstName: string,
  lastName?: string,
) => {
  const entity = {
    name,
    contractAddress: 'local',
    networkName: networkName,
    token: [{
      name:'eth',
      niceName:'ether',
      symbol:'ETH',
      decimal:18,
      networkName: networkName,
    },{
      name:'dai',
      niceName:'dai',
      symbol:'DAI',
      decimal:18,
      networkName: networkName,
    },{
      name:'tether',
      niceName:'tether',
      symbol:'USDT',
      decimal:6,
      networkName: networkName,
    }],
    localEntity: {
      balance: [],
      blockNumber: ethers.BigNumber.from(0),
      operation: [],
      userId: 0,
      user: [],
    }
  }
  await userCreate(
    entity,
    address,
    firstName,
    lastName,
  )
  localEntityAddLog(
    entity.localEntity,
    0,
    "Create entity",
    "entity",
    []
  )
  saveEntity(entity)
  return entity
}

export {
  entityGetBalance,
  entityGetToken,
  entityGetTokenList,
  entityGetOperationList,
  entityGetUserList,
  entityDepositFund,
  entityWithdrawFund,
  entityCreate,
  entityPay,
}
