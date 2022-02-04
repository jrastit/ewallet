import { useState } from 'react'
import { Entity, EntityRole } from '../contract/model/Entity'
import { EWalletMember } from '../module/member/contract/EWalletMember'
import { EWalletWallet } from '../module/wallet/contract/EWalletWallet'
import { EWalletModule } from '../contract/model/EWalletModule'
import SpaceWidget from '../component/spaceWidget'
import BoxWidget from '../component/boxWidget'
import SimpleButton from '../component/simpleButton'
import ListGroup from 'react-bootstrap/ListGroup';

const AdminEntity = (props: {
  memberId: number,
  entity: Entity,
  wallet?: EWalletWallet,
  member?: EWalletMember,
  refreshEntity: () => void,
  setDisplayModule: (module : EWalletModule) => void,
}) => {

  const [version, setVersion] = useState(-1)
  const [name, setName] = useState<string>()
  const [role, setRole] = useState<EntityRole>()
  const [moduleList, setModuleList] = useState<EWalletModule[]>()
  const [error, setError] = useState<string | null>()
  const [memberId, setMemberId] = useState(props.memberId)

  if (memberId !== props.memberId){
    setMemberId(props.memberId)
    props.entity.getRole && props.entity.getRole(props.memberId).then(role => {
      setRole(role)
    }).catch(e =>
      setError(e)
    )
  }

  if (props.entity.version > version){
    setVersion(props.entity.version)
    props.entity.getName().then(_name => {
      if (name !== _name){
        setName(_name)
      }
    }).catch(e =>
      setError(e)
    )
    props.entity.getModuleList && props.entity.getModuleList().then(_moduleList => {
      if ((!moduleList && _moduleList) || (moduleList && moduleList.toString() !== _moduleList.toString())){
        setModuleList(_moduleList)
      }
    }).catch(e =>
      setError(e)
    )
    props.entity.getRole && props.entity.getRole(props.memberId).then(role => {
      setRole(role)
    }).catch(e =>
      setError(e)
    )

  }

  const displayModule = (module : EWalletModule) => {
    return (
      <ListGroup.Item
        key={module.getModuleName()}
        variant={"success"}
        onClick={() => {props.setDisplayModule(module)}}
      >
        {module.getModuleName()}<br />
        {module.getModuleContract()} {module.getModuleVersion()}
      </ListGroup.Item>
    )
  }

  const displayModuleList = (moduleList : EWalletModule[]) => {
    return (
      <BoxWidget title='module'>
        <ListGroup>
          {moduleList.map(displayModule)}
        </ListGroup>
      </BoxWidget>
    )
  }

  return (
    <>

    <SpaceWidget>
      <BoxWidget title={"Entity : " + name}>
      Version : {version}
      </BoxWidget>
      {!!moduleList && displayModuleList(moduleList)}
      { !!role && !role.manageModule &&
        <BoxWidget>
        <SimpleButton name="Become module manager" onClick={() => {
          props.entity.setRole && props.entity.setRole(props.memberId, {manageModule : true}).catch((e : Error) => {
            setError(e.message)
          })
        }}/>
        </BoxWidget>

      }
      { !props.wallet && !!role && !!role.manageModule &&
        <BoxWidget>
          <SimpleButton name="Add wallet" onClick={() => {
            props.entity.addModuleWallet && props.entity.addModuleWallet().catch((e : Error) => {
              setError(e.message)
            })
          }}/>
        </BoxWidget>
      }
      { error &&
        <div>
          <label>{error}</label>&nbsp;&nbsp;
          <SimpleButton variant="danger" name="Ok" onClick={() => { setError(null) }}/>
        </div>
      }
    </SpaceWidget>
    <SpaceWidget>
      <BoxWidget>
        <SimpleButton name="Refresh entity" onClick={props.refreshEntity}/>
      </BoxWidget>
    </SpaceWidget>
    </>
  )
}

export default AdminEntity
