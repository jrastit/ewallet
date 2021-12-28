import { useState, useEffect } from 'react'
import SelectWidget from '../selectWidget'
import { getNetworkList } from '../../util/networkInfo'

const NetworkSelectWidget = (props: {
  name: string,
  value: string,
  onChange: (event: any) => void,
}) => {

  const [option, setOption] = useState<Array<{
    name: string,
    value: string,
  }>>([])

  useEffect(() => {
    if (option.length === 0) {
      getNetworkList().then(networkList => {
        const _option = networkList.map(network => {
          return {
            value: network.name,
            name: network.name,
          }
        })
        if (_option[0])
          props.onChange({
            target: {
              name: props.name,
              value: _option[0].value,
            }
          })
        setOption(_option)
      })
    }
  })

  return (
    <SelectWidget
      name={props.name}
      value={props.value}
      onChange={props.onChange}
      option={option}
    />
  )
}

export default NetworkSelectWidget
