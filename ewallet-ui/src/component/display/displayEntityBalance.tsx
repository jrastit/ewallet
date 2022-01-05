
import { useState } from 'react'
import { balanceListToJson, balanceListFromJson } from '../../type/balanceType'
import DisplayBalanceWidget from '../util/displayBalanceWidget'
import { Entity } from '../../class/Entity'
import { BalanceType } from '../../type/balanceType'


const DisplayEntityBalance = (props: {
  entity: Entity
  version: number
}) => {
  const [balance, setBalance] = useState<Array<BalanceType> | undefined>()
  const [error, setError] = useState<string | undefined>()
  const [version, setVersion] = useState(-1)

  const updateBalance = (entity: Entity) => {
    entity.getBalance && entity.getBalance().then((_balance) => {
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

  if (props.entity.version > version){
    setVersion(props.entity.version)
    updateBalance(props.entity);
  }

  return (<div>
    {error ? error : balance ?
      <DisplayBalanceWidget balance={balance} entity={props.entity} /> :
      '--'
    }
  </div>)
}

export default DisplayEntityBalance
