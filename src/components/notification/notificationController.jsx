import { useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteNotification } from "./notificationStore";
import "./notification.css";

function Notification({ text = "", type = "alert", duration = 5, id = "" }) {
	const [width, updateWidth] = useState(100);
	const notificationRef = useRef(null);
	const [active, updateActive] = useState(true);
	const dispatch = useDispatch();
	const removeNotification = () => {
		if (notificationRef.current !== null)
			notificationRef.current.style.animation =
				"outro-animation 1 200ms forwards";
		setTimeout(() => {
			dispatch(deleteNotification(id));
			updateActive(false);
		}, 200);
	};
	useEffect(() => {
		let progress = 0;
		const interval = setInterval(() => {
			updateWidth(100 - progress);
			if (progress === 100) {
				removeNotification();
				clearInterval(interval);
			}
			progress += 1;
		}, duration * 10);
	}, []);
	if (active)
		return (
			<div className={`notification ${type}`} ref={notificationRef}>
				<img
					src={`/notifications/${type}.svg`}
					alt="Ikona notifikacije"
				/>
				<p>{text}</p>
				<div
					className="notification-progress-line"
					style={{ width: `calc(${width}% + 4px)` }}
				></div>
				<span
					onClick={() => {
						removeNotification();
					}}
					style={{ cursor: "pointer", marginLeft: "auto" }}
				>
					X
				</span>
			</div>
		);
}

function NotificationContainer() {
	const notifications = useSelector((state) => state.notifications.value);
	return (
		<div className="notification-container">
			{notifications.map((data, i) => (
				<Notification
					text={data.text}
					type={data.type}
					duration={data.duration}
					key={"Notification" + i}
					id={data.id}
				/>
			))}
		</div>
	);
}

export default NotificationContainer;
