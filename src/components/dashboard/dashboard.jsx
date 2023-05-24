import "./dashboard.css";
import React from "react";
import {
	Chart as ChartJS,
	ArcElement,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Tooltip,
	Filler,
	registerables as registerablesJS,
} from "chart.js";
import { Doughnut, Chart } from "react-chartjs-2";
import { dashboardVectors } from "./vectors";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAPI } from "../API";
import { useSelector } from "react-redux";
import Header from "../Header";
ChartJS.register(...registerablesJS);
ChartJS.register(
	ArcElement,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Tooltip,
	Filler
);

const limit = 50;

// npm install chart.js react-chartjs-2
export default function Dashboard({ tab, role = "" }) {
	const data =
		role === "Administrator"
			? [
					{
						text: "Nadzorna ploča",
						href: "",
						svg: dashboardVectors.home,
						elemnt: <Home />,
					},
					{
						text: "Servisi",
						href: "servisi",
						svg: dashboardVectors.services,
						elemnt: <Services />,
					},
					{
						text: "Korisnici",
						href: "korisnici",
						svg: dashboardVectors.users,
						elemnt: <Users />,
					},
					{
						text: "Računala",
						href: "racunala",
						svg: dashboardVectors.computers,
						elemnt: <Computers />,
					},
					{
						text: "Zapisnik",
						href: "zapisnik",
						svg: dashboardVectors.logs,
						elemnt: <Logs />,
					},
			  ]
			: role === "Serviser"
			? [
					{
						text: "Nadzorna ploča",
						href: "",
						svg: dashboardVectors.home,
						elemnt: <Home />,
					},
					{
						text: "Servisi",
						href: "servisi",
						svg: dashboardVectors.services,
						elemnt: <Services />,
					},
					{
						text: "Računala",
						href: "racunala",
						svg: dashboardVectors.computers,
						elemnt: <Computers />,
					},
			  ]
			: [
					{
						text: "Servisi",
						href: "servisi",
						svg: dashboardVectors.services,
						elemnt: <Services />,
					},

					{
						text: "Računala",
						href: "racunala",
						svg: dashboardVectors.computers,
						elemnt: <Computers />,
					},
			  ];
	const navigate = useNavigate();
	const [active, updateActive] = useState(tab);
	const { logout, checkToken } = useAPI();
	const [hide, updateHide] = useState(true);
	const [mobile, updateMobile] = useState(window.innerWidth <= 900);
	const user = useSelector((state) => state.user.value);
	useEffect(() => {
		if (user.role === "") checkToken();
		window.addEventListener("resize", () => {
			updateMobile(window.innerWidth <= 900);
		});
		return () => {
			window.removeEventListener("resize", () => {
				updateMobile(window.innerWidth <= 900);
			});
		};
	}, []);

	useEffect(() => {
		updateActive(tab);
	}, [tab]);

	return (
		<div className="dashboard-container">
			<Header title={data[active].text} />
			{user.newUser === true ? <EditUser user={user} /> : null}
			<nav key="dashboardNavigation" className={hide ? "hidden" : ""}>
				{mobile ? (
					<div
						onClick={() => {
							updateHide((old) => !old);
						}}
						className="hide"
					>
						{dashboardVectors.arrow}
					</div>
				) : null}
				<a href="/">
					<h1 id="logo">INAtech</h1>
				</a>
				<ul>
					{data.map((el, i) => (
						<a
							href={"/nadzorna-ploca/" + data[i].href}
							key={"navElement-" + i}
							onClick={(e) => {
								if (e.ctrlKey) {
									return;
								}
								e.preventDefault();
								updateHide(true);
								updateActive(i);
								navigate("/nadzorna-ploca/" + data[i].href);
							}}
						>
							<li className={i === active ? "active" : ""}>
								{el.svg}
								<span>{el.text}</span>
							</li>
						</a>
					))}
				</ul>
				<button id="logout-button" onClick={logout}>
					{dashboardVectors.logout}
					<span>Odjava</span>
				</button>
			</nav>
			<div className="main-dashboard-container">
				<main>
					<div className="illustration">
						<h2>{data[active].text}</h2>
					</div>
					{data[active].elemnt}
				</main>
			</div>
		</div>
	);
}

function useOuterClick(ref) {
	const [state, updateState] = useState(false);

	useEffect(() => {
		function handleClick(e) {
			if (e.target.tagName.toUpperCase() !== "LI")
				updateState(ref.current && !ref.current.contains(e.target));
		}
		document.addEventListener("mousedown", handleClick);
		return () => {
			document.removeEventListener("mousedown", handleClick);
		};
	}, [ref]);

	return state;
}

