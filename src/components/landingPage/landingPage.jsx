import "./landingPage.css";
import AboutSvg from "./vectors/about";
import BackupSvg from "./vectors/backup";
import DiagnoseSvg from "./vectors/diagnose";
import MalwareSvg from "./vectors/malware";
import Activation from "./vectors/activation";
import Contact from "./vectors/contact";
import Header from "../Header";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
function ColorText({ text = "" }) {
	const data = text.split(" ");
	const [active, updateActive] = useState(0);
	useEffect(() => {
		const interval = setInterval(() => {
			updateActive((old) => (old + 1 < data.length ? old + 1 : 0));
		}, 3000);
		return () => {
			clearInterval(interval);
		};
	}, []);
	return (
		<>
			{data.map((el, i) => (
				<span
					key={"color-element-" + i + "-" + "el"}
					className="color-change"
					style={{
						animation: `${
							i === active ? "change-color" : ""
						} 3s linear infinite`,
						color: i === active ? "transparent" : "#fff",
					}}
				>
					{el}
				</span>
			))}
		</>
	);
}

export default function LandingPage() {
	return (
		<>
			<Header title="Početna stranica" />
			<NavigationBar
				tabs={[
					{ href: "#usluge", text: "Usluge" },
					{ href: "#novi-korisnik", text: "Novi korisnik" },
					{ href: "#kontakt", text: "Kontakt" },
				]}
			/>
			<Main />
			<Footer />
		</>
	);
}

function Main() {
	const token = useSelector((state) => state.user.value.token);
	return (
		<main className="landing-page">
			<div className="main-tab site-tab">
				<div className="main-container">
					<h1>
						<ColorText text="Profesionalna usluga servisiranja računala" />
					</h1>
					<p>Profesionalan popravak Vaših osobnih ili zaduženih računala</p>
					<div className="button-container">
						<a href={token === "" ? "/prijava" : "/nadzorna-ploca/servisi"}>
							<button>Zatraži servis</button>
						</a>
					</div>
				</div>
				<AboutSvg />
			</div>
			<img className="main-vector" src="/vectors/landingPageTop.svg" alt="" />
			<div className="main-background">
				<div className="site-tab">
					<h2 id="usluge">Naše usluge</h2>
					<Services
						tabs={[
							{
								heading: "Uklanjanje malwarea",
								text: "U vlasništvu smo jednog od najjačeg antivirsnog softwarea koji omogućava uklanjanje svih vrsta malwarea. Tijekom uklanjanja malwarea svi Vaši podatci će ostati očuvani.",
								svg: <MalwareSvg />,
							},
							{
								heading: "Dijagnostika i servis",
								text: "Vršimo dijagnostiku kvara na računalu, te potom otklanjane samoga kvara. Trudimo se da podatci korisnika ostanu očuvani, ako je to moguće.",
								svg: <DiagnoseSvg />,
							},

							{
								heading: "Backup podataka",
								text: "Nudimo profesionalnu uslugu backupa vaših podataka. U slučaju prestanka radu HDD/SSD/USB uređaja u mogučnosti smo vratiti sve podatke koji se nalaze na tom uređaju.",
								svg: <BackupSvg />,
							},
						]}
					/>
				</div>
			</div>
			<img
				className="main-vector"
				src="/vectors/landingPageBottom.svg"
				alt=""
			/>
			<div className="account-activation">
				<h2 id="novi-korisnik">Kako postati korisnik?</h2>
				<section className="tab-services">
					<Activation />
					<div className="info">
						<h3>Za nove korisnike</h3>
						<p>
							Da biste stvorili korisnički račun u našoj aplikaciji, molimo
							kontaktirajte naš tim za podršku. Naš tim će vam pružiti sve
							potrebne informacije i upute kako biste mogli stvoriti svoj račun.
							Kontaktirajte nas putem telefona kako biste dobili brzu i
							učinkovitu pomoć. Naš tim za podršku uvijek je dostupan da vam
							pomogne i odgovori na sva pitanja koja imate.
						</p>
					</div>
				</section>
			</div>
			<div className="account-activation" style={{ marginTop: "0" }}>
				<h2 id="kontakt">Kontaktirajte nas</h2>

				<div className="tab-services" style={{ marginTop: "50px" }}>
					<Contact style={{ filter: " drop-shadow(0 0 100px #0095ff73)" }} />
					<div className="links">
						<p style={{ width: "100%" }}>
							Ako imate bilo kakvih pitanja, problema ili prijedloga za našu
							uslugu, slobodno nas kontaktirajte putem e-pošte ili telefonskih
							linija za podršku. Naš tim za podršku je uvijek spreman pomoći i
							odgovoriti na sva vaša pitanja u najkraćem mogućem roku. Naši
							stručnjaci će se pobrinuti da dobijete najbolju uslugu i podršku
							koju zaslužujete.
						</p>
						<p>
							Email:{" "}
							<a href="mailto:servis@ina.hr?subject=Zahtjev%20za%20članstvom">
								servis@ina.hr
							</a>
						</p>

						<p>
							Telefon: <a href="tel:+385998429084">+385 99 842 9084</a>
						</p>
					</div>
				</div>
			</div>
		</main>
	);
}

function Services({ tabs = [{ heading: "", text: "", svg: <></> }] }) {
	return (
		<>
			{tabs.map((data, i) => (
				<div className="tab-services" key={"Service-" + i}>
					{data.svg}
					<div className="info">
						<h3>{data.heading}</h3>
						<p>{data.text}</p>
					</div>
				</div>
			))}
		</>
	);
}

function NavigationBar({ tabs = [{ href: "", text: "" }] }) {
	const name = useSelector((state) => state.user.value.name);
	return (
		<nav id="landing-page-menu">
			{tabs.map((data, i) => {
				if (window.innerWidth > 600 || i !== 1)
					return (
						<a href={data.href} key={data.text + " " + i}>
							{data.text}
						</a>
					);
			})}
			{name === "" ? (
				<a href="/prijava">Prijava</a>
			) : (
				<a href="/nadzorna-ploca">Nadzorna ploča</a>
			)}
		</nav>
	);
}

function Footer() {
	return (
		<footer>
			<div>
				<span>
					<b>© {new Date().getFullYear()} INAtech </b>pod pokroviteljstvom
				</span>
				<a href="https://www.ina.hr/">
					<img src="/INA_logo.png" alt="Logo INA Grupe" />
				</a>
				Grupe
			</div>
		</footer>
	);
}
