import "../styling/MainPageNavbar.css";
import "../styling/Navbar.css";
import logo from "../pictures/flick_logo.png";
import { Link } from "react-router-dom";

function Navbar({ handleLoggedInCheck, handleSignup, handleLogin }) {
	return (
		<>
			<nav className="nav-container">
				<Link to="/" className="logo-container">
					<img src={logo} alt="flicks logo"></img>
				</Link>
				<div className="nav-buttons all">
					<Link
						to="/Profile"
						className="nav-button-all home-button-all"
						onClick={() => handleLoggedInCheck("profile")}
					>
						Profile
					</Link>
					<Link
						to="/SignUp"
						className="nav-button-all about-button"
						onClick={handleSignup}
					>
						Sign Up
					</Link>
					<Link
						to="/Login"
						className="nav-button-all login-button"
						onClick={handleLogin}
					>
						Log in
					</Link>
					<Link to="/Search" className="nav-button-all search-button">
						Search
					</Link>
				</div>
			</nav>
		</>
	);
}
export default Navbar;
