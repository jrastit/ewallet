import { WalletType, walletNiceName } from '../../type/walletType'
import NetworkSelectWidget from './networkSelectWidget'
import WalletSelectWidget from './walletSelectWidget'
import AddWalletWidget from './addWalletWidget'
import BoxWidget from '../boxWidget'

const DisplayWalletList = (props: {
    walletName : string | undefined
    walletAddress : string | undefined
    networkName : string | undefined
    updateWalletBroswer : (walletAddress : string) => Promise<void>
    updateNetworkBroswer : (networkName : string | undefined) => void
  }) => {

  const wallet : WalletType | undefined = props.walletAddress ? {
    name : props.walletName,
    address : props.walletAddress,
    pkey : undefined,
  } : undefined

  const setNetwork = (event : {target : {name : string, value : string}}) => {
    const networkName = event.target.value
    if (networkName !== props.networkName){
      props.updateNetworkBroswer(networkName);
    }
  }

  const setWallet = (event : {target : {name : string, value : string}}) => {
    const walletAddress = event.target.value
    if (walletAddress !== props.walletAddress){
      props.updateWalletBroswer(walletAddress);
    }
  }

  return (
    <>
    <BoxWidget  title="Select network">
      <NetworkSelectWidget
        name={props.networkName || ''}
        value={props.networkName || ''}
        onChange={setNetwork}
      />
    </BoxWidget>
    <BoxWidget  title="Select broswer wallet">
      <WalletSelectWidget
        name={walletNiceName(wallet)}
        value={wallet? wallet.address : ""}
        onChange={setWallet}
      />
    </BoxWidget>
    <BoxWidget title="Create broswer wallet">
      <AddWalletWidget
        onChange={setWallet}
      />
    </BoxWidget>
    </>
  )
}

export default DisplayWalletList
