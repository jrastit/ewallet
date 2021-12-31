import { useState } from 'react'
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { walletAdd } from '../../util/walletStorage'

const WalletAddWidget = (props: {
  password: string,
  setWallet: (address : string) => void,
}) => {

  const [fieldValue, setFieldValue] = useState<any>({
    name: '',
    pkey: '',
  })
  const [submit, setSubmit] = useState(0)
  const [error, setError] = useState<string | null>()

  const handleChange = (event: any) => {
    const fielValue_ = { ...fieldValue }
    if (fielValue_[event.target.name] !== event.target.value) {
      fielValue_[event.target.name] = event.target.value
      setFieldValue(fielValue_)
    }
  }

  const formSubmit = (event: any) => {
    walletAdd(
      fieldValue.name,
      fieldValue.pkey,
      props.password,
    ).then((wallet) => {
      props.setWallet(
          wallet.address
      )
      setSubmit(2)
    }).catch((error) => {
      setError(error.message)
    })
    event.preventDefault()
    setSubmit(1)
  }

  if (error) return (
    <div>
      <label>{error}</label>&nbsp;&nbsp;
      <Button variant="danger" onClick={() => { setFieldValue(0); setSubmit(0); setError(null) }}>Ok</Button>
    </div>
  )
  else if (submit === 0) return (
    <Form onSubmit={formSubmit}>
      <Form.Group>
        <Form.Label>Name:</Form.Label>
        <Form.Control type="text" name="name" value={fieldValue.name} onChange={handleChange} />
      </Form.Group>
      <Form.Group>
        <Form.Label>Private key (optional):</Form.Label>
        <Form.Control type="text" name="pkey" value={fieldValue.pkey} onChange={handleChange} />
      </Form.Group>
      {fieldValue.name &&
        <Form.Group><Button variant="info" type="submit">Ok</Button></Form.Group>
      }
    </Form>
  )
  else if (submit === 1) return (
    <label>Wallet creation...</label>
  )
  else return (<div>
      <label>Wallet created</label>&nbsp;&nbsp;
      <Button variant="primary" onClick={() => { setFieldValue(0); setSubmit(0) }}>Ok</Button>
    </div>
  )
}

export default WalletAddWidget
