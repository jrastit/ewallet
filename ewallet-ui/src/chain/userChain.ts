import { EntityType } from '../type/entityType'
import { saveEntity } from '../type/entityType'
import { ethers } from 'ethers'

type UserIdGet = (
  address: string,
  entity: EntityType,
) => Promise<number>

const userIdGet: UserIdGet = async (
  address: string,
  entity: EntityType,
) => {
  if (entity.localEntity) {
    for (let i = 0; i < entity.localEntity.user.length; i++) {
      for (let j = 0; j < entity.localEntity.user[i].device.length; j++) {
        if (entity.localEntity.user[i].device[j].address === address) {
          if (entity.localEntity.user[i].device[j].disable) {
            throw new Error("This device wallet key is disable")
          }
          const userId: number = entity.localEntity.user[i].userId
          return userId
        }
      }
    }
    throw new Error("Address not found")
  } else {
    throw new Error("Only local entity supported")
  }
}

const userGet = async (
  userId: number,
  entity: EntityType,
) => {
  if (entity.localEntity) {
    for (let i = 0; i < entity.localEntity.user.length; i++) {
      if (entity.localEntity.user[i].userId === userId) {
        return entity.localEntity.user[i]
      }
    }
    throw new Error("User not found")
  } else {
    throw new Error("Only local entity supported")
  }
}

const userDeviceListGet = async (
  userId: number,
  entity: EntityType,
) => {
  if (entity.localEntity) {
    const user = await userGet(userId, entity)
    return user.device
  } else {
    throw new Error("Only local entity supported")
  }
}

const userCreate = async (
  entity: EntityType,
  userWallet: string,
  firstName: string,
  lastName?: string,
) => {
  if (entity.localEntity) {
    if (entity.localEntity.user.filter(
      user => user.firstName === firstName && user.lastName === lastName
    ).length > 0) {
      throw new Error("User with the same name already present")
    }
    entity.localEntity.user.push({
      userId: entity.localEntity.userId,
      firstName,
      lastName,
      balance: [],
      device: [],
      disable: false,
    })
    deviceAdd(entity.localEntity.userId, entity, 'Wallet', userWallet)
    entity.localEntity.userId = entity.localEntity.userId + 1
    saveEntity(entity)
  } else {
    throw new Error("Only local entity supported")
  }
}

const userDisable = async (
  userId: number,
  entity: EntityType,
  disable: boolean
) => {
  if (entity.localEntity) {
    const user = await userGet(userId, entity)
    user.disable = disable
    saveEntity(entity)
  } else {
    throw new Error("Only local entity supported")
  }
}

const deviceAdd = async (
  userId: number,
  entity: EntityType,
  name: string,
  address: string,
) => {
  address = ethers.utils.getAddress(address)
  if (entity.localEntity) {
    entity.localEntity.user.map(user => {
      if (user.device.filter(
        device => device.address === address
      ).length > 0) {
        throw new Error("Wallet address already registered")
      }
      return user
    })
    const user = await userGet(userId, entity)
    if (user.device.filter(
      device => device.name === name
    ).length > 0) {
      throw new Error("Device name already used")
    }
    user.device.push({
      name,
      address,
      disable: false,
    })
    saveEntity(entity)
  } else {
    throw new Error("Only local entity supported")
  }
}

const deviceDisable = async (
  userId: number,
  entity: EntityType,
  address: string,
  disable: boolean,
) => {
  if (entity.localEntity) {
    const user = await userGet(userId, entity)
    user.device.filter(
      device => device.address === address
    ).map(device => device.disable = disable)
    saveEntity(entity)
  } else {
    throw new Error("Only local entity supported")
  }
}

export {
  userGet,
  userIdGet,
  userDeviceListGet,
  userCreate,
  userDisable,
  deviceAdd,
  deviceDisable,
}
