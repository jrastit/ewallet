import { useState } from 'react'
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import BoxWidgetHide from '../../component/boxWidgetHide'
import { walletListDelete } from '../../util/walletStorage'

const WalletDeleteAll = () => {

  const [step, setStep] = useState(0)

  const deleteAllWallet = (event : any) => {
    if (event.target.value === "yes"){
      walletListDelete()
      window.location.reload()
    }
  }

  return (
    <BoxWidgetHide title='Reset password and local wallet'>
    { step === 0 &&
      <Button variant="danger" onClick={() => {setStep(1)}} >Delete all broswer wallets</Button>
    }
    {
      step === 1 &&
        <Form.Control type="test" placeholder="Enter yes to confirm" onChange={deleteAllWallet} />
    }
    </BoxWidgetHide>
  )
}

export default WalletDeleteAll
