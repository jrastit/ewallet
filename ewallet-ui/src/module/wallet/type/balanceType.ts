import { ethers } from 'ethers'

type BalanceType = {
  token: string,
  balance: ethers.BigNumber,
}

const balanceToString = (balance: BalanceType) => {
  if (balance) return ({
    token: balance.token,
    balance: balance.balance.toString(),
  })
}

const balanceFromString = (balance: any) => {
  if (balance) return ({
    token: balance.token,
    balance: ethers.BigNumber.from(balance.balance),
  })
}

const balanceListToJson = (balance: Array<BalanceType>) => {
  if (balance) return JSON.stringify(balance.map(balanceToString))
}

const balanceListFromJson = (balance: any) => {
  if (balance) return JSON.parse(balance).map(balanceFromString)
}

const balanceAdd = (balance: Array<BalanceType>, balance2: Array<BalanceType>) => {
  for (let i = 0; i < balance2.length; i++) {
    let found = false
    balance.filter(item => item.token === balance2[i].token).map(item => {
      if (!found) {
        found = true
        item.balance = item.balance.add(balance2[i].balance)
      }
      return null
    })
    if (!found) {
      balance.push({
        token: balance2[i].token,
        balance: balance2[i].balance,
      })
    }
  }
}

const balanceSet = (balance: Array<BalanceType>, balance2: Array<BalanceType>) => {
  for (let i = 0; i < balance2.length; i++) {
    let found = false
    balance.filter(item => item.token === balance2[i].token).map(item => {
      if (!found) {
        found = true
        item.balance = balance2[i].balance
      }
      return null
    })
    if (!found) {
      balance.push({
        token: balance2[i].token,
        balance: balance2[i].balance,
      })
    }
  }
}

const balanceSub = (balance: Array<BalanceType>, balance2: Array<BalanceType>) => {
  for (let i = 0; i < balance2.length; i++) {
    let found = false
    balance.filter(item => item.token === balance2[i].token).map(item => {
      if (!found) {
        found = true
        item.balance = item.balance.sub(balance2[i].balance)
      }
      return null
    })
    if (!found) {
      balance.push({
        token: balance2[i].token,
        balance: balance2[i].balance,
      })
    }
  }
}

const balanceGte = (balance: Array<BalanceType>, balance2: Array<BalanceType>) => {
  for (let i = 0; i < balance2.length; i++) {
    let found = false
    balance.filter(
      item => item.token === balance2[i].token &&
        item.balance.gte(balance2[i].balance)
    ).forEach(() => {
      if (!found) {
        found = true
      }
      return null
    })
    if (!found) {
      return false
    }
  }
  return true
}

export type {
  BalanceType,
}

export {
  balanceListToJson, balanceListFromJson,
  balanceToString, balanceFromString,
  balanceAdd,
  balanceSub,
  balanceSet,
  balanceGte,
}
