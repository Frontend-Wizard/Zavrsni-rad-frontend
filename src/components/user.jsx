import { createSlice } from "@reduxjs/toolkit";

var token = "";

if (localStorage.getItem("token")) {
	token = localStorage.getItem("token");
}

export const user = createSlice({
	name: "user",
	initialState: {
		value: {
			name: "",
			lastName: "",
			token: token !== "" ? token : "",
			role: "",
			newUser: "",
		},
	},
	reducers: {
		createUser: (state, action) => {
			state.value = {
				newUser: action.payload.newUser,
				name: action.payload.name,
				lastName: action.payload.lastName,
				token: action.payload.token,
				role: action.payload.role,
			};
			localStorage.setItem("token", action.payload.token);
		},
		updateUser: (state, action) => {
			state.value = {
				newUser: action.payload.newUser,
				token: state.value.token,
				name: action.payload.name,
				lastName: action.payload.lastName,
				role: action.payload.role,
			};
		},
		clearUser: (state, action) => {
			state.value = {
				name: "",
				lastName: "",
				token: "",
				role: "",
				newUser: "",
			};
			localStorage.removeItem("token");
		},
	},
});

export const { createUser, clearUser, updateUser } = user.actions;

export default user.reducer;
