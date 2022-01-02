import Button from 'react-bootstrap/Button' 
import AddressWidget from './addressWidget'

const walletLearnUrl = 'https://ethereum.org/use/#_3-what-is-a-wallet' +
  '-and-which-one-should-i-use'

// From Font Awesome
const circleIcon = (className: string) => (
  <svg viewBox='0 0 512 512' className={'circle-icon ' + className}>
    <path d='M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8z' />
  </svg>
)

const WalletWidget = (props: {
  address?: string,
  error: string | undefined
}) => {

  const render = () => {

    //console.log("Wallet Render " , address, networkChainId)

    if (!window.hasOwnProperty('ethereum')) {
      return (
        <>
          {circleIcon('fail')}
          Please install an <a
            href={walletLearnUrl} target='blank'>
            Ethereum wallet.
                    </a>
        </>
      )
    } else if (!props.error && props.address === "error") {

      return (
        <p className='button is-link is-rounded'
          role='button'
          //TODO fix connect
          onClick={() => { window.ethereum.enable().then() }} >
          Connect wallet
                </p>
      )
    } else if (!props.error) {
      return (
        <>
          <span className='is-family-monospace address'>
            {circleIcon('ok')}
            <AddressWidget address={props.address}/>
          </span>
        </>
      )
    } else if (props.error) {
      return (
        <>
          {circleIcon('warn')}
          {props.error}
        </>
      )
    } else {
      return (
        <Button size='sm' variant="warning" onClick={() => {
           window.ethereum.enable().then()
        }}>Connect wallet</Button>
      )
    }
  }

  return (
    <span id='wallet-widget'>
      {render()}
    </span>
  )
}


export default WalletWidget
