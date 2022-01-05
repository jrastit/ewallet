import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'

// Define a type for the slice state
interface EntityListState {
  entityList: Array<{ name: string, address: string }>
}

// Define the initial state using that type
const initialState: EntityListState = {
  entityList: [],
}

export const entityListSlice = createSlice({
  name: 'entityList',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    addEntityList: (state, action: PayloadAction<{ name: string, address: string }>) => {
      console.log("add...", action.payload)
      if (state.entityList.filter(entity => entity.address === action.payload.address).length === 0) {
        console.log("add", action.payload)
        state.entityList.push(action.payload)
      }
    },
    clearEntityList: (state) => {
      console.log("clear")
      state.entityList = []
    }
  },
})

export const { addEntityList, clearEntityList } = entityListSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectEntityList = (state: RootState) => state.entityListSlice.entityList

export default entityListSlice.reducer
