import "../styling/MainPageNavbar.css";
import "../styling/Navbar.css";
import logo from "../pictures/flick_logo.png";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

function Navbar({ handleLoggedInCheck, handleSignup, handleLogin }) {
	const { logout } = useAuth();
	const navigate = useNavigate();

	const handleLogOut = useCallback(() => {
		logout();
		navigate("/");
	});

	return (
		<>
			<nav className="nav-container">
				<Link to="/" className="logo-container">
					<img src={logo} alt="flicks logo"></img>
				</Link>
				<div className="nav-buttons all">
					<Link to="/Profile" className="nav-button-all home-button-all">
						Profile
					</Link>
					{/* 
					<Link to="/SignUp" className="nav-button-all about-button">
						Sign Up
					</Link>
					<Link to="/Login" className="nav-button-all login-button">
						Log in
					</Link>
					*/}
					<Link to="/Search" className="nav-button-all search-button">
						Search
					</Link>
					<button
						className="nav-button-all logout-button"
						onClick={handleLogOut}
					>
						Log out
					</button>
				</div>
			</nav>
		</>
	);
}
export default Navbar;
