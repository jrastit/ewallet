import { useState, useEffect } from 'react'
import { BalanceType } from '../../type/balanceType'
import { ethers } from 'ethers'
import { Entity } from '../../class/Entity'

const DisplayBalanceWidget = (props: {
  balance: Array<BalanceType>,
  entity: Entity,
}) => {

  const [balanceList, setBalanceList] = useState<Array<{
    balance: string,
    symbol: string,
  }>>([])

  useEffect(() => {

    const updateBalance = async (balance: Array<BalanceType>) => {
      return Promise.all(balance.map(async (balance) => {
        const token = await props.entity.getToken(balance.token)
        if (token) {
          return {
            balance: ethers.utils.formatUnits(
              balance.balance,
              token.decimal
            ),
            symbol: token.symbol
          }
        }
        return {
          balance: "error",
          symbol: "?"
        }
      }))
    }

    updateBalance(props.balance).then(_balanceList => {
      setBalanceList(_balanceList)
    })
  }, [props.balance, props.entity])

  const displayBalance = (balance: { balance: string, symbol: string }) => {
    return (<div key={balance.symbol}>{balance.balance}&nbsp;{balance.symbol}</div>)
  }

  return (
    <div>{balanceList.map(displayBalance)}</div>
  )

}

export default DisplayBalanceWidget
