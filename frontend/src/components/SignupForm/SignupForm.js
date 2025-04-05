import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styling/SignupForm.css";
import logo from "../../pictures/flick_logo.png";
import toast from "react-hot-toast";

const SignupForm = () => {
	const navigate = useNavigate();
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState({});
	const BASE_URL = process.env.REACT_APP_BACKEND_URL;

	const handleSignup = async (e) => {
		e.preventDefault();
		setErrors({});

		// Manual validation
		const newErrors = {};
		if (!firstName.trim()) newErrors.firstName = "First name is required.";
		if (!lastName.trim()) newErrors.lastName = "Last name is required.";
		if (!email.trim()) newErrors.email = "Email is required.";
		if (!username.trim()) newErrors.username = "Username is required.";
		if (!password.trim()) newErrors.password = "Password is required.";

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}
		setLoading(true);
		try {
			await axios.post(`${BASE_URL}/users/signup`, {
				firstName,
				lastName,
				email,
				username,
				password,
			});
			toast.success("Account created successfully!");
			setTimeout(() => navigate("/Login"), 3000);
		} catch (error) {
			toast.error(
				error.response?.data?.detail || "Error signing up. Try again."
			);
			console.error("Signup Error:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="login-container">
			<div className="loginwrapper signup-wrapper">
				<form onSubmit={handleSignup} noValidate>
					<img src={logo} alt="App Logo" width="100" />

					<h1 className="loginformtitle signup">Sign Up</h1>

					<div className="input-box">
						<input
							type="text"
							placeholder="First Name"
							value={firstName}
							onChange={(e) => setFirstName(e.target.value)}
						/>
						{errors.firstName && <p className="error-text">{errors.firstName}</p>}
					</div>

					<div className="input-box">
						<input
							type="text"
							placeholder="Last Name"
							value={lastName}
							onChange={(e) => setLastName(e.target.value)}
						/>
						{errors.lastName && <p className="error-text">{errors.lastName}</p>}
					</div>

					<div className="input-box">
						<input
							type="email"
							placeholder="Email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
						{errors.email && <p className="error-text">{errors.email}</p>}
					</div>

					<div className="input-box">
						<input
							type="text"
							placeholder="Username"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
						/>
						{errors.username && <p className="error-text">{errors.username}</p>}
					</div>

					<div className="input-box">
						<input
							type="password"
							placeholder="Password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
						{errors.password && <p className="error-text">{errors.password}</p>}
					</div>

					<button type="submit" disabled={loading}>
						{loading ? "Signing Up..." : "Sign Up"}
					</button>

					<div className="login-link">
						<p>
							Already have an account?
							<span className="login-text" onClick={() => navigate("/login")}>
								Login
							</span>
						</p>
					</div>
				</form>
			</div>
		</div>
	);
};

export default SignupForm;
