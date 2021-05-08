import { ethers } from 'ethers'

type UserDeviceType = {
  name: string
  address: string
  disable: boolean
}

type UserType = {
  userId: number
  firstName: string
  lastName: string | undefined
  balance: ethers.BigNumber,
  device: Array<UserDeviceType>
  disable: boolean
}

const userToString = (user: UserType) => {
  if (user) {
    return {
      userId: user.userId,
      firstName: user.firstName,
      lastName: user.lastName,
      balance: user.balance.toString(),
      device: user.device,
      disable: user.disable,
    }
  }
}

const userFromString = (user: any) => {
  if (user) {
    return {
      userId: user.userId,
      firstName: user.firstName,
      lastName: user.lastName,
      balance: ethers.BigNumber.from(user.balance),
      device: user.device,
      disable: user.disable,
    }
  }
}

const userListToJson = (userList: Array<UserType>) => {
  if (userList)
    return JSON.stringify(userList.map(userToString))
}

const userListFromJson = (userList: string | undefined) => {
  if (userList)
    return JSON.parse(userList).map(userFromString)
}

const deviceListToJson = (deviceList: Array<UserDeviceType>) => {
  if (deviceList)
    return JSON.stringify(deviceList)
}

const deviceListFromJson = (deviceList: string | undefined) => {
  if (deviceList)
    return JSON.parse(deviceList)
}

const userToJson = (user: UserType) => {
  if (user)
    return JSON.stringify(userToString(user))
}

const userFromJson = (user: string | undefined) => {
  if (user)
    return userFromString(JSON.parse(user))
}

export type { UserDeviceType, UserType }
export {
  userToString, userFromString,
  userListToJson, userListFromJson,
  deviceListToJson, deviceListFromJson,
  userToJson, userFromJson,
}
