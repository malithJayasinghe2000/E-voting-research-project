import { createSlice } from "@reduxjs/toolkit";
import { globalStates as GlobalStates } from "./states/globalState";
import { globalActions as GlobalActions } from "./actions/globalActions";

const globalSlices = createSlice({
    name: 'global',
    initialState: GlobalStates,
    reducers: GlobalActions
})

export const globalActions = globalSlices.actions
export default globalSlices.reducer