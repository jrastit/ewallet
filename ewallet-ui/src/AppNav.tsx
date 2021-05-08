import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
//import NavDropdown from 'react-bootstrap/NavDropdown';
//import Form from 'react-bootstrap/Form';
//import FormControl from 'react-bootstrap/FormControl';
import Button from 'react-bootstrap/Button';
import {
  EntityType,
  deleteEntity
} from './type/entityType'
import WalletWidget from './component/walletWidget'

const AppNav = (props: {
  setIsHome: (number: number) => void,
  setEntity: (entity: EntityType | null) => void,
  entity: EntityType | undefined | null,
  address: string,
  error: string | undefined,
  networkName: string,
}) => {
  return (
    <Navbar bg="light" expand="lg">
      <Navbar.Brand href="#home" onClick={() => props.setIsHome(1)}>EWallet</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <Nav.Link href="#home" onClick={() => props.setIsHome(1)}>Home</Nav.Link>
          {/*
          <Nav.Link href="#link">Link</Nav.Link>
          <NavDropdown title="Dropdown" id="basic-nav-dropdown">
            <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
            <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
            <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
          </NavDropdown>
          */false}
        </Nav>
        <Nav className="mr-auto">
          {/*
        <Form inline>
          <FormControl type="text" placeholder="Search" className="mr-sm-2" />
          <Button variant="outline-success">Search</Button>
        </Form>
        */false}
        </Nav>
      </Navbar.Collapse>

      <Navbar.Brand>
        <WalletWidget address={props.address} error={props.error} />

      </Navbar.Brand>
      {!!props.entity &&
        <Button variant="danger" onClick={() => {
          deleteEntity()
          props.setEntity(null)
        }}>Delete entity</Button>
      }

    </Navbar>
  )
}

export default AppNav
