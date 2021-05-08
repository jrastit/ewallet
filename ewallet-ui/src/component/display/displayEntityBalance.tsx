
import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { entityGetBalance } from '../../chain/entityChain'
import { EntityType } from '../../type/entityType'


const DisplayEntityBalance = (props: { entity: EntityType }) => {
  const [balance, setBalance] = useState<ethers.BigNumber | undefined>()
  const [error, setError] = useState<string | undefined>()

  const updateBalance = (entity: EntityType) => {
    entityGetBalance(entity).then((_balance) => {
      if (_balance !== balance)
        setBalance(_balance)
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

  return (<span>
    {error ? error : balance ? ethers.utils.formatEther(balance) + ' ETH' : '--'}
  </span>)
}

export default DisplayEntityBalance
