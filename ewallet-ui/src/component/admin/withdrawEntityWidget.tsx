import React, { useState } from 'react'
import { ethers } from 'ethers'
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { entityWithdrawFund } from '../../chain/entityChain'
import { EntityType } from '../../type/entityType'

const WithdrawEntityWidget = (props: {
  entity: EntityType,
  userId: number,
}) => {

  const [fieldValue, setFieldValue] = useState<any>({
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
    entityWithdrawFund(
      props.userId,
      props.entity,
      ethers.utils.parseEther(fieldValue.amount)
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
        <Form.Label>Amount in ETH:</Form.Label>
        <Form.Control type="text" name="amount" value={fieldValue.amount} onChange={handleChange} />
      </Form.Group>
      {fieldValue.amount &&
        <Form.Group><Button variant="info" type="submit">Submit</Button></Form.Group>
      }
    </Form>
  )
  else if (submit === 1) return (
    <label>Withdrawing Fund {fieldValue.amount} ETH ...</label>
  )
  else return (<div>
    <label>Withdraw Fund executed {fieldValue.amount} ETH</label>&nbsp;&nbsp;
    <Button variant="primary" onClick={() => { setFieldValue(0); setSubmit(0) }}>Ok</Button>
  </div>)
}

export default WithdrawEntityWidget
