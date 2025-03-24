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
	const { login } = useAuth();

	const togglePasswordVisibility = () => {
		setPasswordVisible(!passwordVisible);
	};

	const handleLogin = async (e) => {
		e.preventDefault();
		setLoading(true);
		toast.dismiss(); // Clear any previous toasts

		try {
			console.log("🔍 Attempting login with:", { username, password });

			const response = await axios.post("http://127.0.0.1:8000/auth/login", {
				username,
				password,
			});

			console.log("✅ API Response:", response.data); // Debugging API response

			// Extract token correctly
			const token = response.data.token;
			if (token) {
				login(token);
				toast.success("Login successful!");
				navigate("/");
			} else {
				toast.error("Login successful, but no token received.");
			}
		} catch (error) {
			console.error("❌ Login Error Response:", error.response);
			console.error("⚠️ Full Error:", error);
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
				<form onSubmit={handleLogin}>
					<img src={logo} alt="App Logo" width="100" />
					<h1 className="loginformtitle login">Login</h1>

					{message && <p className="message">{message}</p>}

					<div className="input-box">
						<input
							type="text"
							placeholder="Username"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							required
						/>
						<FaUser className="icon" />
					</div>

					<div className="input-box">
						<input
							type={passwordVisible ? "text" : "password"}
							placeholder="Password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
						<span className="toggle-icon" onClick={togglePasswordVisibility}>
							{passwordVisible ? <FaEye /> : <FaEyeSlash />}
						</span>
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
