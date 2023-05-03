import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useAPI } from "../API";
import Header from "../Header";
import "./authenticationPage.css";

export default function AuthenticationPage() {
	const navigate = useNavigate();
	const user = useSelector((state) => state.user.value);

	useEffect(() => {
		if (user.name !== "") navigate("/nadzorna-ploca");
	}, []);

	return (
		<main className="authentication-page">
			<Header title="Prijava" />
			<div className="authentication-page-bg"></div>
			<div className="authentication-main-div">
				<h2>Prijava</h2>
				<AuthForm />
			</div>
		</main>
	);
}

function AuthForm() {
	const { login } = useAPI();
	const defRegistrationData = {
		email: "",
		password: "",
		error: {
			email: false,
			password: false,
		},
	};

	const [authData, updateRegistrationData] = useState(defRegistrationData);
	const [action, updateAction] = useState(false);

	function handleInputChange(e) {
		let temp = { ...authData };
		temp[e.target.id] = e.target.value;
		temp.error[e.target.id] = false;
		if (temp !== authData) updateRegistrationData(temp);
	}

	async function handleAuth(e) {
		e.preventDefault();
		let temp = { ...authData };
		let localError = false;
		if (
			temp.email === "" &&
			!/^[A-Za-z]+\.[a-zA-Z0-9]+@ina\.hr$/i.test(temp.email)
		) {
			updateRegistrationData((data) => {
				return {
					...data,
					error: {
						...data.error,
						email: true,
						password: true,
					},
				};
			});
			localError = true;
		}

		if (localError) updateRegistrationData(temp);
		else {
			updateAction(true);
			await login({
				email: authData.email.trim(),
				password: authData.password,
				errFunction: (error) => {
					if (error)
						updateRegistrationData((data) => {
							return {
								...data,
								error: {
									...data.error,
									email: true,
									password: true,
								},
							};
						});
				},
			});
		}
		updateAction(false);
	}

	return (
		<form className="auth-form" onSubmit={handleAuth}>
			<label htmlFor="email">Email:</label>
			<div
				className={`input-container ${authData.error.email ? "error" : null}`}
			>
				<div>
					<input
						type="mail"
						id="email"
						placeholder="ivan.horvat@ina.hr"
						onChange={handleInputChange}
						value={authData.email}
					/>
					{authData.error.email ? (
						<p>
							Provjerite ispravnost unesenih podataka
							<br />
							Mail mora zavržavati sa <b>@ina.hr</b>
						</p>
					) : null}
				</div>
			</div>
			<label htmlFor="password">Loznika:</label>
			<div
				className={`input-container ${
					authData.error.password ? "error" : null
				}`}
			>
				<div>
					<input
						type="password"
						id="password"
						placeholder="Lozinka"
						onChange={handleInputChange}
						value={authData.password}
					/>
					{authData.error.password ? (
						<p>Provjerite da li je loznika ispravna.</p>
					) : null}
				</div>
			</div>
			<p className="info">
				Ako Vam je ovo <span>prva prijava</span> polje <span>Lozinka</span>{" "}
				ostavite <span>prazno</span>.
			</p>
			<div className="button-container">
				<button type="submit" disabled={action} id="form-submit-button">
					<span className="text">Prijavi se</span>
					<span className="loader-dot"></span>
				</button>
			</div>
		</form>
	);
}
