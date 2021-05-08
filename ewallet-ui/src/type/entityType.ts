import { ethers } from 'ethers'
import { UserType } from './userType'
import { userToString, userFromString } from './userType'

type EntityType = {
  name: string
  contractAddress: string
  networkName: string
  localEntity?: LocalEntityType
}

const entityToString = (entity: EntityType | undefined) => {
  if (entity) return {
    name: entity.name,
    contractAddress: entity.contractAddress,
    networkName: entity.networkName,
    localEntity: localEntityToString(entity.localEntity)
  }
}

const entityFromString = (entity: any) => {
  if (entity) return {
    name: entity.name,
    contractAddress: entity.contractAddress,
    networkName: entity.networkName,
    localEntity: localEntityFromString(entity.localEntity)
  }
}

type EntityOperationType = {
  blockNumber: ethers.BigNumber,
  userId: number,
  message: string,
  category: string,
  amount: ethers.BigNumber,
  date: Date
}

const entityOperationToString = (operation: EntityOperationType | undefined) => {
  if (operation) return {
    blockNumber: operation.blockNumber.toString(),
    userId: operation.userId,
    message: operation.message,
    category: operation.category,
    amount: operation.amount.toString(),
    date: operation.date.toString(),
  }
}

const entityOperationFromString = (operation: any) => {
  if (operation) return {
    blockNumber: ethers.BigNumber.from(operation.blockNumber),
    userId: operation.userId,
    message: operation.message,
    category: operation.category,
    amount: ethers.BigNumber.from(operation.amount),
    date: Date.parse(operation.date),
  }
}

type LocalEntityType = {
  blockNumber: ethers.BigNumber,
  balance: ethers.BigNumber,
  operation: Array<EntityOperationType>,
  userId: number,
  user: Array<UserType>,
}

const localEntityToString = (localEntity: LocalEntityType | undefined) => {
  if (localEntity) return {
    blockNumber: localEntity.blockNumber.toString(),
    balance: localEntity.balance.toString(),
    operation: localEntity.operation.map(entityOperationToString),
    userId: localEntity.userId,
    user: localEntity.user.map(userToString),
  }
}

const localEntityFromString = (localEntity: any) => {
  if (localEntity) return {
    blockNumber: ethers.BigNumber.from(localEntity.blockNumber),
    balance: ethers.BigNumber.from(localEntity.balance),
    operation: localEntity.operation.map(entityOperationFromString),
    userId: localEntity.userId,
    user: localEntity.user.map(userFromString),
  }
}

const entityToJson = (entity: EntityType | undefined) => {
  return JSON.stringify(entityToString(entity))
}

const entityFromJson = (json: string | null) => {
  if (json)
    return entityFromString(JSON.parse(json))
}

const saveEntity = (entity: EntityType | undefined) => {
  localStorage.setItem("entity", entityToJson(entity))
}

const loadEntity = () => {
  return entityFromJson(localStorage.getItem("entity"))
}

const deleteEntity = () => {
  return localStorage.removeItem("entity")
}

export type { EntityType, LocalEntityType, EntityOperationType }
export { entityToJson, entityFromJson, saveEntity, loadEntity, deleteEntity }
