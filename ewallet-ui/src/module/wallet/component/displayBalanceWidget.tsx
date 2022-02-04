import { useState, useEffect } from 'react'
import { BalanceType } from '../type/balanceType'
import { ethers } from 'ethers'
import { EWalletWallet } from '../contract/EWalletWallet'

const DisplayBalanceWidget = (props: {
  balance: Array<BalanceType>,
  wallet: EWalletWallet,
}) => {

  const [balanceList, setBalanceList] = useState<Array<{
    balance: string,
    symbol: string,
  }>>([])

  useEffect(() => {

    const updateBalance = async (balance: Array<BalanceType>) => {
      return Promise.all(balance.map(async (balance) => {
        const token = props.wallet.getToken && await props.wallet.getToken(balance.token)
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
  }, [props.balance, props.wallet])

  const displayBalance = (balance: { balance: string, symbol: string }) => {
    return (<div key={balance.symbol}>{balance.balance}&nbsp;{balance.symbol}</div>)
  }

  return (
    <div>{balanceList.map(displayBalance)}</div>
  )

}

export default DisplayBalanceWidget
