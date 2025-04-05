import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styling/Loginform.css";
import { FaUser, FaEye, FaEyeSlash } from "react-icons/fa";
import logo from "../../pictures/flick_logo.png";
import { useAuth } from "../AuthContext";
import toast from "react-hot-toast";

const LoginForm = () => {
	const navigate = useNavigate();
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [passwordVisible, setPasswordVisible] = useState(false);
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState({}); 
	const { login } = useAuth();
	const BASE_URL = process.env.REACT_APP_BACKEND_URL;
	const togglePasswordVisibility = () => {
		setPasswordVisible(!passwordVisible);
	};

	const handleLogin = async (e) => {
		e.preventDefault();
		toast.dismiss();
		setErrors({}); 

	
		const newErrors = {};
		if (!username.trim()) newErrors.username = "Username is required.";
		if (!password.trim()) newErrors.password = "Password is required.";
		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		setLoading(true);

		try {
			const response = await axios.post(`${BASE_URL}/auth/login`, {
				username,
				password,
			});

			const token = response.data.token;
			const userId = response.data.user_id;
			const firstLogin = response.data.firstLogin;

			if (token) {
				login(token, userId, firstLogin);
				toast.success("Login successful!");
				const fl = localStorage.getItem("firstLogin");
				if (fl == true) {
					navigate("/Preferences");
				} else {
					navigate("/");
				}
			} else {
				toast.error("Login successful, but no token received.");
			}
		} catch (error) {
			console.error("Login error:", error);
			if (error.response) {
				toast.error(error.response.data.detail || "Invalid login credentials.");
			} else {
				toast.error("Server error. Check backend logs.");
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="logincontainer login-container">
			<div className="loginwrapper login-wrapper">
				<form onSubmit={handleLogin} noValidate> 
					<img src={logo} alt="App Logo" width="100" />
					<h1 className="loginformtitle login">Login</h1>

					{message && <p className="message">{message}</p>}

					<div className="input-box">
						<div className="input-box-inner">
							<input
								type="text"
								placeholder="Username"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
							/>
							<FaUser className="icon" />
						</div>
						{errors.username && <p className="error-text">{errors.username}</p>} 
					</div>


					<div className="input-box">
						<div className="input-box-inner">
							<input
								type={passwordVisible ? "text" : "password"}
								placeholder="Password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
							<span className="toggle-icon" onClick={togglePasswordVisibility}>
								{passwordVisible ? <FaEye /> : <FaEyeSlash />}
							</span>
						</div>
						{errors.password && <p className="error-text">{errors.password}</p>} 
					</div>


					<div className="logintext remember-forgot">
						<label>
							<input type="checkbox" /> Remember me
						</label>
						<p>
							<span
								className="forgot-text"
								onClick={() => navigate("/forgotpassword")}
							>
								Forgot Password?
							</span>
						</p>
					</div>

					<button type="submit" disabled={loading}>
						{loading ? "Logging in..." : "Login"}
					</button>

					<div className="loginlink signup-link">
						<p>
							Don't have an account?
							<span
								className="logintext signup-text"
								onClick={() => navigate("/signup")}
							>
								Sign Up
							</span>
						</p>
					</div>
				</form>
			</div>
		</div>
	);
};

export default LoginForm;
