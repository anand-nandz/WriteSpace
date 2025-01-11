import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { BlogData, UserData, UserState } from "../../utils/interfaces/interfaces";

const initialState: UserState = {
    userData: null,
    isUserSignedIn: false,
    latestBlog: null,
}

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers:{
        setUserInfo:(state, action:PayloadAction<UserData>)=>{
            state.userData = action.payload;
            state.isUserSignedIn = true
        },
        logout:(state)=>{
            state.userData = null;
            state.isUserSignedIn = false
        },
        setLatestBlog: (state, action: PayloadAction<BlogData>) => {
            state.latestBlog = action.payload;
          },
    }
})


export const {setUserInfo,logout, setLatestBlog } = userSlice.actions;
export default userSlice.reducer