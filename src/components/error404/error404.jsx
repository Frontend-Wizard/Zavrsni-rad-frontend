import Vector from "./vector";
import "./error404.css";
import { useNavigate } from "react-router-dom";
import Header from "../Header";

export default function Error404() {
	const navigator = useNavigate();
	const goHome = () => {
		navigator("/");
	};
	return (
		<main id="error404">
			<Header title="Upss" />
			<Vector />
			<div className="main-content">
				<h1>Nažalost stranica koju tražite nije pronađena. </h1>
				<button onClick={goHome}>Povratak na početnu stranicu</button>
			</div>
		</main>
	);
}
