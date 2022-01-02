import { formatAddress } from '../util/formatData'

import { Clipboard } from 'react-bootstrap-icons';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover'
import { Button } from 'react-bootstrap'


const AddressWidget = (props: {
  address?: string,
  name?: string
}) => {

  const clipboard = (text : string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <OverlayTrigger
        placement="bottom"
        trigger={["hover","focus"]}
        overlay={(
          <Popover>
            <Popover.Body>
                <p>{props.name}<br/>{props.address}</p>
            </Popover.Body>
          </Popover>
        )}>
        <span id='address-widget'>
          {formatAddress(props.address, props.name)}&nbsp;
          <Button
            style={{padding:0,lineHeight:'1em'}}
            size='sm'
            variant='default'
            onClick={() => clipboard(props.address || '')}
          ><Clipboard/></Button>
        </span>
      </OverlayTrigger>

  )
}


export default AddressWidget
