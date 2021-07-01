import { useState, useEffect } from 'react'
import SelectWidget from '../selectWidget'
import { Entity } from '../../class/Entity'

const TokenSelectWidget = (props: {
  name: string,
  value: string,
  onChange: (event: any) => void,
  entity: Entity,
}) => {

  const [option, setOption] = useState<Array<{
    name: string,
    value: string,
  }>>([])

  useEffect(() => {
    if (option.length === 0) {
      props.entity.getTokenList().then(tokenList => {
        const _option = tokenList.map(token => {
          return {
            value: token.name,
            name: token.symbol,
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

export default TokenSelectWidget
