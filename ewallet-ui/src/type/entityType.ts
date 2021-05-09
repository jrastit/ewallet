import { ethers } from 'ethers'
import { BalanceType, TokenType } from './tokenType'
import { balanceToString, balanceFromString } from './tokenType'
import { UserType } from './userType'
import { userToString, userFromString } from './userType'

type EntityType = {
  name: string
  contractAddress: string
  networkName: string
  token: Array<TokenType>
  localEntity?: LocalEntityType
}

const entityToString = (entity: EntityType | undefined) => {
  if (entity) return {
    name: entity.name,
    contractAddress: entity.contractAddress,
    networkName: entity.networkName,
    token: entity.token,
    localEntity: localEntityToString(entity.localEntity)
  }
}

const entityFromString = (entity: any) => {
  if (entity) return {
    name: entity.name,
    contractAddress: entity.contractAddress,
    networkName: entity.networkName,
    token: entity.token,
    localEntity: localEntityFromString(entity.localEntity)
  }
}

type EntityOperationType = {
  blockNumber: ethers.BigNumber,
  userId: number,
  message: string,
  category: string,
  balance: Array<BalanceType>,
  date: Date
}

const entityOperationToString = (operation: EntityOperationType | undefined) => {
  if (operation) return {
    blockNumber: operation.blockNumber.toString(),
    userId: operation.userId,
    message: operation.message,
    category: operation.category,
    balance: operation.balance.map(balanceToString),
    date: operation.date.toString(),
  }
}

const entityOperationFromString = (operation: any) => {
  if (operation) return {
    blockNumber: ethers.BigNumber.from(operation.blockNumber),
    userId: operation.userId,
    message: operation.message,
    category: operation.category,
    balance: operation.balance.map(balanceFromString),
    date: Date.parse(operation.date),
  }
}

type LocalEntityType = {
  blockNumber: ethers.BigNumber,
  balance: Array<BalanceType>,
  operation: Array<EntityOperationType>,
  userId: number,
  user: Array<UserType>,
}

const localEntityToString = (localEntity: LocalEntityType | undefined) => {
  if (localEntity) return {
    blockNumber: localEntity.blockNumber.toString(),
    balance: localEntity.balance.map(balanceToString),
    operation: localEntity.operation.map(entityOperationToString),
    userId: localEntity.userId,
    user: localEntity.user.map(userToString),
  }
}

const localEntityFromString = (localEntity: any) => {
  if (localEntity) return {
    blockNumber: ethers.BigNumber.from(localEntity.blockNumber),
    balance: localEntity.balance.map(balanceFromString),
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
  try{
    return entityFromJson(localStorage.getItem("entity"))
  }catch(error){
    console.error(error)
    deleteEntity()
  }

}

const deleteEntity = () => {
  return localStorage.removeItem("entity")
}

export type { EntityType, LocalEntityType, EntityOperationType }
export { entityToJson, entityFromJson, saveEntity, loadEntity, deleteEntity }
