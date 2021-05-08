//import {ethers} from 'ethers'
import { EntityType, LocalEntityType } from '../type/entityType'
import { saveEntity } from '../type/entityType'
import { userCreate, userGet } from './userChain'
import { ethers } from 'ethers'

const entityGetBalance = async (entity: EntityType) => {
  if (entity.localEntity) {
    return entity.localEntity.balance
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
  amount: ethers.BigNumber,
) => {
  localEntity.operation.push({
    blockNumber: localEntity.blockNumber,
    userId,
    message,
    category,
    amount,
    date: new Date()
  })
  localEntity.blockNumber = localEntity.blockNumber.add(1)
}

const entityDepositFund = async (
  userId: number,
  entity: EntityType,
  amount: ethers.BigNumber) => {
  if (entity.localEntity) {
    entity.localEntity.balance = entity.localEntity.balance.add(amount)
    const user = await userGet(userId, entity)
    user.balance = user.balance.add(amount)
    localEntityAddLog(
      entity.localEntity,
      userId,
      "Deposit of fund",
      "funding",
      amount
    )
    saveEntity(entity)
  } else {
    throw new Error("Only local entity supported")
  }
}

const entityWithdrawFund = async (
  userId: number,
  entity: EntityType,
  amount: ethers.BigNumber) => {
  if (entity.localEntity) {
    if (entity.localEntity.balance.gte(amount)) {
      const user = await userGet(userId, entity)
      if (user.balance.gte(amount)) {
        user.balance = user.balance.sub(amount)
        entity.localEntity.balance = entity.localEntity.balance.sub(amount)
        localEntityAddLog(
          entity.localEntity,
          userId,
          "Withdraw of fund",
          "funding",
          ethers.BigNumber.from(0).sub(amount)
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
    localEntity: {
      balance: ethers.BigNumber.from(0),
      blockNumber: ethers.BigNumber.from(0),
      operation: [],
      userId: 0,
      user: []
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
    ethers.BigNumber.from(0)
  )
  saveEntity(entity)
  return entity
}

export {
  entityGetBalance,
  entityGetOperationList,
  entityGetUserList,
  entityDepositFund,
  entityWithdrawFund,
  entityCreate,
}
