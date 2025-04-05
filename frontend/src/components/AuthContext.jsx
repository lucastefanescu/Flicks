import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [token, setToken] = useState(localStorage.getItem("token"));
	const [userId, setUserId] = useState(localStorage.getItem("userId"));
	const BASE_URL = process.env.REACT_APP_BACKEND_URL;
	const [firstLogin, setFirstLogin] = useState(
		localStorage.getItem("firstLogin")
	);
	const [isLoggedIn, setIsLoggedIn] = useState(
		localStorage.getItem("isLoggedIn") === "true"
	);

	useEffect(() => {
		const verifyToken = async () => {
			if (token) {
				try {
					const response = await axios.get(
						`${BASE_URL}/auth/protected`,
						{
							// Corrected backend URL
							headers: { Authorization: `Bearer ${token}` },
						}
					);
					setIsLoggedIn(true);
				} catch (error) {
					console.error("Token verification failed:", error);
					logout();
				}
			}
		};
		verifyToken();
	}, [token]);

	const modalComplete = () => {
		localStorage.removeItem("firstLogin");
		setFirstLogin(null);
	};
	const login = (newToken, userId, firstLogin) => {
		localStorage.setItem("token", newToken);
		localStorage.setItem("userId", userId);
		setUserId(userId);
		setToken(newToken);
		setIsLoggedIn(true);
		if (firstLogin == 1) {
			localStorage.setItem("firstLogin", true);
			setFirstLogin(firstLogin);
		} else {
			localStorage.removeItem("firstLogin");
			setFirstLogin(null);
		}
	};
	const logout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("userId");
		localStorage.removeItem("firstLogin");
		setFirstLogin(null);
		setToken(null);
		setIsLoggedIn(false);
	};

	return (
		<AuthContext.Provider
			value={{
				isLoggedIn,
				token,
				login,
				logout,
				userId,
				firstLogin,
				modalComplete,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);
