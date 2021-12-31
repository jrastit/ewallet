import { useState, useEffect } from 'react'
import SelectWidget from '../selectWidget'
import { getNetworkList } from '../../util/networkInfo'

const NetworkSelectWidget = (props: {
  walletValue ?: string
  value?: string
  setNetwork: (networkName : string) => void
}) => {

  const setNetwork = (event : {target : {name : string, value : string}}) => {
    const networkName = event.target.value
    if (networkName !== props.value){
      props.setNetwork(networkName);
    }
  }

  const [option, setOption] = useState<Array<{
    name: string
    value: string
  }>>([])

  useEffect(() => {
    if (!props.walletValue && props.value){
      props.setNetwork(props.value)
    }
    if (option.length === 0) {
      getNetworkList().then(networkList => {
        const _option = networkList.map(network => {
          return {
            value: network.name,
            name: network.name,
          }
        })
        if (_option[0] && (!props.value))
          props.setNetwork(_option[0].value)
        setOption(_option)
      })
    }
  })

  return (
    <SelectWidget
      name='networkSelect'
      value={props.value}
      onChange={setNetwork}
      option={option}
    />
  )
}

export default NetworkSelectWidget
