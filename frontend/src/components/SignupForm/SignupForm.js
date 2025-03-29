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
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSignup = async (e) => {
		e.preventDefault();
		setMessage("");
		setLoading(true);
		try {
			await axios.post("http://127.0.0.1:8000/users/signup", {
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
				<form onSubmit={handleSignup}>
					<img src={logo} alt="App Logo" width="100" />

					<h1 className="loginformtitle signup">Sign Up</h1>

					{message && <p className="message-top">{message}</p>}

					<div className="input-box">
						<input
							type="text"
							placeholder="First Name"
							value={firstName}
							onChange={(e) => setFirstName(e.target.value)}
							required
						/>
					</div>

					<div className="input-box">
						<input
							type="text"
							placeholder="Last Name"
							value={lastName}
							onChange={(e) => setLastName(e.target.value)}
							required
						/>
					</div>

					<div className="input-box">
						<input
							type="email"
							placeholder="Email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>

					<div className="input-box">
						<input
							type="text"
							placeholder="Username"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							required
						/>
					</div>

					<div className="input-box">
						<input
							type="password"
							placeholder="Password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
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
