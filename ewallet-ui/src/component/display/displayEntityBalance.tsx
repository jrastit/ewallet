
import React, { useState, useEffect } from 'react'
import { entityGetBalance } from '../../chain/entityChain'
import { balanceListToJson, balanceListFromJson } from '../../type/tokenType'
import DisplayBalanceWidget from '../util/displayBalanceWidget'
import { EntityType } from '../../type/entityType'
import { BalanceType } from '../../type/tokenType'


const DisplayEntityBalance = (props: { entity: EntityType }) => {
  const [balance, setBalance] = useState<Array<BalanceType> | undefined>()
  const [error, setError] = useState<string | undefined>()

  const updateBalance = (entity: EntityType) => {
    entityGetBalance(entity).then((_balance) => {
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
      <DisplayBalanceWidget balance={balance} entity={props.entity}/> :
      '--'
    }
  </div>)
}

export default DisplayEntityBalance
