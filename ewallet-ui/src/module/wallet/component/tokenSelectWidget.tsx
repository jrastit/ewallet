import { useState } from 'react'
import SelectWidget from '../../../component/selectWidget'
import { EWalletWallet } from '../contract/EWalletWallet'

const TokenSelectWidget = (props: {
  name: string,
  value: string,
  onChange: (event: any) => void,
  wallet: EWalletWallet,
}) => {

  const [option, setOption] = useState<Array<{
    name: string,
    value: string,
  }>>([])
  const [version, setVersion] = useState(-1)

  if (props.wallet.version > version){
    setVersion(props.wallet.version)
    props.wallet.getTokenList && props.wallet.getTokenList().then(tokenList => {
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
