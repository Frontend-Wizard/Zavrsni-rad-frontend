import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearUser, createUser, updateUser } from "./user";
import { createNotification } from "./notification/notificationStore";

export function useAPI() {
	const token = useSelector((state) => state.user.value.token);
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const location = useLocation();
	const client = axios.create({
		baseURL: process.env.REACT_APP_API_URL,
	});

	const handleError = (err) => {
		if (err.response.status === 401) {
			dispatch(clearUser());
			setTimeout(() => {
				navigate("/prijava");
			}, 100);
		} else if (err.code === "ERR_NETWORK")
			dispatch(
				createNotification({
					text: "Veza sa serverom nije moguća.",
					type: "error",
					duration: 5,
				})
			);
	};

	const checkAvailableEmail = async (email) => {
		return client
			.post("/check/email", { email, token })
			.then(({ data }) => data)
			.then(({ end }) => {
				return end;
			});
	};

	const setPassword = async ({ password, name, lastName }) => {
		return await client
			.post("/update/user/password", { token, password, name, lastName })
			.then(({ data }) => data)
			.then((valid) => {
				return valid;
			})
			.catch((err) => {
				handleError(err);
			});
	};

	const resetPassword = async ({ _id, resFunction = () => {} }) => {
		return await client
			.post("/reset/user/password", { token, _id })
			.then(({ data }) => data)
			.then((valid) => {
				resFunction(valid);
			})
			.catch((err) => {
				handleError(err);
			});
	};

	const checkToken = async (redirect = true) => {
		await client
			.post("/checkToken", { token })
			.then(({ data }) => data)
			.then(({ role, name, lastName, newUser }) => {
				dispatch(updateUser({ name, lastName, role, newUser }));
				if (redirect && !location.pathname.includes("/nadzorna-ploca"))
					setTimeout(() => {
						navigate("/nadzorna-ploca");
					}, 100);
			})
			.catch((err) => {
				if (err.response.status === 401 || err.response.status === 404)
					dispatch(clearUser());
				handleError(err);
			});
	};

	const login = async ({ password, email, declineFunction = () => {} }) => {
		await client
			.post("/login", { password, email })
			.then(({ data }) => data)
			.then(({ token, role, name, lastName, newUser }) => {
				dispatch(createUser({ name, lastName, token, role, newUser }));
				setTimeout(() => {
					navigate("/nadzorna-ploca");
				}, 100);
			})
			.catch((err) => {
				if (err.response.status === 404) {
					dispatch(
						createNotification({
							text: "Korisnik nije pronađen",
							type: "error",
							duration: 5,
						})
					);
					declineFunction(true);
				}
				handleError(err);
			});
	};
	const logout = async () => {
		await client
			.post("/logout", { token })
			.then(({ data }) => data)
			.then((successful) => {
				if (successful) {
					navigate("/");
					setTimeout(() => {
						dispatch(clearUser());
					}, 1);
				}
			})
			.catch((err) => {
				handleError(err);
			});
	};
	const getData = async ({
		type = "",
		lastElement,
		limit,
		filters = {},
		resFunction = () => {},
		errFunction = () => {},
	}) => {
		switch (type) {
			case "DASHBOARD":
				client
					.post("/dashboard/home", { token })
					.then(({ data }) => data)
					.then((data) => {
						resFunction(data);
					})
					.catch((err) => {
						handleError(err);
						errFunction(err);
					});
				break;
			case "COMPUTERS":
				client
					.post("/dashboard/computers", {
						token: token,
						filters: filters,
						skip: lastElement,
						limit,
					})
					.then(({ data }) => data)
					.then((data) => {
						resFunction(data);
					})
					.catch((err) => {
						handleError(err);
						errFunction(err);
					});
				break;
			case "USERS":
				client
					.post("/dashboard/users", {
						token: token,
						filters: filters,
						skip: lastElement,
						limit,
					})
					.then(({ data }) => data)
					.then((data) => {
						resFunction(data);
					})
					.catch((err) => {
						handleError(err);
						errFunction(err);
					});
				break;
			case "SERVICES":
				client
					.post("/dashboard/services", {
						token: token,
						filters: filters,
						skip: lastElement,
						limit,
					})
					.then(({ data }) => data)
					.then((data) => {
						resFunction(data);
					})
					.catch((err) => {
						handleError(err);
						errFunction(err);
					});
				break;
			case "LOGS":
				client
					.post("/dashboard/logs", {
						token: token,
						filter: filters,
						skip: lastElement,
						limit,
					})
					.then(({ data }) => data)
					.then((data) => {
						resFunction(data);
					})
					.catch((err) => {
						handleError(err);
						errFunction(err);
					});
				break;

			default:
				break;
		}
	};

	const updateDataAPI = async ({
		type = "",
		data = {},
		status = false,
		resFunction = () => {},
		errFunction = () => {},
	}) => {
		switch (type) {
			case "COMPUTERS":
				client
					.post("/update/PC", { token, computer: data })
					.then(({ data }) => data)
					.then((valid) => {
						dispatch(
							createNotification({
								text: `Računalo ${valid ? "je" : "nije"} uspješno izmjenjeno`,
								type: valid ? "success" : "error",
								duration: 5,
							})
						);
						resFunction();
					})
					.catch((err) => {
						handleError(err);
						errFunction(err);
					});
				break;
			case "USERS":
				return client
					.post("/update/user", { token, user: data })
					.then(({ data }) => data)
					.then((valid) => {
						dispatch(
							createNotification({
								text: `Korisnik ${
									valid && !status ? "je" : "nije"
								} uspješno izmjenjen`,
								type: valid && !status ? "success" : "error",
								duration: 5,
							})
						);
						resFunction();
						return true;
					})
					.catch((err) => {
						handleError(err);
						if (err.response.status === 400) {
							dispatch(
								createNotification({
									text: `Email adresa je zauzeta, molimo odaberite neku drugu adresu`,
									type: "error",
									duration: 5,
								})
							);
							return false;
						}
						errFunction(err);
					});
				break;
			case "SERVICE":
				client
					.post("/update/service", { token, service: data })
					.then(({ data }) => data)
					.then((valid) => {
						dispatch(
							createNotification({
								text: `Zahtjev ${valid ? "je" : "nije"} uspješno obrađen`,
								type: valid ? "success" : "error",
								duration: 5,
							})
						);
						resFunction();
					})
					.catch((err) => {
						handleError(err);
						errFunction(err);
					});
				break;

			default:
				break;
		}
	};

	const deleteData = async ({
		type = "",
		_id = "",
		resFunction = () => {},
		errFunction = () => {},
	}) => {
		switch (type) {
			case "COMPUTER":
				client
					.post("/delete/PC", { token, _id: _id })
					.then(({ data }) => data)
					.then((valid) => {
						dispatch(
							createNotification({
								text: `Računalo ${valid ? "je" : "nije"} uspješno uklonjeno`,
								type: valid ? "success" : "error",
								duration: 5,
							})
						);
						resFunction(valid);
					})
					.catch((err) => {
						handleError(err);
						errFunction(err);
					});
				break;

			case "USER":
				client
					.post("/delete/user", { token, _id: _id })
					.then(({ data }) => data)
					.then((valid) => {
						dispatch(
							createNotification({
								text: `Korisnik ${valid ? "je" : "nije"} uspješno uklonjen`,
								type: valid ? "success" : "error",
								duration: 5,
							})
						);
						resFunction(valid);
					})
					.catch((err) => {
						handleError(err);
						errFunction(err);
					});
				break;

			default:
				break;
		}
	};

	const createNewComputer = async (value) => {
		await client
			.post("/createNew/PC", { value: value, token })
			.then(({ data }) => data)
			.then((valid) => {
				dispatch(
					createNotification({
						text: `Računalo ${valid ? "je" : "nije"} uspješno kreirano`,
						type: valid ? "success" : "error",
						duration: 5,
					})
				);
			})
			.catch((err) => {
				handleError(err);
			});
	};

	const createNewUser = async (value) => {
		return await client
			.post("/createNew/user", { value, token })
			.then(({ data }) => data)
			.then((valid) => {
				dispatch(
					createNotification({
						text: `Korisnik ${valid ? "je" : "nije"} uspješno kreiran`,
						type: valid ? "success" : "error",
						duration: 5,
					})
				);
				return true;
			})
			.catch((err) => {
				handleError(err);
				if (err.response.status === 400) {
					dispatch(
						createNotification({
							text: `Email adresa je zauzeta, molimo odaberite neku drugu adresu`,
							type: "error",
							duration: 5,
						})
					);
					return false;
				}
			});
	};

	const createNewService = async (value) => {
		await client
			.post("/createNew/service", { value: value, token })
			.then(({ data }) => data)
			.then((valid) => {
				dispatch(
					createNotification({
						text: `Zahtjev za servis ${
							valid ? "je" : "nije"
						} uspješno podnesen`,
						type: valid ? "success" : "error",
						duration: 5,
					})
				);
			})
			.catch((err) => {
				handleError(err);
			});
	};

	const searchPC = async ({ filter, selected = [], computerID = "" }) => {
		if (computerID === "")
			return await client
				.post("/search/computers", {
					token: token,
					filter: filter,
					selected: selected,
					token: token,
				})
				.then(({ data }) => data)
				.then((data) => {
					return data;
				})
				.catch((err) => {
					handleError(err);
				});
		else
			return await client
				.post("/search/computers", {
					computerID: computerID,
					token: token,
				})
				.then(({ data }) => data)
				.then((data) => {
					return data;
				})
				.catch((err) => {
					handleError(err);
				});
	};

	const searchUser = async ({
		filter = {},
		computersOnly = false,
		selectedComputer = {},
		resFunction = () => {},
	}) => {
		return await client
			.post("/search/user", {
				filter: filter,
				token: token,
				computersOnly: computersOnly,
				selectedComputer:
					selectedComputer?._id !== undefined ? selectedComputer?._id : "",
			})
			.then(({ data }) => data)
			.then((data) => {
				resFunction(data);
				return data;
			})
			.catch((err) => {
				handleError(err);
			});
	};

	return {
		resetPassword,
		checkAvailableEmail,
		checkToken,
		setPassword,
		searchUser,
		createNewService,
		login,
		logout,
		deleteData,
		getData,
		createNewComputer,
		updateDataAPI,
		searchPC,
		createNewUser,
	};
}
