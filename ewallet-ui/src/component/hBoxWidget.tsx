import React from 'react'

const HBoxWidget = (props : {title?:string, children:any}) => {
  return(
    <div style={{marginBottom:'1em'}}>
      {!!props.title && <div>{props.title}</div>}
      <div style={{marginTop:'1em', marginBottom:'1em'}}>{props.children}</div>
    </div>
  )
}

export default HBoxWidget
