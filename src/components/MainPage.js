import React, { useCallback, useState } from "react";
import "../styling/MainPage.css";
import MainPageNavBar from "./MainPageNavbar";
import logo from "../pictures/flick_logo.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from './AuthContext';

const FlicksLandingPage = () => {
	const {isLoggedIn} = useAuth();
	const navigate = useNavigate();

	const handleLoggedInCheck = useCallback(
		(scenario) => {
			if (isLoggedIn) {
				switch (scenario) {
					case "search":
						navigate("/Search");
						break;
					case "profile":
						navigate("/Search");
						break;
					default:
						navigate("/SignUp");
				}
			} else {
				navigate("/SignUp");
			}
		},
		[isLoggedIn, navigate]
	);
	const handleLogin = useCallback(() => {
		setIsLoggedIn(true);
		alert("You are now logged in!");
	}, []);

	const handleSignup = useCallback(() => {
		if (isLoggedIn) {
			alert("already logged in");
		} else {
			alert("Redirecting to signup page...");
		}
	}, [isLoggedIn]);
	return (
		<div className="frame-2">
			<MainPageNavBar
			/>
			<main className="content-container">
				<div className="logo-title-container">
					<div className="logo-title-row">
						<img src={logo}></img>
						<h1 className="flicks-title">FLICKS</h1>
					</div>
					<div className="main-button-container">
						<button
							className="main-button"
							onClick={() => handleLoggedInCheck("search")}
						>
							Search
						</button>
					</div>
				</div>
			</main>
		</div>
	);
};

export default FlicksLandingPage;
