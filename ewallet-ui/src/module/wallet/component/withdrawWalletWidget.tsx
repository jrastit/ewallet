import { useState } from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import TokenSelectWidget from './tokenSelectWidget'
import { EWalletWallet } from '../contract/EWalletWallet'

const WithdrawWalletWidget = (props: {
  wallet: EWalletWallet,
  memberId: number,
}) => {

  const [fieldValue, setFieldValue] = useState<any>({
    token: '',
    amount: '',
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
    props.wallet.withdrawFund && props.wallet.withdrawFund(
      props.memberId,
      fieldValue.amount,
      fieldValue.token,
    ).then(() => setSubmit(2)).catch(error => setError(error.message))
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
        <Form.Label>Amount in</Form.Label>
        <TokenSelectWidget
          name="token"
          value={fieldValue.token}
          onChange={handleChange}
          wallet={props.wallet}
        />
        <Form.Control type="text" name="amount" value={fieldValue.amount} onChange={handleChange} />
      </Form.Group>
      {fieldValue.token && fieldValue.amount &&
        <Form.Group><Button variant="info" type="submit">Submit</Button></Form.Group>
      }
    </Form>
  )
  else if (submit === 1) return (
    <label>Withdrawing Fund...</label>
  )
  else return (<div>
    <label>Withdraw Fund executed</label>&nbsp;&nbsp;
    <Button variant="primary" onClick={() => { setFieldValue(0); setSubmit(0) }}>Ok</Button>
  </div>)
}

export default WithdrawWalletWidget
