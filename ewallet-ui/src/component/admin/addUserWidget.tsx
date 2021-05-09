import React, { useState } from 'react'
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import { EntityType } from '../../type/entityType'
import { userCreate } from '../../chain/userChain'

const AddUserWidget = (props: {
  entity: EntityType,
}) => {

  const [fieldValue, setFieldValue] = useState<any>({
    firstName: '',
    lastName: '',
    wallet: '',
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
    userCreate(
      props.entity,
      fieldValue.wallet,
      fieldValue.firstName,
      fieldValue.lastName,
    ).then(entity => {
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
        <Form.Label>First name:</Form.Label>
        <Form.Control type="text" name="firstName" value={fieldValue.firstName} onChange={handleChange} />
      </Form.Group>
      <Form.Group>
        <Form.Label>Last name:</Form.Label>
        <Form.Control type="text" name="lastName" value={fieldValue.lastName} onChange={handleChange} />
      </Form.Group>
      <Form.Group>
        <Form.Label>Wallet address:</Form.Label>
        <Form.Control type="text" name="wallet" value={fieldValue.wallet} onChange={handleChange} />
      </Form.Group>
      {fieldValue.firstName && fieldValue.wallet &&
        <Form.Group><Button variant="info" type="submit">Ok</Button></Form.Group>
      }
    </Form>
  )
  else if (submit === 1) return (
    <label>User creation...</label>
  )
  else return (<div>
    <label>User created</label>&nbsp;&nbsp;
    <Button variant="primary" onClick={() => { setFieldValue(0); setSubmit(0) }}>Ok</Button>
  </div>)
}

export default AddUserWidget
