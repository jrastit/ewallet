import { useState } from 'react'
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import BoxWidgetHide from '../../component/boxWidgetHide'
import { walletDelete } from '../../util/walletStorage'

const WalletDelete = (props : {
  address : string,
  password : string,
}) => {

  const [step, setStep] = useState(0)

  const deleteWallet = (event : any) => {
    if (event.target.value === "yes"){
      walletDelete(props.address, props.password)
      window.location.reload()
    }
  }

  return (
    <BoxWidgetHide title='Delete wallet'>
    { step === 0 &&
      <>
        <p>Delete wallet with public address {props.address}</p>
        <Button variant="danger" onClick={() => {setStep(1)}} >Delete wallet</Button>
      </>
    }
    {
      step === 1 &&
        <Form.Control type="test" placeholder="Enter yes to confirm" onChange={deleteWallet} />
    }
    </BoxWidgetHide>
  )
}

export default WalletDelete
