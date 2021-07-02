import { useState } from 'react'
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import {ethers} from 'ethers'

import { Entity } from '../../class/Entity'
import { LocalEntity } from '../../class/LocalEntity'
import { ETHEntity } from '../../class/ETHEntity'

const CreateEntityWidget = (props: {
  setEntity: (entity: Entity) => void,
  networkName: string,
  address: string,
  signer: ethers.Signer
}) => {

  const [fieldValue, setFieldValue] = useState<any>({
    name: '',
    memberName: '',
    deviceName: '',
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
    if (fieldValue.place === 'local'){
      new LocalEntity({
        name: fieldValue.name,
        networkName: props.networkName,
        address: props.address,
        memberName: fieldValue.memberName,
        deviceName: fieldValue.deviceName,
      }).init().then(entity => {
        props.setEntity(entity)
        setSubmit(2)
      }).catch((error) => {
        setError(error.message)
      })

    }else{
      new ETHEntity({
        name: fieldValue.name,
        networkName: props.networkName,
        address: props.address,
        signer: props.signer,
        memberName: fieldValue.memberName,
        deviceName: fieldValue.deviceName,
      }).init().then(entity => {
        props.setEntity(entity)
        setSubmit(2)
      }).catch((error) => {
        setError(error.message)
      })
    }
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
        <Form.Label>Place of the entity:</Form.Label>
        <Form.Control as="select" name="place" value={fieldValue.place} onChange={handleChange} >
          <option value={props.networkName}>{props.networkName}</option>
          <option value='local'>local</option>
        </Form.Control>
      </Form.Group>
      <Form.Group>
        <Form.Label>Name of the entity:</Form.Label>
        <Form.Control type="text" name="name" value={fieldValue.name} onChange={handleChange} />
      </Form.Group>
      <Form.Group>
        <Form.Label>Your name:</Form.Label>
        <Form.Control type="text" name="memberName" value={fieldValue.memberName} onChange={handleChange} />
      </Form.Group>
      <Form.Group>
        <Form.Label>Your device name:</Form.Label>
        <Form.Control type="text" name="deviceName" value={fieldValue.deviceName} onChange={handleChange} />
      </Form.Group>
      {fieldValue.name && fieldValue.memberName && fieldValue.deviceName &&
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