export function EditUser({ user }) {
	const [data, updateData] = useState({
		...user,
		password: "",
		passwordConfirm: "",
	});
	const { setPassword, checkToken } = useAPI();
	const [check, updateCheck] = useState(false);
	const handleSubmit = async (e) => {
		e.preventDefault();
		if (
			data.name === "" ||
			data.lastName === "" ||
			data.password === "" ||
			data.password !== data.passwordConfirm
		)
			updateCheck(true);
		else {
			let obj = { password: data.password };
			if (data.name !== user.name) obj.name = data.name;
			if (data.lastName !== user.lastName) obj.lastName = data.lastName;
			if (await setPassword(obj)) checkToken();
		}
	};
	return (
		<div className="new-data">
			<div className="main-content finish-user">
				<div className="content-data">
					<h3>Potvrđivanje osobnih podataka</h3>
					<form
						className="new-data-input-div new-user-div"
						onSubmit={handleSubmit}
					>
						<h5 className="header">Osnovni podatci:</h5>
						<div className="input-holder">
							<CustomInput
								value={data.name}
								onChange={(e) => {
									updateData((old) => {
										return { ...old, name: e.target.value };
									});
								}}
								/*valid={(data) => {
									updateError((old) => {
										return old.map((value, i) => {
											if (i === 0) return data;
											else return value;
										});
									});
								}}*/
								regex={[/[a-zA-Zčćžđš]+/i]}
								label="Ime:"
								placeholder="Ivan"
								id="user-name"
								errorMsg="Ovo polje je obavezno"
								check={check}
							/>
							<CustomInput
								value={data.lastName}
								onChange={(e) => {
									updateData((old) => {
										return { ...old, lastName: e.target.value };
									});
								}}
								/*valid={(data) => {
									updateError((old) => {
										return old.map((value, i) => {
											if (i === 0) return data;
											else return value;
										});
									});
								}}*/
								regex={[/[a-zA-Zčćžđš]+/i]}
								label="Prezime:"
								placeholder="Horvat"
								id="user-last-name"
								errorMsg="Ovo polje je obavezno"
								check={check}
							/>
						</div>
						<h5 className="header">Postavljanje lozinke: </h5>
						<div className="input-holder">
							<CustomInput
								value={data.password}
								onChange={(e) => {
									updateData((old) => {
										return { ...old, password: e.target.value };
									});
								}}
								/*valid={(data) => {
									updateError((old) => {
										return old.map((value, i) => {
											if (i === 0) return data;
											else return value;
										});
									});
								}}*/
								type="password"
								regex={[/[a-zA-Zčćžđš1-9]+/i]}
								label="Unos lozinke:"
								placeholder="*********"
								id="user-pass"
								errorMsg="Ovo polje je obavezno"
								check={check}
							/>
							<CustomInput
								value={data.passwordConfirm}
								onChange={(e) => {
									updateData((old) => {
										return { ...old, passwordConfirm: e.target.value };
									});
								}}
								/*valid={(data) => {
									updateError((old) => {
										return old.map((value, i) => {
											if (i === 0) return data;
											else return value;
										});
									});
								}}*/
								type="password"
								regex={[new RegExp(data.password)]}
								label="Ponovni unos lozinke:"
								placeholder="*********"
								id="user-pass-repeat"
								errorMsg="Unesene lozinke nisu jednake"
								check={
									check ||
									(data.passwordConfirm !== "" &&
										data.password !== data.passwordConfirm)
								}
							/>
						</div>
						<p className="info" style={{ marginTop: "20px" }}>
							Nakon potvrde podataka <b>samo administrator</b> će ih moći{" "}
							<b>promjeniti</b>.
						</p>
						<div className="bottom-navigation">
							<span></span>
							<button type="submit">Potvrdi</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}

function DropDownMenu({ data = [], active = 0, updateActive = () => {} }) {
	const [shown, updateshown] = useState(false);
	const selectorRef = useRef();
	useEffect(() => {
		updateshown(false);
	}, [useOuterClick(selectorRef)]);
	const select = (i) => {
		updateActive(i);
		updateshown(false);
	};
	return (
		<div ref={selectorRef} className={`selector ${shown ? "active" : ""}`}>
			<div
				onClick={() => {
					updateshown(true);
				}}
			>
				<h4>{data[active]}</h4>
				{dashboardVectors.arrow}
			</div>
			{shown ? (
				<ul>
					{data.map((el, i) => (
						<li
							key={"ListElement" + data[0] + i}
							onClick={() => {
								select(i);
							}}
						>
							{el}
						</li>
					))}
				</ul>
			) : null}
		</div>
	);
}

function Table({
	data = [0],
	labels = [{ text: "", key: "" }],
	className = "",
	expanded = undefined,
	loading = true,
	loadMoreData = () => {},
}) {
	const [active, updateActive] = useState(-1);
	const [LabelsCopy, updateLabelsCopy] = useState(labels);
	const [load, updateLoad] = useState({ all: false, loading: false });
	useEffect(() => {
		updateActive(-1);
	}, [data]);
	useEffect(() => {
		updateLoad((old) => {
			return { ...old, all: data.length === limit };
		});
	}, [loading]);
	useEffect(() => {
		function handleResize() {
			if (window.innerWidth <= 700)
				updateLabelsCopy([...labels].filter((el, i) => i !== 1));
			else updateLabelsCopy([...labels]);
		}
		window.addEventListener("resize", handleResize);
		handleResize();
		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	const handleLoadMore = () => {
		function setAll(max) {
			updateLoad((old) => {
				return { ...old, all: max, loading: false };
			});
		}
		updateLoad((old) => {
			return { ...old, loading: true };
		});
		loadMoreData(setAll);
	};

	return (
		<>
			<table className={`custom-table ${className !== "" ? className : ""}`}>
				<thead>
					<tr>
						{LabelsCopy.map((el, i) => (
							<th key={className + "-Label-" + i + "-" + active}>{el.text}</th>
						))}
						<th></th>
					</tr>
				</thead>
				{loading ? (
					<tbody>
						<tr className="table-loader">
							{LabelsCopy.map((el, i) => (
								<td key={className + "-loader-" + i}>
									<span></span>
								</td>
							))}
							<td>
								<span></span>
							</td>
						</tr>
						<tr className="table-loader">
							{LabelsCopy.map((el, i) => (
								<td key={className + "-loader-" + i}>
									<span></span>
								</td>
							))}
							<td>
								<span></span>
							</td>
						</tr>
						<tr className="table-loader">
							{LabelsCopy.map((el, i) => (
								<td key={className + "-loader-" + i}>
									<span></span>
								</td>
							))}
							<td>
								<span></span>
							</td>
						</tr>
					</tbody>
				) : (
					<tbody>
						{data.length === 0 ? (
							<tr>
								<td className="no-data" colSpan={LabelsCopy.length + 1}>
									Podatci nisu pronađeni
								</td>
							</tr>
						) : (
							data.map((el, i) => (
								<React.Fragment key={className + "-" + el.id + "-" + i}>
									<tr
										onClick={() => {
											updateActive(active === i ? -1 : i);
										}}
									>
										{LabelsCopy.map((key) => (
											<td
												key={key.key + "-" + i}
												className={
													typeof key?.status !== "undefined"
														? key?.status[0] &&
														  key.status[0].includes(el[key.key])
															? "good"
															: key?.status[1] &&
															  key.status[1].includes(el[key.key])
															? "ok"
															: key?.status[2] &&
															  key.status[2].includes(el[key.key])
															? "bad"
															: ""
														: ""
												}
											>
												{String(el[key.key]).includes(";")
													? String(el[key.key])
															.split(";")
															.map((data, j) => (
																<React.Fragment
																	key={key.key + "-" + i + "-" + j + "-data"}
																>
																	{j === 0 ? null : <br />}
																	{data}
																</React.Fragment>
															))
													: el[key.key]}
											</td>
										))}
										{expanded !== undefined ? (
											<td
												className={`${active === i ? "active" : ""} activator`}
											>
												{dashboardVectors.arrow}
											</td>
										) : null}
									</tr>
									{expanded !== undefined ? (
										<tr className={`expand ${active === i ? "active" : ""}`}>
											<td colSpan="5">{expanded(el)}</td>
										</tr>
									) : null}
								</React.Fragment>
							))
						)}
						{load.loading ? (
							<>
								<tr className="table-loader">
									{LabelsCopy.map((el, i) => (
										<td key={className + "-loader-" + i}>
											<span></span>
										</td>
									))}
									<td>
										<span></span>
									</td>
								</tr>
								<tr className="table-loader">
									{LabelsCopy.map((el, i) => (
										<td key={className + "-loader-" + i}>
											<span></span>
										</td>
									))}
									<td>
										<span></span>
									</td>
								</tr>
								<tr className="table-loader">
									{LabelsCopy.map((el, i) => (
										<td key={className + "-loader-" + i}>
											<span></span>
										</td>
									))}
									<td>
										<span></span>
									</td>
								</tr>
							</>
						) : null}
					</tbody>
				)}
			</table>
			{!loading && load.all ? (
				<button className="load-more" onClick={handleLoadMore}>
					Učitaj još podataka
				</button>
			) : !loading && !load.all && data.length !== 0 ? (
				<p className="load-more-end">Došli ste do kraja</p>
			) : null}
		</>
	);
}

/*
Dijelovi nadzorne ploče
*/

// Početna stranica

function Home() {
	const role = useSelector((state) => state.user.value.role);
	const [data, updateData] = useState([]);
	const [staticData, updateStaticData] = useState({
		cusers: 0,
		services: { active: 0, idle: 0, finished: 0, all: 0 },
		repairer: 0,
		chart: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	});
	const [loading, updateLoading] = useState(true);
	const { getData } = useAPI();
	const chartOptions = {
		onHover: (e, chartEl) => {
			if (chartEl.length === 1) {
				e.native.target.style.cursor = "pointer";
			}
			if (chartEl.length === 0) {
				e.native.target.style.cursor = "default";
			}
		},
		maintainAspectRatio: false,
		cutout: "75%",
	};

	useEffect(() => {
		updateLoading(true);
		getData({
			type: "SERVICES",
			resFunction: (servicesData) => {
				updateData(servicesData);
				updateLoading(false);
			},
		});
		getData({
			type: "DASHBOARD",
			resFunction: ({ users, repairer, services, chart }) => {
				updateStaticData((old) => {
					return { ...old, users, repairer, services, chart };
				});
			},
		});
	}, []);

	return (
		<>
			{role === "Administrator" ? (
				<div className="cards">
					<div className="card">
						<h6>Ukopno korisnika</h6>
						<h5>{staticData.users}</h5>
					</div>
					<div className="card">
						<h6>Ukopno servisera</h6>
						<h5>{staticData.repairer}</h5>
					</div>
					<div className="card">
						<h6>Ukopno servisa</h6>
						<h5>
							{staticData.services.all === -1 ? 0 : staticData.services.all}
						</h5>
					</div>
				</div>
			) : role === "Serviser" ? (
				<div className="cards">
					<div className="card">
						<h6>Ukopno servisa</h6>
						<h5>{staticData.services.all}</h5>
					</div>
					<div className="card">
						<h6>Ukopno aktivnih servisa</h6>
						<h5>{staticData.services.active}</h5>
					</div>
					<div className="card">
						<h6>Ukopno obavljenih servisa</h6>
						<h5>{staticData.services.finished}</h5>
					</div>
				</div>
			) : null}
			<div className="chart-div tab">
				<h3>Servisi</h3>
				<div className="chart-container">
					<Chart
						type="line"
						options={{
							maintainAspectRatio: false,
							elements: { line: { tension: 0.5 } },
							scales: {
								x: {
									grid: {
										color: "transparent",
									},
								},
								y: {
									grid: {
										color: "#aeb2d93f",
									},
								},
							},
						}}
						data={{
							labels: [
								"Siječanj",
								"Veljača",
								"Ožujak",
								"Travanj",
								"Svibanj",
								"Lipanj",
								"Srpanj",
								"Kolovoz",
								"Rujan",
								"Listopad",
								"Studeni",
								"Prosinac",
							],
							datasets: [
								{
									label: "Broj servisa",
									fill: true,
									backgroundColor: "#4bc0c066",
									borderColor: "#4bc0c0",
									pointBorderColor: "#4bc0c0",
									pointHoverBackgroundColor: "#4bc0c0",
									pointHoverBorderColor: "#ffffff",
									pointHoverRadius: 7,
									data: staticData.chart,
								},
							],
						}}
					/>
				</div>
			</div>
			<div className="chart-div  services-doughnut">
				<div className="chart tab">
					<div>
						<Doughnut
							data={{
								labels: ["Aktivni servisi", "Ostalo"],
								datasets: [
									{
										label: "Ukupno",
										data: [
											staticData.services.active,
											staticData.services.all - staticData.services.active,
										],
										backgroundColor: ["#6beba4", "#181921"],
										borderWidth: 9,
										borderColor: "#14151b",
										hoverBorderWidth: 5,
										borderRadius: 10,
									},
								],
							}}
							options={chartOptions}
						/>
					</div>
					<p>
						Broj <b style={{ color: "#6beba4" }}>aktivnih</b> servisa:{" "}
						{staticData.services.active}
					</p>
				</div>
				<div className="chart tab">
					<div>
						<Doughnut
							data={{
								labels: ["Obavljeni servisi", "Ostalo"],
								datasets: [
									{
										label: "Ukupno",
										data: [
											staticData.services.finished,
											staticData.services.all - staticData.services.finished,
										],
										backgroundColor: ["#4bc0c0", "#181921"],
										borderWidth: 9,
										borderColor: "#14151b",
										hoverBorderWidth: 5,
										borderRadius: 10,
									},
								],
							}}
							options={chartOptions}
						/>
					</div>
					<p>
						Broj <b style={{ color: "#4bc0c0" }}>obavljenih</b> servisa:{" "}
						{staticData.services.finished}
					</p>
				</div>
				<div className="chart tab">
					<div>
						<Doughnut
							data={{
								labels: ["Servisi na čekanju", "Ostalo"],
								datasets: [
									{
										label: "Ukupno",
										data: [
											staticData.services.idle,
											staticData.services.all - staticData.services.idle,
										],
										backgroundColor: ["#4b86c0", "#181921"],
										borderWidth: 9,
										borderColor: "#14151b",
										hoverBorderWidth: 5,
										borderRadius: 10,
									},
								],
							}}
							options={chartOptions}
						/>
					</div>
					<p>
						Broj servisa <b style={{ color: "#4b86c0" }}>na čekanju</b>:{" "}
						{staticData.services.idle}
					</p>
				</div>
			</div>

			<div className="latest-services tab users-table-div">
				<h3 style={{ marginTop: "20px" }}>Posljednji servisi</h3>
				<Table
					loading={loading}
					className="services"
					labels={[
						{ text: "ID", key: "_id" },
						{ text: "Opis", key: "description" },
						{
							text: "Status",
							key: "status",
							status: ["Izvršeno", ["Na čekanju", "Aktivan"], "Odbijeno"],
						},
						{ text: "hitno", key: "urgently" },
					]}
					data={data}
					expanded={(el) => {
						if (el?.computer?._id === undefined) return <></>;
						return (
							<div className="data-review">
								<h6 className="title">Podatci o servisu</h6>
								<h6>
									Servis je kreiran:
									<span>
										{new Date(el.created).toLocaleString("hr-HR", {
											year: "numeric",
											month: "numeric",
											day: "numeric",
											hour: "numeric",
											minute: "numeric",
											second: "numeric",
										})}
									</span>
								</h6>
								<h6 className="title">Opis kvara:</h6>
								<h6>{el.description}</h6>
								<h6 className="title">Podatci o korisniku</h6>
								<h6>
									ID korisnika: <span>{el.user._id}</span>
								</h6>
								<h6>
									Ime: <span>{el.user.name}</span>
								</h6>
								<h6>
									Prezime: <span>{el.user.lastName}</span>
								</h6>
								<h6>
									Email:<span>{el.user.email}</span>
								</h6>
								<h6 className="title">Podatci o računalu</h6>
								<h6>
									ID računala: <span>{el.computer._id}</span>
								</h6>
								<h6>
									Naziv računala: <span>{el.computer.computerName}</span>
								</h6>
								<h6>
									Serijski broj: <span>{el.computer.SN}</span>
								</h6>
								<h6>
									Garancija:
									<span>
										{el.computer.warranty.value +
											" " +
											el.computer.warranty.type}
									</span>
								</h6>
							</div>
						);
					}}
				/>
			</div>
		</>
	);
}

// Stranica sa korisnicima

function CreateNewUser({
	finishFunction = () => {},
	values = {},
	update = false,
}) {
	const [tab, updateTab] = useState({ active: 0, finished: 0 });
	const [hide, updateHide] = useState(false);
	const [error, updateError] = useState([false, false, false]);
	const { createNewUser, updateDataAPI, checkAvailableEmail } = useAPI();
	const [data, updateData] = useState(
		typeof values?._id === "undefined"
			? {
					name: "",
					lastName: "",
					email: "",
					computers: [],
					emailActive: false,
					role: 0,
			  }
			: {
					...values,
					role:
						values.role === "Serviser"
							? 1
							: values.role === "Administrator"
							? 2
							: 0,
			  }
	);

	const [check, updateCheck] = useState(false);

	useEffect(() => {
		if (hide) {
			data.role =
				data.role === 1
					? "Serviser"
					: data.role === 2
					? "Administrator"
					: "Korisnik";
			if (update && JSON.stringify(values) !== JSON.stringify(data)) {
				var obj = { _id: values._id, computers: data.computers };
				obj.computers = obj.computers.map((el) => el._id);
				Object.keys(values).forEach((key) => {
					if (key !== "computers" && data[key] !== values[key])
						obj[key] = data[key];
				});
				if (obj?.email !== undefined)
					obj.email = obj.email.includes("@ina.hr")
						? obj.email
						: obj.email + "@ina.hr";
				if (obj.email !== undefined && values.email !== obj.email)
					obj.oldEmail = values.email;

				async function testEmail() {
					if (
						await updateDataAPI({
							type: "USERS",
							data: obj,
						})
					)
						setTimeout(() => {
							finishFunction(true);
						}, 250);
					else {
						updateHide(false);
						updateData((old) => {
							return {
								...old,
								role:
									old.role === "Serviser"
										? 1
										: old.role === "Administrator"
										? 2
										: 0,
							};
						});
					}
				}
				if (obj._id && Object.keys(obj).length > 1) testEmail();
			} else if (tab.active === 1 && !update) {
				delete data.emailActive;
				data.computers = data.computers.map((el) => el._id);
				async function testEmail() {
					if (
						await createNewUser({
							...data,
							email: data.email.includes("@ina.hr")
								? data.email
								: data.email + "@ina.hr",
						})
					)
						setTimeout(() => {
							finishFunction(true);
						}, 250);
					else {
						updateHide(false);
						updateData((old) => {
							return {
								...old,
								role:
									old.role === "Serviser"
										? 1
										: old.role === "Administrator"
										? 2
										: 0,
							};
						});
					}
				}
				testEmail();
			} else
				setTimeout(() => {
					finishFunction(false);
				}, 250);
		}
	}, [hide]);

	useEffect(() => {
		updateEmail();
	}, [data.name, data.lastName]);

	function localize(str = "", filter = true) {
		str = str.split(" ");
		for (let i = 0; i < str.length; i++) {
			if (filter)
				str[i] = str[i]
					.replace(/š/gi, "s")
					.replace(/([čć])/gi, "c")
					.replace(/ž/gi, "z")
					.replace(/đ/gi, "d");
			str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1).toLowerCase();
		}
		return str.join(filter ? "" : " ");
	}

	const handleSubmit = (e) => {
		e.preventDefault();
		updateData((old) => {
			return {
				...old,
				name: localize(old.name, false),
				lastName: localize(old.lastName, false),
			};
		});
		let valid = error.findIndex((el) => el === false) === -1;
		if (!(tab.finished === 1 || valid)) {
			updateCheck(true);
			return;
		}
		updateCheck(false);
		updateTab({
			finished: 1,
			active: 1,
		});
		if (tab.active === 1) updateHide(true);
	};
	const forms = [
		<>
			<div className="input-holder ">
				<h5 className="header">Osnovni podatci o korisniku:</h5>
				<div className="row">
					<CustomInput
						value={data.name}
						onChange={(e) => {
							updateData((old) => {
								return { ...old, name: e.target.value };
							});
						}}
						valid={(data) => {
							updateError((old) => {
								return old.map((value, i) => {
									if (i === 0) return data;
									else return value;
								});
							});
						}}
						regex={[/[a-zA-ZčČćĆžŽŠš]+/i]}
						label="Ime:"
						placeholder="Ivan"
						id="user-name"
						errorMsg="Ovo polje je obavezno"
						check={check}
					/>
					<CustomInput
						value={data.lastName}
						onChange={(e) => {
							updateData((old) => {
								return { ...old, lastName: e.target.value };
							});
						}}
						valid={(data) => {
							updateError((old) => {
								return old.map((value, i) => {
									if (i === 1) return data;
									else return value;
								});
							});
						}}
						regex={[/[a-zA-ZčČćĆžŽŠš]+/i]}
						label="Prezime:"
						placeholder="Horvat"
						id="user-last-name"
						errorMsg="Ovo polje je obavezno"
						check={check}
					/>
				</div>
				<CustomInput
					value={data.email}
					onChange={(e) => {
						updateData((old) => {
							return {
								...old,
								email: e.target.value,
								emailActive: true,
							};
						});
					}}
					valid={(data) => {
						updateError((old) => {
							return old.map((value, i) => {
								if (i === 2) return data;
								else return value;
							});
						});
					}}
					regex={[/[a-zA-Z]+/i]}
					label="Email:"
					placeholder="ivan.horvat"
					id="user-email"
					errorMsg="Ovo polje je obavezno"
					check={check}
					email
				/>
				<h5 className="header">Vrsta korisničkog računa:</h5>
				<div className="roles">
					<label htmlFor="user" className="custom-radio">
						<input
							type="radio"
							id="user"
							name="role"
							onChange={(e) => {
								updateData((old) => {
									return { ...old, role: 0 };
								});
							}}
							checked={data.role === 0}
						/>
						<span>Korsinik</span>
					</label>
					<label htmlFor="servicer" className="custom-radio">
						<input
							type="radio"
							id="servicer"
							name="role"
							onChange={(e) => {
								updateData((old) => {
									return { ...old, role: 1 };
								});
							}}
							checked={data.role === 1}
						/>
						<span>Serviser</span>
					</label>
					<label htmlFor="admin" className="custom-radio">
						<input
							type="radio"
							id="admin"
							name="role"
							onChange={(e) => {
								updateData((old) => {
									return { ...old, role: 2 };
								});
							}}
							checked={data.role === 2}
						/>
						<span>Administrator</span>
					</label>
				</div>
			</div>
		</>,
		<>
			<h5 className="header add-computers">Zadužena računala:</h5>
			<ComputerSelect
				updateSelect={(select) => {
					updateData((old) => {
						return { ...old, computers: select };
					});
				}}
				update={{ value: values.computers, update: update }}
			/>
		</>,
	];

	async function updateEmail() {
		if (
			!(data.emailActive === false && data.name != "" && data.lastName !== "")
		)
			return;
		const localEmail = `${localize(data.name)}.${localize(data.lastName)}`;
		const end = await checkAvailableEmail(localEmail);
		const email = localEmail + (end === undefined ? "" : end);
		updateData((old) => {
			return {
				...old,
				email,
			};
		});
	}

	return (
		<div
			className="new-data"
			style={{
				animation: hide
					? "exitAnimation 250ms ease-out forwards"
					: "introAnimation 250ms ease-out forwards",
			}}
		>
			<div className="main-content">
				<div className="progress">
					<div className="line"></div>
					<div
						className={`step ${
							tab.active === 0 ? "active" : tab.active > 0 ? "finished" : ""
						}`}
					>
						<h5>1</h5>
						<h4>Općenito</h4>
					</div>
					<div
						className={`step ${
							tab.active === 1 ? "active" : tab.active > 1 ? "finished" : ""
						}`}
					>
						<h5>2</h5>
						<h4>Računala</h4>
					</div>
				</div>
				<div
					className="close-tab"
					onClick={() => {
						finishFunction(false);
					}}
				>
					<span> X</span>
				</div>
				<div className="content-data">
					<h3>
						{update ? "Uređivanje korisnika" : "Kreiranje novog korisnika"}
					</h3>
					<form
						className="new-data-input-div new-user-div"
						onSubmit={handleSubmit}
					>
						{forms[tab.active]}
						<div className="bottom-navigation">
							<button
								onClick={() => {
									updateTab((old) => {
										return { ...old, active: 0 };
									});
								}}
								disabled={tab.active === 0}
								type="button"
							>
								Prethodna
							</button>
							<button type="submit">
								{tab.active === 1 ? "Potvrdi" : "Dalje"}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}

function ComputerSelect({
	updateSelect = () => {},
	update = { value: "", update: "" },
}) {
	const { searchPC } = useAPI();
	const [computers, updateComputers] = useState({
		select: update.update ? update.value : [],
		list: [],
		filter: "",
	});

	useEffect(() => {
		updateSelect(computers.select);
	}, [computers.select]);

	return (
		<div className="computer-add">
			<label htmlFor="computer-add">
				Unesite serijski broj, naziv ili ID računala:
				{computers.select.length > 0 ? (
					<div className="selected-pc">
						{computers.select.map((el, i) => (
							<span
								key={"Selected-item-" + i}
								className={`item ${
									el?.status === "Ispravan"
										? "good"
										: el?.status === "Neispravan"
										? "bad"
										: el?.status === "Na servisu"
										? "ok"
										: ""
								}`}
							>
								{el.computerName}
								<div
									className="delete"
									onClick={() => {
										updateComputers((old) => {
											return {
												...old,
												select: old.select.filter((ell) => ell._id !== el._id),
											};
										});
									}}
								>
									X
								</div>
							</span>
						))}
					</div>
				) : null}
				<input
					value={computers.filter}
					className={computers.list.length > 0 ? "active" : ""}
					onChange={async (e) => {
						const value = e.target.value;
						const list =
							value !== ""
								? await searchPC({ filter: value, selected: computers.select })
								: [];
						updateComputers((old) => {
							return {
								...old,
								filter: value,
								list: list,
							};
						});
					}}
					type="text"
					id="computer-add"
					placeholder="#PC01"
					autoComplete="off"
				/>
			</label>
			{computers.list.map((el, i) => (
				<div
					key={el._id + "-" + i}
					className="select-computer-options"
					onClick={async () => {
						const arr = [...computers.select, el];
						const list = await searchPC({
							filter: computers.filter,
							selected: arr,
						});
						updateComputers((old) => {
							return {
								...old,
								select: arr,
								list: list,
							};
						});
					}}
				>
					<span className="name">{el.computerName}</span>
					<div>
						<span>ID: {el._id}</span>
						<span>SN: {el.SN}</span>
					</div>
				</div>
			))}
		</div>
	);
}

function Users() {
	const [filters, updateFilters] = useState({ search: "", role: 3, status: 2 });
	const [newUser, updateNerUser] = useState({
		active: false,
		value: "",
		update: false,
	});
	const [data, updateData] = useState([]);
	const { getData, updateDataAPI, deleteData, resetPassword } = useAPI();
	const [loading, updateLoading] = useState(true);

	useEffect(() => {
		let timer = setTimeout(() => {
			updateData([]);
			updateLoading(true);
			getData({
				type: "USERS",
				filters: filters,
				limit,
				resFunction: (data) => {
					updateData(data);
					updateLoading(false);
				},
			});
		}, 300);

		return () => {
			clearTimeout(timer);
		};
	}, [filters]);

	const updateTableData = () => {
		updateLoading(true);
		getData({
			type: "USERS",
			//filters: { status: filters.status, search: filters.search },
			resFunction: (data) => {
				updateData(data);
				updateLoading(false);
			},
		});
	};

	const loadMoreData = (updateLoad) => {
		getData({
			type: "USERS",
			filters: filters,
			lastElement: data.length,
			limit,
			resFunction: (data) => {
				updateLoad(data.length === limit);
				updateData((old) => {
					return [...old, ...data];
				});
			},
		});
	};

	const updateFiltersData = (key, value) => {
		updateFilters((old) => {
			return { ...old, [key]: value };
		});
	};

	return (
		<>
			{newUser.active ? (
				newUser.update ? (
					<CreateNewUser
						finishFunction={(changes) => {
							updateNerUser(() => {
								return { active: false, value: "", update: false };
							});
							if (changes) updateTableData();
						}}
						update={true}
						values={{
							...newUser.value,
							email: newUser.value.email.slice(0, -7),
						}}
					/>
				) : (
					<CreateNewUser
						finishFunction={(changes) => {
							updateNerUser(() => {
								return { active: false, value: "", update: false };
							});
							if (changes) updateTableData();
						}}
					/>
				)
			) : null}
			<div className="tolbox">
				<div className="column">
					<h6>Pretraga po klučnim riječima</h6>
					<div className="custom-input">
						{dashboardVectors.search}
						<input
							type="text"
							value={filters.search}
							onChange={(e) => {
								updateFiltersData("search", e.target.value);
							}}
							placeholder="Pretraga po imenu, prezimenu, ..."
						/>
					</div>
				</div>
				<div className="column role-selector">
					<h6>Vrsta računa</h6>
					<DropDownMenu
						data={["Korisnik", "Administrator", "Serviser", "Svi"]}
						active={filters.role}
						updateActive={(data) => {
							updateFiltersData("role", data);
						}}
					/>
				</div>
				<div className="column role-selector">
					<h6>Status računa</h6>
					<DropDownMenu
						data={["Aktivan", "Neaktivan", "Svi"]}
						active={filters.status}
						updateActive={(data) => {
							updateFiltersData("status", data);
						}}
					/>
				</div>
				<button
					className="create-new-button"
					onClick={() => {
						updateNerUser((old) => {
							return { ...old, active: true };
						});
					}}
				>
					Kreiraj korisnika
				</button>
			</div>
			<div className="users-table-div tab">
				<Table
					loadMoreData={loadMoreData}
					loading={loading}
					className="services"
					labels={[
						{ text: "ID", key: "_id" },
						{ text: "Ime", key: "name" },
						{ text: "Prezime", key: "lastName" },
						{
							text: "Status",
							key: "status",
							status: ["Aktivan", "", "Neaktivan"],
						},
					]}
					data={data}
					expanded={(el) => {
						const editUser = () => {
							console.log(el);
							updateNerUser((old) => {
								return { ...old, active: true, update: true, value: el };
							});
							console.log(el);
						};

						const changeUserState = () => {
							updateDataAPI({
								type: "USERS",
								data: {
									_id: el._id,
									status: el.status === "Aktivan" ? "Neaktivan" : "Aktivan",
								},
								status: true,
								resFunction: () => {
									updateTableData();
								},
							});
						};

						const deleteUser = () => {
							deleteData({
								type: "USER",
								_id: el._id,
								resFunction: () => {
									updateTableData();
								},
							});
						};

						const resetUser = () => {
							resetPassword({
								_id: el._id,
								resFunction: () => {
									updateTableData();
								},
							});
						};
						return (
							<div className="data-review">
								<div className="row">
									<h6 className="title">Općenito:</h6>
									<div className="button-holder">
										<button className="delete-button" onClick={deleteUser}>
											Ukloni korisnika
										</button>
										{el?.activated !== undefined ? (
											<button
												className="dectivate-button"
												onClick={changeUserState}
											>
												{el.status === "Aktivan"
													? "Deaktiviraj "
													: "Aktiviraj "}
												račun
											</button>
										) : null}
										{el?.activated !== undefined ? (
											<button className="dectivate-button" onClick={resetUser}>
												Resetiraj lozinku
											</button>
										) : null}
										<button className="create-new-button" onClick={editUser}>
											Uredi
										</button>
									</div>
								</div>
								<h6>
									Korisniči račun je kreiran:{" "}
									<span>
										{new Date(el.created).toLocaleString("hr-HR", {
											year: "numeric",
											month: "numeric",
											day: "numeric",
											hour: "numeric",
											minute: "numeric",
											second: "numeric",
										})}
									</span>
								</h6>
								{el?.activated !== undefined ? (
									<h6>
										Korisniči račun je aktiviran:{" "}
										<span>
											{new Date(el.activated).toLocaleString("hr-HR", {
												year: "numeric",
												month: "numeric",
												day: "numeric",
												hour: "numeric",
												minute: "numeric",
												second: "numeric",
											})}
										</span>
									</h6>
								) : null}
								<h6>
									Ime: <span>{el.name}</span>
								</h6>
								<h6>
									Prezime: <span>{el.lastName}</span>
								</h6>
								<h6>
									Email:<span>{el.email}</span>
								</h6>
								<h6>
									Vrsta ovlasti:<span>{el.role}</span>
								</h6>
								<h6 className="title">
									Zadužena računala ({el.computers.length}):
								</h6>
								{el.computers.map((ell) => (
									<h6 key={ell._id}>
										ID računala: <span>{ell._id}</span>
									</h6>
								))}
							</div>
						);
					}}
				/>
			</div>
		</>
	);
}

export function CustomInput({
	onChange = () => {},
	value = "",
	id = "",
	label = "",
	regex = [0],
	regexType = "AND",
	placeholder = "",
	errorMsg = "",
	type = "text",
	check = false,
	email = undefined,
	valid = () => {},
}) {
	const [states, updateStates] = useState({
		error: false,
		activated: regex[0] === 0,
	});

	useEffect(() => {
		if (regex[0] !== 0) {
			if (regexType === "AND")
				var isValid = regex.reduce(
					(test, reg) => test && reg.test(value),
					true
				);
			else
				var isValid = regex.reduce(
					(test, reg) => test || reg.test(value),
					false
				);
		} else {
			var isValid = true;
		}
		valid(isValid);
		if (states.activated || check)
			updateStates((old) => {
				return { ...old, error: !isValid };
			});
	}, [value, check]);
	if (email !== undefined)
		return (
			<label htmlFor={id}>
				{label}
				<div className="email-input">
					<input
						className="email-input-element"
						value={value}
						onChange={onChange}
						onClick={() => {
							updateStates((old) => {
								return { ...old, activated: true };
							});
						}}
						type={type}
						id={id}
						placeholder={placeholder}
						autoComplete="off"
					/>

					<span>@ina.hr</span>
				</div>
				{states.error && errorMsg !== "" ? (
					<p className="error">{errorMsg}</p>
				) : null}
			</label>
		);
	else
		return (
			<label htmlFor={id}>
				{label}
				<input
					value={value}
					onChange={onChange}
					onClick={() => {
						updateStates((old) => {
							return { ...old, activated: true };
						});
					}}
					type={type}
					id={id}
					placeholder={placeholder}
					autoComplete="off"
				/>
				{states.error && errorMsg !== "" ? (
					<p className="error">{errorMsg}</p>
				) : null}
			</label>
		);
}

function CustomRadio({
	onChange = () => {},
	value = "",
	id = "",
	label = "",
	regex = [0],
	regexType = "AND",
	placeholder = "",
	errorMsg = "",
	check = false,
	options = [{ label: "", onChange: () => {}, checked: false }],
	valid = () => {},
}) {
	const [states, updateStates] = useState({ error: false, activated: false });

	useEffect(() => {
		if (regex[0] !== 0) {
			if (regexType === "AND")
				var isValid = regex.reduce(
					(test, reg) => test && reg.test(value),
					true
				);
			else
				var isValid = regex.reduce(
					(test, reg) => test || reg.test(value),
					false
				);
		} else {
			var isValid = true;
		}

		valid(isValid);
		if (states.activated || check)
			updateStates((old) => {
				return { ...old, error: !isValid };
			});
	}, [value, check]);

	return (
		<label htmlFor={id}>
			{label}
			<div className="radio-select">
				<input
					value={value}
					onChange={onChange}
					onClick={() => {
						updateStates((old) => {
							return { ...old, activated: true };
						});
					}}
					type="text"
					id={id}
					placeholder={placeholder}
					autoComplete="off"
				/>

				{options.map((el, i) => (
					<label
						key={`${el}-option${i}`}
						htmlFor={`${id}-option-${i}`}
						className="custom-radio"
					>
						<input
							type="radio"
							id={`${id}-option-${i}`}
							name={id + "-options"}
							onChange={el.onChange}
							checked={el.checked}
						/>
						<span>{el.label}</span>
					</label>
				))}
			</div>
			{states.error && errorMsg !== "" ? (
				<p className="error">{errorMsg}</p>
			) : null}
		</label>
	);
}

// Stranica sa računalima
function CreateNewComputer({
	finishFunction = () => {},
	values = {},
	update = false,
}) {
	const [active, updateActive] = useState(0);
	const [hide, updateHide] = useState(false);
	const [error, updateError] = useState([false]);
	const { createNewComputer, updateDataAPI } = useAPI();
	const [data, updateData] = useState(
		typeof values?._id === "undefined"
			? {
					computerName: "",
					SN: "",
					warranty: { value: "", type: "Godine" },
					specs: {
						CPU: "",
						GPU: "",
						RAM: "",
						lastID: 0,
						storage: [{ id: 0, type: "SSD", size: "", valid: false }],
					},
			  }
			: {
					...values,
					specs: { ...values?.specs, lastID: values?.specs?.storage.length },
			  }
	);
	const [check, updateCheck] = useState(false);
	const [finished, updateFinished] = useState(0);
	const [monthsYear, updateMonthsYear] = useState([], []);

	useEffect(() => {
		if (hide) {
			delete data.lastID;
			data.warranty.type = data.warranty.type.toLowerCase();
			if (update) {
				if (JSON.stringify(values) !== JSON.stringify(data)) {
					let obj = { _id: values._id };
					Object.keys(values).forEach((key) => {
						if (data[key] !== values[key]) obj[key] = data[key];
					});
					updateDataAPI({
						type: "COMPUTERS",
						data: obj,
					});
					setTimeout(() => {
						finishFunction(true);
					}, 250);
				}
			} else if (finished === 2) {
				createNewComputer(data);
				setTimeout(() => {
					finishFunction(true);
				}, 250);
			}
		}
	}, [hide]);

	useEffect(() => {
		switch (active) {
			case 0:
				updateError(finished === 0 ? [false, false, false] : [true]);
				break;
			case 1:
				if (finished === 0) updateFinished(1);
				updateError(finished === 1 ? [false, false, false] : [true]);
				break;
			case 2:
				if (finished === 1) updateFinished(2);
				updateError([true]);
				break;
			default:
				break;
		}
	}, [active]);

	useEffect(() => {
		const num = data.warranty.value % 10;
		updateMonthsYear([
			num === 1 ? "Mjesec" : num > 1 && num < 5 ? "Mjeseca" : "Mjeseci",
			num === 1 ? "Godina" : num > 1 && num < 5 ? "Godine" : "Godina",
		]);
	}, [data.warranty.value]);

	const handleSubmit = (e) => {
		e.preventDefault();
		let valid = error.findIndex((el) => el === false) === -1;
		if (active === 1) {
			valid &&= data.specs.storage.findIndex((el) => el.valid === false) === -1;
		}
		if (!(finished === 2 || valid)) {
			updateCheck(true);
			return;
		}
		updateCheck(false);
		updateActive((old) => (old !== 2 ? old + 1 : 2));
		if (active === 2) updateHide(true);
	};

	const addNew = (i) => {
		updateData((old) => {
			if (i === old.specs.storage.length - 1)
				var tempStorage = [
					...old.specs.storage,
					{
						id: old.specs.lastID + 1,
						type: "SSD",
						size: "",
					},
				];
			else {
				var tempStorage = [...old.specs.storage];
				tempStorage.splice(i + 1, 0, {
					id: old.specs.lastID + 1,
					type: "SSD",
					size: "",
				});
			}
			return {
				...old,
				specs: {
					...old.specs,
					lastID: old.specs.lastID + 1,
					storage: tempStorage,
				},
			};
		});
	};

	const forms = [
		<>
			<h5>Unos osnovnih podataka</h5>
			<div className="input-holder">
				<CustomInput
					value={data.computerName}
					onChange={(e) => {
						updateData((old) => {
							return { ...old, computerName: e.target.value };
						});
					}}
					valid={(data) => {
						updateError((old) => {
							return old.map((value, i) => {
								if (i === 0) return data;
								else return value;
							});
						});
					}}
					regex={[/[a-zA-Z]+/i]}
					label="Naziv računala:"
					placeholder="PC01"
					id="PC-name"
					errorMsg="Ovo polje je obavezno"
					check={check}
				/>
				<CustomInput
					value={data.SN}
					onChange={(e) => {
						updateData((old) => {
							return { ...old, SN: e.target.value };
						});
					}}
					valid={(data) => {
						updateError((old) => {
							return old.map((value, i) => {
								if (i === 1) return data;
								else return value;
							});
						});
					}}
					regex={[/[a-zA-Z0-9]+/i]}
					label="Serijski broj računala:"
					placeholder="4CE0460D0G"
					id="PC-SN"
					errorMsg="Ovo polje je obavezno"
					check={check}
				/>
				<CustomRadio
					label="Duljina garancije:"
					id="pc-warranty"
					regex={[/^[0-9]+$/i]}
					onChange={(e) => {
						updateData((old) => {
							return {
								...old,
								warranty: { ...old.warranty, value: e.target.value },
							};
						});
					}}
					valid={(data) => {
						updateError((old) => {
							return old.map((value, i) => {
								if (i === 2) return data;
								else return value;
							});
						});
					}}
					value={data.warranty.value}
					placeholder="8"
					options={[
						{
							label: monthsYear[0],
							onChange: () => {
								updateData((old) => {
									return {
										...old,
										warranty: { ...old.warranty, type: monthsYear[0] },
									};
								});
							},
							checked: data.warranty.type[0].toUpperCase() === "M",
						},
						{
							label: monthsYear[1],
							onChange: () => {
								updateData((old) => {
									return {
										...old,
										warranty: { ...old.warranty, type: monthsYear[1] },
									};
								});
							},
							checked: data.warranty.type[0].toUpperCase() === "G",
						},
					]}
					check={check}
					errorMsg="Ovo polje je obavezno"
				/>
			</div>
		</>,
		<>
			<h5>Unos specifikacija računala</h5>
			<div className="form-holder">
				<div className="input-holder">
					<CustomInput
						value={data.specs.CPU}
						onChange={(e) => {
							updateData((old) => {
								return {
									...old,
									specs: { ...old.specs, CPU: e.target.value },
								};
							});
						}}
						regex={[/[a-z]+/i]}
						label="Procesor:"
						placeholder="Intel i5"
						id="pc-CPU"
						errorMsg="Ovo polje je obavezno"
						check={check}
						valid={(data) => {
							updateError((old) => {
								return old.map((value, i) => {
									if (i === 0) return data;
									else return value;
								});
							});
						}}
					/>
					<CustomInput
						value={data.specs.GPU}
						onChange={(e) => {
							updateData((old) => {
								return {
									...old,
									specs: { ...old.specs, GPU: e.target.value },
								};
							});
						}}
						label="Grafčka kartica:"
						placeholder="Nvidia GTX 1050"
						id="pc-GPU"
						errorMsg="Ovo polje je obavezno"
						check={check}
						valid={(data) => {
							updateError((old) => {
								return old.map((value, i) => {
									if (i === 1) return data;
									else return value;
								});
							});
						}}
					/>
					<CustomInput
						value={data.specs.RAM}
						onChange={(e) => {
							updateData((old) => {
								return {
									...old,
									specs: { ...old.specs, RAM: e.target.value },
								};
							});
						}}
						regex={[/^[0-9]+$/i]}
						label="Količina RAM-a (u GB):"
						placeholder="16"
						id="pc-RAM"
						errorMsg="Ovo polje je obavezno"
						check={check}
						valid={(data) => {
							updateError((old) => {
								return old.map((value, i) => {
									if (i === 2) return data;
									else return value;
								});
							});
						}}
					/>
					<div className="column">
						<span className="title">Količina memorije za pohranu:</span>

						{data.specs.storage.map((el, i) => (
							<div className="row editable-select" key={"disk-" + i}>
								<CustomRadio
									id={`pc-disk-${i}`}
									errorMsg={`Unos mora jednom od ova 2 oblika: 512 GB ili 512 TB`}
									regexType="OR"
									regex={[/^[0-9]+\sGB$/, /^[0-9]+\sTB$/]}
									onChange={(e) => {
										updateData((old) => {
											return {
												...old,
												specs: {
													...old.specs,
													storage: old.specs.storage.map((ell) => {
														if (ell.id === el.id)
															return {
																...ell,
																size: e.target.value.toUpperCase(),
															};
														else return ell;
													}),
												},
											};
										});
									}}
									valid={(data) => {
										updateData((old) => {
											return {
												...old,
												specs: {
													...old.specs,
													storage: old.specs.storage.map((ell) => {
														if (ell.id === el.id)
															return { ...ell, valid: data };
														else return ell;
													}),
												},
											};
										});
									}}
									value={el.size}
									placeholder="512 GB"
									options={[
										{
											label: "SSD",
											onChange: () => {
												updateData((old) => {
													return {
														...old,
														specs: {
															...old.specs,
															storage: old.specs.storage.map((ell) => {
																if (ell.id === el.id)
																	return { ...ell, type: "SSD" };
																else return ell;
															}),
														},
													};
												});
											},
											checked: el.type === "SSD",
										},
										{
											label: "HDD",
											onChange: () => {
												updateData((old) => {
													return {
														...old,
														specs: {
															...old.specs,
															storage: old.specs.storage.map((ell) => {
																if (ell.id === el.id)
																	return { ...ell, type: "HDD" };
																else return ell;
															}),
														},
													};
												});
											},
											checked: el.type === "HDD",
										},
									]}
									check={check}
								/>
								{i === 0 ? (
									<span
										className="add-new"
										onClick={() => {
											addNew(i);
										}}
									>
										+
									</span>
								) : (
									<>
										<span
											className="remove-new"
											onClick={() => {
												updateData((old) => {
													return {
														...old,

														specs: {
															...old.specs,
															storage: old.specs.storage.filter(
																(ell) => ell.id !== el.id
															),
														},
													};
												});
											}}
										>
											<span>-</span>
										</span>
										<span
											className="add-new"
											onClick={() => {
												addNew(i);
											}}
										>
											+
										</span>
									</>
								)}
							</div>
						))}
					</div>
				</div>
			</div>
		</>,
		<>
			<h5>Pregled unesenih podataka</h5>
			<div className="data-review">
				<h6 className="title">Općenito:</h6>
				<h6>
					Naziv računala: <span>{data.computerName}</span>
				</h6>
				<h6>
					Serijski broj: <span>{data.SN}</span>
				</h6>
				<h6>
					Garancija:
					<span>
						{data.warranty.value + " " + data.warranty.type.toLocaleLowerCase()}
					</span>
				</h6>
				<h6 className="title">Specifikacije:</h6>
				<h6>
					Procesor: <span>{data.specs.CPU}</span>
				</h6>
				<h6>
					Grafička kartica:
					<span>{data.specs.GPU !== "" ? data.specs.GPU : "nema"}</span>
				</h6>
				<h6>
					Količina RAM-a: <span>{data.specs.RAM + " GB"}</span>
				</h6>
				<h6>
					Prostor za pohranu:
					<span>
						{"SSD: " +
							data.specs.storage
								.reduce(
									(sum, el) =>
										el.type === "SSD"
											? sum +
											  (el.size.includes("GB")
													? parseInt(el.size.trim().slice(0, -3))
													: el.size.includes("TB")
													? parseInt(el.size.trim().slice(0, -3)) * 1000
													: 0)
											: sum,
									0
								)
								.toLocaleString("en-US")
								.replace(",", " ") +
							" GB"}
						<br />
						{"HDD: " +
							data.specs.storage
								.reduce(
									(sum, el) =>
										el.type === "HDD"
											? sum +
											  (el.size.includes("GB")
													? parseInt(el.size.trim().slice(0, -3))
													: el.size.includes("TB")
													? parseInt(el.size.trim().slice(0, -3)) * 1000
													: 0)
											: sum,
									0
								)
								.toLocaleString("en-US")
								.replace(",", " ") +
							" GB"}
					</span>
				</h6>
			</div>
		</>,
	];
	return (
		<div
			className="new-data"
			style={{
				animation: hide
					? "exitAnimation 250ms ease-out forwards"
					: "introAnimation 250ms ease-out forwards",
			}}
		>
			<div className="main-content">
				<div className="progress">
					<div className="line"></div>
					<div
						className={`step ${
							active === 0 ? "active" : active > 0 ? "finished" : ""
						}`}
					>
						<h5>1</h5>
						<h4>Općenito</h4>
					</div>
					<div
						className={`step ${
							active === 1 ? "active" : active > 1 ? "finished" : ""
						}`}
					>
						<h5>2</h5>
						<h4>Specifikacije</h4>
					</div>
					<div className={`step ${active === 2 ? "active" : ""}`}>
						<h5>3</h5>
						<h4>Pregled</h4>
					</div>
				</div>
				<div
					className="close-tab"
					onClick={() => {
						finishFunction(false);
					}}
				>
					<span> X</span>
				</div>
				<div className="content-data">
					<h3>{update ? "Uređivanje računala" : "Kreiranje novog računala"}</h3>
					<form className="new-data-input-div" onSubmit={handleSubmit}>
						{forms[active]}
						<div className="bottom-navigation">
							<button
								onClick={() => {
									updateActive((old) => (old !== 0 ? old - 1 : 0));
								}}
								disabled={active === 0}
								type="button"
							>
								Prethodna
							</button>
							<button type="submit">
								{active === 2 ? "Potvrdi" : "Dalje"}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}

function Computers() {
	const [filters, updateFilters] = useState({ search: "", status: 2 });
	const { getData, deleteData } = useAPI();
	const [newComputer, updateNewComputer] = useState({
		update: false,
		show: false,
		data: {},
	});
	const [loading, updateLoading] = useState(true);
	const [data, updateData] = useState([]);
	const role = useSelector((state) => state.user.value.role);

	useEffect(() => {
		let timer = setTimeout(() => {
			updateData([]);
			updateLoading(true);
			getData({
				type: "COMPUTERS",
				filters: filters,
				limit,
				resFunction: (data) => {
					updateData(data);
					updateLoading(false);
				},
			});
		}, 300);

		return () => {
			clearTimeout(timer);
		};
	}, [filters]);

	const loadMoreData = (updateLoad) => {
		getData({
			type: "COMPUTERS",
			filters: filters,
			lastElement: data.length,
			limit,
			resFunction: (data) => {
				updateLoad(data.length === limit);
				updateData((old) => {
					return [...old, ...data];
				});
			},
		});
	};

	const updateFiltersData = (key, value) => {
		updateFilters((old) => {
			return { ...old, [key]: value };
		});
	};

	return (
		<>
			{role === "Administrator" && newComputer.show ? (
				<CreateNewComputer
					finishFunction={(valid) => {
						updateNewComputer({ show: false, update: false, data: {} });
						if (!valid) return;
						setTimeout(async () => {
							updateLoading(true);
							getData({
								type: "COMPUTERS",
								resFunction: (data) => {
									updateData(data);
									updateLoading(false);
								},
							});
						}, 500);
					}}
					values={newComputer?.data}
					update={newComputer.update}
				/>
			) : null}
			<div className="tolbox computer-toolbox">
				<div className="column">
					<h6>Pretraga po klučnim riječima</h6>
					<div className="custom-input">
						{dashboardVectors.search}
						<input
							type="text"
							value={filters.search}
							onChange={(e) => {
								updateFiltersData("search", e.target.value);
							}}
							placeholder="Naziv, SN ili ID"
						/>
					</div>
				</div>
				<div className="column role-selector">
					<h6>Status računala</h6>
					<DropDownMenu
						data={["Ispravan", "Na servisu", "Svi"]}
						active={filters.status}
						updateActive={(data) => {
							updateFiltersData("status", data);
						}}
					/>
				</div>
				{role === "Administrator" ? (
					<button
						className="create-new-button"
						onClick={() => {
							updateNewComputer((old) => {
								return { ...old, show: true };
							});
						}}
					>
						Kreiraj novo Računalo
					</button>
				) : null}
			</div>
			<div className="users-table-div tab">
				<Table
					loadMoreData={loadMoreData}
					className="services"
					loading={loading}
					labels={[
						{ text: "ID", key: "_id" },
						{ text: "Naziv", key: "computerName" },
						{ text: "Serijski broj", key: "SN" },
						{
							text: "Status",
							key: "status",
							status: ["Ispravan", "Na servisu"],
						},
					]}
					data={data}
					expanded={(el) => {
						const editComputer = () => {
							updateNewComputer((old) => {
								return { ...old, show: true, update: true, data: el };
							});
						};

						const deleteComputer = () => {
							updateLoading(true);
							deleteData({
								type: "COMPUTER",
								_id: el._id,
								resFunction: () => {
									getData({
										type: "COMPUTERS",
										filters: { status: filters.status, search: filters.search },
										resFunction: (data) => {
											updateData(data);
											updateLoading(false);
										},
									});
								},
							});
						};

						return (
							<div className="data-review">
								<div className="row">
									<h6 className="title">Općenito:</h6>
									{role === "Administrator" ? (
										<div className="button-holder">
											{el.status !== "Na servisu" ? (
												<button
													className="delete-button"
													onClick={deleteComputer}
												>
													Ukloni računalo
												</button>
											) : null}

											<button
												className="create-new-button"
												onClick={editComputer}
											>
												Uredi
											</button>
										</div>
									) : null}
								</div>
								<h6>
									Naziv računala: <span>{el.computerName}</span>
								</h6>
								<h6>
									Serijski broj: <span>{el.SN}</span>
								</h6>
								<h6>
									Garancija:
									<span>{el.warranty.value + " " + el.warranty.type}</span>
								</h6>
								<h6 className="title">Specifikacije:</h6>
								<h6>
									Procesor: <span>{el.specs.CPU}</span>
								</h6>
								<h6>
									Grafička kartica:
									<span>{el.specs.GPU !== "" ? el.specs.GPU : "nema"}</span>
								</h6>
								<h6>
									Količina RAM-a: <span>{el.specs.RAM + " GB"}</span>
								</h6>
								<h6>
									Prostor za pohranu:
									<span>
										{"SSD: " +
											el.specs.storage
												.reduce(
													(sum, ell) =>
														ell.type === "SSD"
															? sum +
															  (ell.size.includes("GB")
																	? parseInt(ell.size.trim().slice(0, -3))
																	: ell.size.includes("TB")
																	? parseInt(ell.size.trim().slice(0, -3)) *
																	  1000
																	: 0)
															: sum,
													0
												)
												.toLocaleString("en-US")
												.replace(",", " ") +
											" GB"}
										<br />
										{"HDD: " +
											el.specs.storage
												.reduce(
													(sum, ell) =>
														ell.type === "HDD"
															? sum +
															  (ell.size.includes("GB")
																	? parseInt(ell.size.trim().slice(0, -3))
																	: ell.size.includes("TB")
																	? parseInt(ell.size.trim().slice(0, -3)) *
																	  1000
																	: 0)
															: sum,
													0
												)
												.toLocaleString("en-US")
												.replace(",", " ") +
											" GB"}
									</span>
								</h6>
							</div>
						);
					}}
				/>
			</div>
		</>
	);
}

// Stranica sa servisima

function CreateNewService({ finishFunction = () => {} }) {
	const [tab, updateTab] = useState({ active: 0, finished: 0 });
	const [hide, updateHide] = useState(false);
	const { searchUser, createNewService } = useAPI();
	const defaultState = {
		_id: "",
		name: "",
		lastName: "",
		email: "",
		urgently: false,
		computer: "",
		description: "",
		filter: "",
		list: [],
	};
	const [data, updateData] = useState(defaultState);
	const [check, updateCheck] = useState(false);

	const getNewData = () => {
		searchUser({
			resFunction: (tempData) => {
				updateData((old) => {
					return {
						...old,
						_id: tempData._id,
						name: tempData.name,
						lastName: tempData.lastName,
						email: tempData.email,
					};
				});
			},
		});
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		let valid =
			(tab.active === 0 && data.computer?._id !== undefined) ||
			(tab.active === 1 && data.description !== "");
		if (!valid) {
			updateCheck(true);
			return;
		}
		updateCheck(false);
		updateTab({
			finished: 1,
			active: 1,
		});
		if (tab.active === 1 && valid) updateHide(true);
	};

	const getPC = async (value) => {
		const list =
			value !== ""
				? await searchUser({
						filter: value,
						computersOnly: true,
						selectedComputer: data.computer,
				  })
				: [];

		updateData((old) => {
			return { ...old, list: list };
		});
	};

	useEffect(() => {
		getPC(data.filter);
	}, [data.filter]);

	const forms = [
		<>
			<div className="input-holder services-div">
				<h5 className="header">Osnovni podatci o korisniku:</h5>
				<h6>
					Ime: <span>{data.name}</span>
				</h6>
				<h6>
					Prezime: <span>{data.lastName}</span>
				</h6>
				<h6>
					Kontakt: <span>{data.email}</span>
				</h6>
				<div className="row urgently-select">
					<h6>
						Servis je <span>hitan</span>:
					</h6>
					<label htmlFor="urgently-n" className="custom-radio">
						<input
							type="radio"
							id="urgently-n"
							name="urgently"
							onChange={() => {
								updateData((old) => {
									return {
										...old,
										urgently: true,
									};
								});
							}}
							checked={data.urgently}
						/>
						<span>DA</span>
					</label>
					<label htmlFor="urgently-y" className="custom-radio">
						<input
							type="radio"
							id="urgently-y"
							name="urgently"
							onChange={() => {
								updateData((old) => {
									return {
										...old,
										urgently: false,
									};
								});
							}}
							checked={!data.urgently}
						/>
						<span>NE</span>
					</label>
				</div>
				{data.computer?._id !== undefined ? (
					<div className="input-holder selected-pc-service">
						<h5 className="header">Odabrano računalo:</h5>
						<h6>
							Status: <span>{data.computer.status}</span>
						</h6>
						<div
							className={`services-selected item ${
								data.computer.status === "Ispravan"
									? "good"
									: data.computer.status === "Na servisu"
									? "ok"
									: ""
							}`}
						>
							<span className="name">{data.computer.computerName}</span>
							<span>ID: {data.computer._id}</span>
							<span>SN: {data.computer.SN}</span>
						</div>
						<p
							onClick={() => {
								updateData((old) => {
									return {
										...old,
										computer: undefined,
									};
								});
							}}
						>
							Odabei drugo računalo
						</p>
					</div>
				) : (
					<div className="computer-add">
						<label htmlFor="computer-add">
							Unesite serijski broj, naziv ili ID računala:
							<input
								value={data.filter}
								className={data.list.length > 0 ? "active" : ""}
								onChange={(e) => {
									updateData((old) => {
										return {
											...old,
											filter: e.target.value,
										};
									});
								}}
								type="text"
								id="computer-add"
								placeholder="#PC01"
								autoComplete="off"
								autoFocus
							/>
						</label>
						{data.list.map((el, i) => (
							<div
								key={el._id + "-" + i}
								onClick={async () => {
									updateCheck(false);
									updateData((old) => {
										return {
											...old,
											computer: el,
											filter: "",
											list: [],
										};
									});
								}}
								className="select-computer-options"
							>
								<span className="name">{el.computerName}</span>
								<div>
									<span>ID: {el._id}</span>
									<span>SN: {el.SN}</span>
								</div>
							</div>
						))}
					</div>
				)}
				{check ? (
					<p
						style={{ marginTop: "auto", textAlign: "center" }}
						className="error"
					>
						Potrebno je odabrati računalo
					</p>
				) : null}
			</div>
		</>,
		<>
			<h5 className="header">Opis kvara: </h5>
			<textarea
				placeholder="Npr. Računalo se ne može povezati sa internetom"
				className="service-textarea"
				onChange={(e) => {
					updateData((old) => {
						return {
							...old,
							description: e.target.value,
						};
					});
				}}
			></textarea>
			{check ? (
				<p style={{ marginTop: "auto", textAlign: "center" }} className="error">
					Potrebno je opisati kvar na račaunalu
				</p>
			) : null}
		</>,
	];

	useEffect(() => {
		if (hide) {
			if (data?._id !== "" && data?.computer !== "") {
				const obj = {
					user: data._id,
					urgently: data.urgently,
					computer: data.computer._id,
					description: data.description,
				};
				createNewService(obj);
			}
			setTimeout(() => {
				finishFunction(true);
			}, 250);
		}
	}, [hide]);

	useEffect(getNewData, []);

	return (
		<div
			className="new-data"
			style={{
				animation: hide
					? "exitAnimation 250ms ease-out forwards"
					: "introAnimation 250ms ease-out forwards",
			}}
		>
			<div className="main-content">
				<div className="progress">
					<div className="line"></div>
					<div
						className={`step ${
							tab.active === 0 ? "active" : tab.active > 0 ? "finished" : ""
						}`}
					>
						<h5>1</h5>
						<h4>Općenito</h4>
					</div>
					<div
						className={`step ${
							tab.active === 1 ? "active" : tab.active > 1 ? "finished" : ""
						}`}
					>
						<h5>2</h5>
						<h4>Kvar</h4>
					</div>
				</div>
				<div
					className="close-tab"
					onClick={() => {
						finishFunction(false);
					}}
				>
					<span> X</span>
				</div>
				<div className="content-data">
					<h3>Kreiranje zahtijva za servis</h3>
					<form
						className="new-data-input-div new-user-div"
						onSubmit={handleSubmit}
					>
						{forms[tab.active]}
						<div className="bottom-navigation">
							<button
								onClick={() => {
									updateTab((old) => {
										return { ...old, active: 0 };
									});
								}}
								disabled={tab.active === 0}
								type="button"
							>
								Prethodna
							</button>
							<button type="submit">
								{tab.active === 1 ? "Potvrdi" : "Dalje"}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}

function HandleService({ service = {}, finishFunction = () => {} }) {
	const [tab, updateTab] = useState({ active: 0, finished: 0 });
	const [hide, updateHide] = useState(false);
	const [data, updateData] = useState({ ...service, accepted: undefined });
	const [check, updateCheck] = useState(false);
	const { updateDataAPI } = useAPI();

	useEffect(() => {
		if (hide) {
			if (data.accepted !== undefined)
				updateDataAPI({
					type: "SERVICE",
					data: { _id: data._id, accepted: data.accepted },
				});
			setTimeout(() => {
				finishFunction(data.accepted !== undefined);
			}, 250);
		}
	}, [hide]);

	const handleSubmit = (e) => {
		e.preventDefault();
		updateTab({
			finished: 1,
			active: 1,
		});
		if (tab.active === 1) updateHide(true);
	};
	const forms = [
		<>
			<div className="input-holder services-div">
				<h5 className="header">Osnovni podatci o korisniku:</h5>
				<h6>
					Ime: <span>{data.user.name}</span>
				</h6>
				<h6>
					Prezime: <span>{data.user.lastName}</span>
				</h6>
				<h6>
					Kontakt: <span>{data.user.email}</span>
				</h6>
				<h6>
					Servis je hitan: <span>{data.urgently.toUpperCase()}</span>
				</h6>
				<h5 className="header">Osnovni podatci o računalu:</h5>

				<h6>
					Serijski broj: <span>{data.computer.SN}</span>
				</h6>
			</div>
		</>,
		<>
			<h5 className="header">Opis kvara: </h5>
			<textarea
				className="service-textarea"
				readOnly
				value={data.description}
				style={{ height: "max-content" }}
			></textarea>
			{check ? (
				<p style={{ marginTop: "auto", textAlign: "center" }} className="error">
					Potrebno je opisati kvar na račaunalu
				</p>
			) : null}
		</>,
	];

	return (
		<div
			className="new-data"
			style={{
				animation: hide
					? "exitAnimation 250ms ease-out forwards"
					: "introAnimation 250ms ease-out forwards",
			}}
		>
			<div className="main-content">
				<div className="progress">
					<div className="line"></div>
					<div
						className={`step ${
							tab.active === 0 ? "active" : tab.active > 0 ? "finished" : ""
						}`}
					>
						<h5>1</h5>
						<h4>Općenito</h4>
					</div>
					<div
						className={`step ${
							tab.active === 1 ? "active" : tab.active > 1 ? "finished" : ""
						}`}
					>
						<h5>2</h5>
						<h4>Kvar</h4>
					</div>
				</div>
				<div
					className="close-tab"
					onClick={() => {
						finishFunction(false);
					}}
				>
					<span> X</span>
				</div>
				<div className="content-data">
					<h3>Pregled servisa: {data._id}</h3>
					<form
						className="new-data-input-div new-user-div"
						onSubmit={handleSubmit}
					>
						{forms[tab.active]}
						<div className="bottom-navigation">
							{tab.active > 0 ? (
								<button
									onClick={() => {
										updateTab((old) => {
											return { ...old, active: 0 };
										});
									}}
									disabled={tab.active === 0}
									type="button"
								>
									Prethodna
								</button>
							) : (
								<span></span>
							)}
							<div className="row">
								{tab.active === 1 ? (
									<button
										onClick={() => {
											updateData((old) => {
												return { ...old, accepted: 0 };
											});
										}}
										type="submit"
										className="reject-service"
									>
										Odbij
									</button>
								) : null}
								<button
									type="submit"
									onClick={() => {
										if (tab.active === 1)
											updateData((old) => {
												return { ...old, accepted: 1 };
											});
									}}
								>
									{tab.active === 1 ? "Prihvati" : "Dalje"}
								</button>
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}

function Services() {
	const [filters, updateFilters] = useState({ search: "", active: 4 });
	const [data, updateData] = useState([]);
	const [showNewService, updateShowNewService] = useState(false);
	const [loading, updateLoading] = useState(true);
	const [handleService, updateHandleService] = useState({
		service: {},
		active: false,
	});
	const [finishService, updateFinishService] = useState({
		service: {},
		active: false,
	});

	const { getData, searchPC, updateDataAPI } = useAPI();
	const role = useSelector((state) => state.user.value.role);

	useEffect(() => {
		let timer = setTimeout(() => {
			updateData([]);
			updateLoading(true);
			getData({
				type: "SERVICES",
				filters: filters,
				limit,
				resFunction: (data) => {
					updateData(data);
					updateLoading(false);
				},
			});
		}, 300);

		return () => {
			clearTimeout(timer);
		};
	}, [filters]);

	const updateFiltersData = (key, value) => {
		updateFilters((old) => {
			return { ...old, [key]: value };
		});
	};

	const loadMoreData = (updateLoad) => {
		getData({
			type: "SERVICES",
			filters: filters,
			lastElement: data.length,
			limit,
			resFunction: (data) => {
				updateLoad(data.length === limit);
				updateData((old) => {
					return [...old, ...data];
				});
			},
		});
	};

	return (
		<>
			{finishService.active ? (
				<CreateNewComputer
					values={finishService.service}
					update={true}
					service={true}
					finishFunction={(success) => {
						if (success) {
							updateLoading(true);

							updateDataAPI({
								type: "SERVICE",
								data: {
									_id: finishService.service.serviceID,
									accepted: 3,
								},
								resFunction: () => {
									getData({
										type: "SERVICES",
										resFunction: (data) => {
											updateLoading(false);
											updateData(data);
										},
									});
								},
							});
						}
						updateFinishService({
							service: {},
							active: false,
						});
					}}
				/>
			) : null}
			{handleService.active ? (
				<HandleService
					service={handleService.service}
					finishFunction={(success) => {
						if (success) {
							updateLoading(true);
							getData({
								type: "SERVICES",
								resFunction: (data) => {
									updateData(data);
									updateLoading(false);
								},
							});
						}
						updateHandleService({
							service: {},
							active: false,
						});
					}}
				/>
			) : null}
			{showNewService ? (
				<CreateNewService
					finishFunction={(created) => {
						if (created) {
							updateLoading(true);
							getData({
								type: "SERVICES",
								resFunction: (data) => {
									updateLoading(false);
									updateData(data);
								},
							});
						}
						updateShowNewService(false);
					}}
				/>
			) : null}
			<div className="tolbox services-toolbox">
				<div className="column">
					<h6>Pretraga po klučnim riječima</h6>
					<div className="custom-input">
						{dashboardVectors.search}
						<input
							type="text"
							value={filters.search}
							onChange={(e) => {
								updateFiltersData("search", e.target.value);
							}}
							placeholder="Pretraga po ID, korisniku, ..."
						/>
					</div>
				</div>
				<div className="column role-selector">
					<h6>Status popravka</h6>
					<DropDownMenu
						data={["Na čekanju", "Aktivan", "Izvršeno", "Odbijeno", "Svi"]}
						active={filters.active}
						updateActive={(data) => {
							updateFiltersData("active", data);
						}}
					/>
				</div>
				<button
					className="create-new-button"
					onClick={() => {
						updateShowNewService(true);
					}}
				>
					Kreiraj novi zahtjev
				</button>
			</div>
			<div className="users-table-div tab">
				<Table
					loadMoreData={loadMoreData}
					loading={loading}
					className="services"
					labels={[
						{ text: "ID", key: "_id" },
						{ text: "Opis", key: "description" },
						{
							text: "Status",
							key: "status",
							status: ["Izvršeno", ["Na čekanju", "Aktivan"], "Odbijeno"],
						},
						{ text: "hitno", key: "urgently" },
					]}
					data={data}
					expanded={(el) => {
						const editService = () => {
							updateHandleService({
								service: el,
								active: true,
							});
						};
						const editComputer = async () => {
							const tempData = await searchPC({ computerID: el.computer._id });
							updateFinishService({
								service: { ...tempData, serviceID: el._id },
								active: true,
							});
						};
						return (
							<div className="data-review">
								<div className="row">
									<h6 className="title">Podatci o servisu</h6>
									{role === "Serviser" ? (
										el.status === "Na čekanju" ? (
											<div className="button-holder">
												<button
													className="create-new-button"
													onClick={editService}
												>
													Obradi zahtjev
												</button>
											</div>
										) : el.status === "Aktivan" ? (
											<div className="button-holder">
												<button
													className="create-new-button"
													onClick={editComputer}
												>
													Završi servis
												</button>
											</div>
										) : null
									) : null}
								</div>
								<h6>
									Servis je kreiran:
									<span>
										{new Date(el.created).toLocaleString("hr-HR", {
											year: "numeric",
											month: "numeric",
											day: "numeric",
											hour: "numeric",
											minute: "numeric",
											second: "numeric",
										})}
									</span>
								</h6>
								{el.servicer !== undefined ? (
									<h6>
										Zaduženi serviser: <span>{el.servicer}</span>
									</h6>
								) : null}
								{el.processed !== undefined ? (
									<h6>
										Servis je{" "}
										{el.status !== "Odbijen" ? "prihvaćen " : "odbijen "}:
										<span>
											{new Date(el.processed).toLocaleString("hr-HR", {
												year: "numeric",
												month: "numeric",
												day: "numeric",
												hour: "numeric",
												minute: "numeric",
												second: "numeric",
											})}
										</span>
									</h6>
								) : null}
								{el.finished !== undefined ? (
									<h6>
										Servis je završen:
										<span>
											{new Date(el.finished).toLocaleString("hr-HR", {
												year: "numeric",
												month: "numeric",
												day: "numeric",
												hour: "numeric",
												minute: "numeric",
												second: "numeric",
											})}
										</span>
									</h6>
								) : null}
								<h6 className="title">Opis kvara:</h6>
								<h6>{el.description}</h6>
								<h6 className="title">Podatci o korisniku</h6>
								<h6>
									ID korisnika: <span>{el.user._id}</span>
								</h6>
								<h6>
									Ime: <span>{el.user.name}</span>
								</h6>
								<h6>
									Prezime: <span>{el.user.lastName}</span>
								</h6>
								<h6>
									Email:<span>{el.user.email}</span>
								</h6>
								<h6 className="title">Podatci o računalu</h6>
								<h6>
									ID računala: <span>{el.computer._id}</span>
								</h6>
								<h6>
									Naziv računala: <span>{el.computer.computerName}</span>
								</h6>
								<h6>
									Serijski broj: <span>{el.computer.SN}</span>
								</h6>
								<h6>
									Garancija:
									<span>
										{el.computer.warranty.value +
											" " +
											el.computer.warranty.type}
									</span>
								</h6>
							</div>
						);
					}}
				/>
			</div>
		</>
	);
}

function Logs() {
	const [filter, updateFilter] = useState("");
	const { getData } = useAPI();
	const [data, updateData] = useState([]);
	const [loading, updateLoading] = useState(true);

	useEffect(() => {
		let timer = setTimeout(() => {
			updateData([]);
			updateLoading(true);
			getData({
				type: "LOGS",
				filters: filter,
				limit,
				resFunction: (data) => {
					updateData(data);
					updateLoading(false);
				},
			});
		}, 300);

		return () => {
			clearTimeout(timer);
		};
	}, [filter]);

	const loadMoreData = (updateLoad) => {
		getData({
			type: "LOGS",
			filters: filter,
			lastElement: data.length,
			limit,
			resFunction: (data) => {
				updateLoad(data.length === limit);
				updateData((old) => {
					return [...old, ...data];
				});
			},
		});
	};

	return (
		<>
			<div className="tolbox logs-toolbox">
				<div className="column">
					<h6>Pretraga po klučnim riječima</h6>
					<div className="custom-input">
						{dashboardVectors.search}
						<input
							type="text"
							value={filter}
							onChange={(e) => {
								updateFilter(e.target.value);
							}}
							placeholder="Korisniku, opisu"
						/>
					</div>
				</div>
			</div>
			<div className="users-table-div tab">
				<Table
					loadMoreData={loadMoreData}
					className="services"
					loading={loading}
					labels={[
						{ text: "Izvršio", key: "user" },
						{ text: "Opis", key: "content" },
						{ text: "Izvršeno", key: "time" },
					]}
					data={data}
					expanded={(el) => {
						let jsonData;
						let content = el.content;
						if (content.includes("{"))
							jsonData = JSON.parse(content.match(/{.*}/)[0]);
						content = content.replace(/{.*}/, "");
						content = content.replace("Promjene su:", "");

						const renderJsonData = (data) => {
							if (data && typeof data === "object") {
								return (
									<table>
										<tbody>
											{Object.keys(data).map((key) => (
												<tr key={key}>
													<td>{key}</td>
													<td>{renderJsonData(data[key])}</td>
												</tr>
											))}
										</tbody>
									</table>
								);
							} else {
								return data;
							}
						};

						return (
							<div className="data-review">
								<h6 className="title">O događaju: </h6>
								<h6>
									Korisnik koji je izvršio događaj: <span>{el.user}</span>
								</h6>
								<h6>
									Izvršeno: <span>{el.time}</span>
								</h6>

								<h6 className="title">Opis: </h6>
								<h6>
									<span>{content}</span>
								</h6>
								{jsonData ? (
									<>
										<h6 className="title">Promjene su: </h6>

										{renderJsonData(jsonData)}
									</>
								) : null}
							</div>
						);
					}}
				/>
			</div>
		</>
	);
}
