import { createSlice } from "@reduxjs/toolkit";

export const notifications = createSlice({
	name: "notifications",
	initialState: {
		value: [],
		id: 0,
	},

	reducers: {
		createNotification: (state, action) => {
			if (typeof action.payload[1] === "undefined") {
				state.value.push({
					id: state.id,
					text: action.payload.text,
					type: action.payload.type,
					duration: action.payload.duration,
				});
				state.id += 1;
			} else {
				action.payload.forEach((element) => {
					state.value.push({
						id: state.id,
						text: element.text,
						type: element.type,
						duration: element.duration,
					});
					state.id += 1;
				});
			}
		},
		deleteNotification: (state, action) => {
			state.value.filter((el) => el.id === action.payload);
			if (state.id >= 31) state.id = 0;
		},
	},
});

export const { createNotification, deleteNotification } = notifications.actions;

export default notifications.reducer;
