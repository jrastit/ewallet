import { useState } from 'react';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import SpaceWidget from '../component/spaceWidget'
import BoxWidget from '../component/boxWidget'

import AdminMemberList from '../module/member/section/adminMemberList'
import AdminMember from '../module/member/section/adminMember'

import AdminWallet from '../module/wallet/section/adminWallet'
import WalletTransfer from '../module/wallet/section/walletTransfer'
import DisplayWalletOperationList from '../module/wallet/component/displayWalletOperationList'

import AdminEntity from './adminEntity'
import { WalletInfo } from '../type/walletInfo'
import { Entity } from '../contract/model/Entity'
import { EWalletModule } from '../contract/model/EWalletModule'
import { EWalletMember } from '../module/member/contract/EWalletMember'
import { EWalletWallet } from '../module/wallet/contract/EWalletWallet'
import { EWalletERC20Info } from '../module/erc20Info/contract/EWalletERC20Info'
import AdminERC20Info from '../module/erc20Info/section/adminERC20Info'


const DisplayEntity = (props: {
  entity: Entity,
  walletInfo: WalletInfo,
}) => {

  const [memberId, setMemberId] = useState(-2)
  const [version, setVersion] = useState(-1)
  const [member, setMember] = useState<EWalletMember>()
  const [wallet, setWallet] = useState<EWalletWallet>()
  const [displayModule, setDisplayModule] = useState<EWalletModule>()

  const updateVersion = (_version: number) => {
    if (_version !== version) {
      setVersion(_version)
      props.entity.getModuleMember && props.entity.getModuleMember().then(
        member => setMember(member)
      ).catch(
        () => setMember(undefined)
      )
      props.entity.getModuleWallet && props.entity.getModuleWallet().then(
        wallet => setWallet(wallet)).catch(
          () => setWallet(undefined)
        )
    }
  }

  if (props.walletInfo.transactionManager && props.walletInfo.address && props.entity) {
    props.entity.getMemberIdFromAddress && props.entity.getMemberIdFromAddress(props.walletInfo.address).then(
      (_memberId) => {
        if (_memberId !== memberId) {
          setMemberId(_memberId)
        }
      }
    ).catch((err) => {
      console.log(err);
      setMemberId(-1);
    })
  }

  if (props.entity.version > version) {
    if (props.entity) {
      props.entity.setVersion = updateVersion
    }
    updateVersion(props.entity.version)
  }

  const refreshEntity = async () => {
    props.entity && props.entity.update && props.entity.update()
  }

  const displayModuleRender = (module: EWalletModule | undefined) => {
    if (module) {
      switch (module.getModuleName()) {
        case "member":
          if (member) {
            return (
              <>
                <Col>
                  <AdminMemberList memberId={memberId} member={member} />
                </Col>
                <Col>
                  <AdminMember memberId={memberId} member={member} />
                </Col>
                <Col></Col>
              </>
            )
          }
          break;
        case "wallet":
          if (wallet) {
            return (
              <>
                <Col>
                  <AdminWallet
                    memberId={memberId}
                    wallet={wallet}
                  />
                </Col>
                <Col>
                  <WalletTransfer
                    memberId={memberId}
                    wallet={wallet}
                    walletInfo={props.walletInfo}
                  />
                </Col>
                <Col>
                  <SpaceWidget>
                    <BoxWidget title='Entity operation'>
                      <DisplayWalletOperationList
                        wallet={wallet}
                      />
                    </BoxWidget>
                  </SpaceWidget>
                </Col>
              </>
            )
          }
          break;
        case "ERC20Info":
          if (module instanceof EWalletERC20Info) {
            return (
              <>
                <Col><AdminERC20Info
                  memberId={memberId}
                  ERC20Info={module}
                /></Col>
                <Col></Col>
                <Col></Col>
              </>
            )
          }
          break;
      }
    }
    return (
      <><Col></Col><Col></Col><Col></Col></>
    )
  }

  return (
    <Row>
      <Col>
        {memberId > -2 &&
          <AdminEntity
            memberId={memberId}
            entity={props.entity}
            wallet={wallet}
            member={member}
            refreshEntity={refreshEntity}
            setDisplayModule={setDisplayModule}
          />
        }
      </Col>
      {displayModuleRender(displayModule)}
    </Row>
  )
}

export default DisplayEntity
