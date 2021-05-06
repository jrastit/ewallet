import React, { useState } from 'react'

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import {EntityType} from '../../type/entityType'

const CreateEntityWidget = (props : {
  setEntity:(entity : EntityType) => void
}) => {

  const [fieldValue, setFieldValue] = useState<any>()
  const [submit, setSubmit] = useState(0)

  const handleChange = (event : any) => {
    const fielValue_ = {...fieldValue}
    if (fielValue_[event.target.name] !== event.target.value){
      fielValue_[event.target.name] = event.target.value
      setFieldValue(fielValue_)
    }
  }

  const formSubmit = (event : any) => {
    event.preventDefault()
    setSubmit(1)
  }

  const formSubmit2 = (event : any) => {
    console.log(fieldValue)
    props.setEntity({
      name:fieldValue.name,
      contractAddress:'local'
    })
    event.preventDefault()
    setSubmit(2)
  }

  if (submit === 0) return (
    <Form onSubmit={formSubmit}>
      <Form.Group>
        <Form.Label>Name:</Form.Label>
        <Form.Control type="text" name="name" value={fieldValue?fieldValue.name:""} onChange={handleChange} />
      </Form.Group>
      {!!fieldValue && fieldValue.name &&
        <Form.Group><Button variant="info" type="submit">Ok</Button></Form.Group>
      }
    </Form>
  )
  else if (submit === 1) return (
    <Form onSubmit={formSubmit2}>
      <Form.Group>
        <Form.Label>Name:{fieldValue.name}</Form.Label>
      </Form.Group>
      {!!fieldValue && fieldValue.name &&
        <Form.Group><Button variant="primary" type="submit">Submit</Button></Form.Group>
      }
    </Form>
  )
  else return (<label>Entity created</label>)
}

export default CreateEntityWidget
