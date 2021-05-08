import React, { useState } from 'react'
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import { EntityType } from '../../type/entityType'
import { entityCreate } from '../../chain/entityChain'

const CreateEntityWidget = (props: {
  setEntity: (entity: EntityType) => void,
  networkName: string,
  address: string,
}) => {

  const [fieldValue, setFieldValue] = useState<any>({
    name: '',
    firstName: '',
    lastName: '',
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
    entityCreate(
      fieldValue.name,
      props.networkName,
      props.address,
      fieldValue.firstName,
      fieldValue.lastName,
    ).then(entity => {
      props.setEntity(entity)
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
        <Form.Label>Name of the entity:</Form.Label>
        <Form.Control type="text" name="name" value={fieldValue.name} onChange={handleChange} />
      </Form.Group>
      <Form.Group>
        <Form.Label>Your first name:</Form.Label>
        <Form.Control type="text" name="firstName" value={fieldValue.firstName} onChange={handleChange} />
      </Form.Group>
      <Form.Group>
        <Form.Label>Your last name:</Form.Label>
        <Form.Control type="text" name="lastName" value={fieldValue.lastName} onChange={handleChange} />
      </Form.Group>
      {fieldValue.name && fieldValue.firstName &&
        <Form.Group><Button variant="info" type="submit">Ok</Button></Form.Group>
      }
    </Form>
  )
  else if (submit === 1) return (
    <label>Entity creation...</label>
  )
  else return (
    <label>Entity created</label>
  )
}

export default CreateEntityWidget
