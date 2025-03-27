
import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [token, setToken] = useState(localStorage.getItem("token"));
	const [isLoggedIn, setIsLoggedIn] = useState(
		localStorage.getItem("isLoggedIn") === "true"
	);

	useEffect(() => {
		const verifyToken = async () => {
			if (token) {
				try {
					const response = await axios.get(
						"http://localhost:8000/auth/protected",
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

	const login = (newToken) => {
		localStorage.setItem("token", newToken);
		setToken(newToken);
		setIsLoggedIn(true);
	};

	const logout = () => {
		localStorage.removeItem("token");
		setToken(null);
		setIsLoggedIn(false);
	};

	return (
		<AuthContext.Provider value={{ isLoggedIn, token, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);
