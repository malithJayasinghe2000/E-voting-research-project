import { ContestantStruct, GlobalState, PollStruct } from "@/utils/types";
import { PayloadAction } from "@reduxjs/toolkit";

export const globalActions ={
    setWallet : (state:GlobalState,action:PayloadAction<string>)=>{
        state.wallet = action.payload
    },
    setCreateModal : (state:GlobalState,action:PayloadAction<string>)=>{
        state.createModal = action.payload
    },
    setUpdateModal : (state:GlobalState,action:PayloadAction<string>)=>{
        state.updateModal = action.payload
    },
    setDeleteModal : (state:GlobalState,action:PayloadAction<string>)=>{
        state.deleteModal = action.payload
    },
    setContestModal : (state:GlobalState,action:PayloadAction<string>)=>{
        state.contestModal = action.payload
    },
    setPolls : (state:GlobalState,action:PayloadAction<PollStruct[]>)=>{
        state.polls = action.payload
    },
    setPoll : (state:GlobalState,action:PayloadAction<PollStruct>)=>{
        state.poll = action.payload
    },
    setContestants : (state:GlobalState,action:PayloadAction<ContestantStruct[]>)=>{
        state.contestants = action.payload
    },

}