import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const PreferencePriority = () => {
	const firstLogin = localStorage.getItem("firstLogin");
	const location = useLocation();
	if (firstLogin && location.pathname != "/Preferences") {
		return <Navigate to="/Preferences" replace />;
	}
	return <Outlet />;
};

export default PreferencePriority;
