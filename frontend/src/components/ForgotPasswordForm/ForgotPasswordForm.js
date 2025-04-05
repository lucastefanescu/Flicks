import React, { useState } from "react";
import axios from "axios";
import "../../styling/ForgotPasswordForm.css";
import { MdEmail } from "react-icons/md";
import logo from "../../pictures/flick_logo.png";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ForgotPasswordForm = () => {
	const [email, setEmail] = useState("");
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();
	const BASE_URL = process.env.REACT_APP_BACKEND_URL;
	const handleForgotPassword = async (e) => {
		e.preventDefault();
		setMessage("");
		setLoading(true);

		try {
			const response = await axios.post(
				`${BASE_URL}/auth/forgot-password`,
				{ email }
			);

			if (response.status === 200) {
				toast.success("Password reset link has been sent to your email.");
				navigate("/");
			}
		} catch (error) {
			toast.error(error.response?.data?.detail || "Error sending reset email.");
			console.error("Forgot Password Error:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="forgotpassword-container">
			<div className="forgot-wrapper">
				<form onSubmit={handleForgotPassword}>
					<img src={logo} alt="App Logo" width="100" />
					<h1 className="forgotpassword">Forgot Password</h1>

					{message && <p className="message message-top">{message}</p>}

					<div className="input-box">
						<input
							type="email"
							placeholder="Enter your email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
						<MdEmail className="icon" />
					</div>

					<button type="submit" disabled={loading}>
						{loading ? "Sending..." : "Send Email"}
					</button>
				</form>
			</div>
		</div>
	);
};

export default ForgotPasswordForm;
