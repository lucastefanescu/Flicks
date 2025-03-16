import "../styling/MainPageNavbar.css";
import logo from "../pictures/flick_logo.png";
import { useNavigate } from "react-router-dom";
import React from "react";
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';


function MainPageNavBar() {
	const {isLoggedIn} = useAuth();
	const navigate = useNavigate();
	
	const handleLoggedInCheck = (scenario) => {
		if (isLoggedIn) {
			switch (scenario) {
				case "search":
					navigate("/Search")
					break;
				case "profile":
					navigate("/Profile");
					break;
				default:
					console.log("error");
			}
		} else {
			navigate("/SignUp");
		}
	};

	const handleLogin = () => {
			navigate("/Login")			
	};
	
	const handleSignup = () => {
			navigate("/SignUp")
	};
	return (
		<div>
			<nav className="nav-container">
				<div className="logo-container">
					<img src={logo} alt="flicks logo" onClick={() => navigate("/")}></img>
				</div>
				{isLoggedIn && (<div className="nav-buttons">
					<button
						className="nav-button home-button"
						onClick={() => handleLoggedInCheck("profile")}>
						Profile
					</button>
				</div>
				)}
				{!isLoggedIn && (<div className="nav-buttons">
						<button className="nav-button about-button" onClick={handleSignup}>
							Sign Up
						</button>
						<button className="nav-button login-button" onClick={handleLogin}>
							Login
						</button>
					</div>
				)}
			</nav>
		</div>
	);
}

export default MainPageNavBar;
