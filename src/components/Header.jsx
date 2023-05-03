import { useEffect } from "react";

function Header({ title = "" }) {
	useEffect(() => {
		document.title = title;
	}, []);
	return <></>;
}

export default Header;
