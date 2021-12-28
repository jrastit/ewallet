import { useState, useEffect } from 'react'
import SelectWidget from '../selectWidget'
import { getWalletList } from '../../util/networkInfo'
import { walletNiceName } from '../../type/walletType'

const WalletSelectWidget = (props: {
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
      getWalletList().then(walletList => {
        if (walletList){
          const _option = walletList.map(wallet => {
            return {
              value: wallet.address,
              name: walletNiceName(wallet),
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
        }
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

export default WalletSelectWidget
