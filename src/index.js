import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import LandingPage from "./components/landingPage/landingPage";
import "./base.css";
import { configureStore } from "@reduxjs/toolkit";
import { Provider, useDispatch, useSelector } from "react-redux";
import notificationReducer, {
	createNotification,
} from "./components/notification/notificationStore";
import userReducer, { clearUser, updateUser } from "./components/user";
import NotificationContainer from "./components/notification/notificationController";
import {
	BrowserRouter as Router,
	Navigate,
	Route,
	Routes,
} from "react-router-dom";
import AuthenticationPage from "./components/authenticationPage/authenticationPage";
import Error404 from "./components/error404/error404";
import Dashboard from "./components/dashboard/dashboard";
import axios from "axios";
import { useAPI } from "./components/API";

const root = ReactDOM.createRoot(document.getElementById("root"));

const store = configureStore({
	reducer: {
		notifications: notificationReducer,
		user: userReducer,
	},
});

root.render(
	<Provider store={store}>
		<Router>
			<NotificationContainer />
			<Controler />
		</Router>
	</Provider>
);

function Controler() {
	const role = useSelector((state) => state.user.value.role);
	const token = useSelector((state) => state.user.value.token);
	const { checkToken } = useAPI();

	useEffect(() => {
		if (role === "" && token !== "") checkToken(false);
	});

	if (role === "" && token !== "") return <></>;
	return (
		<Routes>
			<Route path="/" element={<LandingPage />} />
			<Route path="prijava" element={<AuthenticationPage />} />
			<Route
				path="registracija"
				element={<AuthenticationPage registration />}
			/>
			{role === "Serviser" ? (
				<Route path="nadzorna-ploca">
					<Route path="" element={<Dashboard tab={0} role={role} />} />
					<Route path="servisi" element={<Dashboard tab={1} role={role} />} />
					<Route path="racunala" element={<Dashboard tab={2} role={role} />} />
				</Route>
			) : role === "Administrator" ? (
				<Route path="nadzorna-ploca">
					<Route path="" element={<Dashboard tab={0} role={role} />} />
					<Route path="servisi" element={<Dashboard tab={1} role={role} />} />
					<Route path="korisnici" element={<Dashboard tab={2} role={role} />} />
					<Route path="racunala" element={<Dashboard tab={3} role={role} />} />
					<Route path="zapisnik" element={<Dashboard tab={4} role={role} />} />
				</Route>
			) : role === "Korisnik" ? (
				<Route path="nadzorna-ploca">
					<Route path="" element={<Navigate to={"servisi"} />} />
					<Route path="servisi" element={<Dashboard tab={0} role={role} />} />
					<Route path="racunala" element={<Dashboard tab={1} role={role} />} />
				</Route>
			) : null}
			<Route path="*" element={<Error404 />} />
		</Routes>
	);
}
