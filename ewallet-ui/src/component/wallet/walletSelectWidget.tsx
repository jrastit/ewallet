import { useState, useEffect } from 'react'
import * as ethers from 'ethers'
import Button from 'react-bootstrap/Button';
import SelectWidget from '../selectWidget'
import BoxWidget from '../boxWidget'
import { getWalletList } from '../../util/networkInfo'
import { walletNiceName } from '../../type/walletType'
import WalletAddWidget from './walletAddWidget'
import WalletDelete from './walletDelete'
import BoxWidgetHide from '../boxWidgetHide'
import AddressWidget from '../addressWidget'


const WalletSelectWidget = (props: {
  balance ?: ethers.BigNumber
  password : string,
  walletValue?: string,
  value?: string,
  setWallet: (address : string) => void
  setIsHome : (isHome : number) => void
}) => {

  const [option, setOption] = useState<Array<{
    name: string,
    value: string,
  }>>([])

  useEffect(() => {
    if (!props.walletValue && props.value){
      props.setWallet(props.value)
    }
    getWalletList(props.password).then(walletList => {
      if (walletList){
        const _option = walletList.map(wallet => {
          return {
            value: wallet.address,
            name: walletNiceName(wallet),
          }
        })
        if (_option[0] && !props.value)
          props.setWallet(_option[0].value)
        setOption(_option)
      }
    })
  }, [props])

  const setWallet = (event : {target : {name : string, value : string}}) => {
    const walletAddress = event.target.value
    if (walletAddress !== props.value){
      props.setWallet(walletAddress)
    }
  }

  return (
    <>
    { option.length > 0 &&
      <>
    <BoxWidget  title="Select broswer wallet">
      <SelectWidget
        name='Select widget'
        value={props.value}
        onChange={setWallet}
        option={option}
        />
        <p><br/></p>
        { props.value &&
          <p><AddressWidget address={props.value}/></p>
        }
        { props.balance &&
          <p>Balance : {props.balance ? ethers.utils.formatEther(props.balance) : ""}</p>
        }
        <Button onClick={() => props.setIsHome(0)}>Ok</Button>
      </BoxWidget>
      { props.value &&
        <WalletDelete
          address={props.value}
          password={props.password}
        />
      }

      </>
    }
    <BoxWidgetHide title="Add broswer wallet" hide={option.length > 0}>
      <p>import your broswer wallet with the private key or generate a new one</p>
      <WalletAddWidget
        password={props.password}
        setWallet={props.setWallet}
      />
    </BoxWidgetHide>
    </>
  )
}

export default WalletSelectWidget
