import { useState, useEffect } from 'react'
import { BalanceType } from '../../type/tokenType'
import { ethers } from 'ethers'
import { EntityType } from '../../type/entityType'
import { entityGetToken } from '../../chain/entityChain'

const DisplayBalanceWidget = (props:{
  balance : Array<BalanceType>,
  entity : EntityType,
}) => {

  const [balanceList, setBalanceList] = useState<Array<{
    balance : string,
    symbol : string,
  }>>([])

  useEffect(() => {

    const updateBalance = async (balance : Array<BalanceType>) => {
      return Promise.all(props.balance.map(async(balance) => {
        const token = await entityGetToken(props.entity, balance.token)
        if (token){
          return {
            balance : ethers.utils.formatUnits(
              balance.balance,
              token.decimal
            ),
            symbol : token.symbol
          }
        }
        return {
          balance : "error",
          symbol : "?"
        }
      }))
    }

    updateBalance(props.balance).then(_balanceList => {
      setBalanceList(_balanceList)
    })
  }, [props.balance, props.entity])

  const displayBalance = (balance : {balance : string, symbol : string}) => {
    return (<div key={balance.symbol}>{balance.balance}&nbsp;{balance.symbol}</div>)
  }

  return (
    <div>{balanceList.map(displayBalance)}</div>
  )

}

export default DisplayBalanceWidget
