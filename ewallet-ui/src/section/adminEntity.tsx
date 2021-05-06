import React, { useState } from 'react'
import CreateEntityWidget from '../component/admin/createEntityWidget'
import {EntityType} from '../type/entityType'
import BoxWidget from '../component/boxWidget'

const AdminEntity = () => {

  const [entity, setEntity] = useState<EntityType | undefined>()

  return (
    <BoxWidget title='Admin Entity'>
        <BoxWidget>
          Entity : {!!entity && <label>{entity.name}</label>}
        </BoxWidget>
        <BoxWidget title='Create Entity'>
          <CreateEntityWidget setEntity={setEntity}/>
        </BoxWidget>
    </BoxWidget>
  )
}

export default AdminEntity
