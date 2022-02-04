
import { useState } from 'react'
import DisplayBalanceWidget from './displayBalanceWidget'
import { EWalletWallet } from '../contract/EWalletWallet'
import {
  BalanceType,
  balanceListToJson,
  balanceListFromJson,
} from '../type/balanceType'


const DisplayWalletBalance = (props: {
  wallet: EWalletWallet
  version: number
}) => {
  const [balance, setBalance] = useState<Array<BalanceType> | undefined>()
  const [error, setError] = useState<string | undefined>()
  const [version, setVersion] = useState(-1)

  const updateBalance = (wallet: EWalletWallet) => {
    wallet.getBalance && wallet.getBalance().then((_balance) => {
      const _balanceJson = balanceListToJson(_balance)
      if (!balance || _balanceJson !== balanceListToJson(balance))
        setBalance(balanceListFromJson(_balanceJson))
    }).catch((_error) => {
      if (_error.message !== error) {
        setError(_error.message)
        console.error(_error)
      }
    })
  }

  if (props.wallet.version > version){
    setVersion(props.wallet.version)
    updateBalance(props.wallet);
  }

  return (<div>
    {error ? error : balance ?
      <DisplayBalanceWidget balance={balance} wallet={props.wallet} /> :
      '--'
    }
  </div>)
}

export default DisplayWalletBalance
