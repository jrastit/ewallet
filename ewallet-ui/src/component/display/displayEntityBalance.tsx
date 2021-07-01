
import { useState, useEffect } from 'react'
import { balanceListToJson, balanceListFromJson } from '../../type/balanceType'
import DisplayBalanceWidget from '../util/displayBalanceWidget'
import { Entity } from '../../class/Entity'
import { BalanceType } from '../../type/balanceType'


const DisplayEntityBalance = (props: { entity: Entity }) => {
  const [balance, setBalance] = useState<Array<BalanceType> | undefined>()
  const [error, setError] = useState<string | undefined>()

  const updateBalance = (entity: Entity) => {
    entity.getBalance().then((_balance) => {
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

  useEffect(() => {
    const timer = setInterval(() => {
      updateBalance(props.entity);
    }, 2000);
    // Clear timeout if the component is unmounted
    return () => clearTimeout(timer);
  });

  return (<div>
    {error ? error : balance ?
      <DisplayBalanceWidget balance={balance} entity={props.entity} /> :
      '--'
    }
  </div>)
}

export default DisplayEntityBalance
