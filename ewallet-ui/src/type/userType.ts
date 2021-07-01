import { BalanceType } from './balanceType'
import { balanceToString, balanceFromString } from './balanceType'
import { DeviceType } from './deviceType'


type UserType = {
  userId: number
  userName: string
  balance: Array<BalanceType>
  device: Array<DeviceType>
  disable: boolean
}

const userToString = (user: UserType) => {
  if (user) {
    return {
      userId: user.userId,
      userName: user.userName,
      balance: user.balance.map(balanceToString),
      device: user.device,
      disable: user.disable,
    }
  }
}

const userFromString = (user: any) => {
  if (user) {
    return {
      userId: user.userId,
      userName: user.userName,
      balance: user.balance.map(balanceFromString),
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



const userToJson = (user: UserType) => {
  if (user)
    return JSON.stringify(userToString(user))
}

const userFromJson = (user: string | undefined) => {
  if (user)
    return userFromString(JSON.parse(user))
}

export type { UserType }
export {
  userToString, userFromString,
  userListToJson, userListFromJson,
  userToJson, userFromJson,
}
