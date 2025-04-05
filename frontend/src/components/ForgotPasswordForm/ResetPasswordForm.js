import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styling/ResetPasswordForm.css";
import logo from "../../pictures/flick_logo.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import toast from "react-hot-toast";

const ResetPasswordForm = () => {
	const { token } = useParams();
	const navigate = useNavigate();

	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setPasswordVisible] = useState(false);
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(false);
	const BASE_URL = process.env.REACT_APP_BACKEND_URL;

	const togglePasswordVisibility = () => {
		setPasswordVisible(!showPassword);
	};

	const handleResetPassword = async (e) => {
		e.preventDefault();

		if (newPassword !== confirmPassword) {
			setMessage("Passwords do not match");
			return;
		}

		setLoading(true);

		try {
			//change url based on deployment link
			const response = await axios.post(
				`${BASE_URL}/auth/reset-password/${token}`,
				{ new_password: newPassword },
				{ headers: { "Content-Type": "application/json" } }
			);

			if (response.status === 200) {
				toast.success("Password reset successful! Redirecting to login...");
				setTimeout(() => navigate("/login"), 3000);
			}
		} catch (error) {
			toast.error(error.response?.data?.detail || "Error resetting password.");
			console.error("Reset Password Error:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="reset-container">
			<div className="reset-wrapper">
				<img src={logo} alt="App Logo" width="100" />
				<h1 className="reset-title">Reset Password</h1>
				<form onSubmit={handleResetPassword}>
					<div className="input-box">
						<input
							type={showPassword ? "text" : "password"}
							placeholder="New Password"
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
							required
						/>
						<span className="toggle-icon" onClick={togglePasswordVisibility}>
							{showPassword ? <FaEye /> : <FaEyeSlash />}
						</span>
					</div>

					<div className="input-box">
						<input
							type={showPassword ? "text" : "password"}
							placeholder="confirm Password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							required
						/>
						<span className="toggle-icon" onClick={togglePasswordVisibility}>
							{showPassword ? <FaEye /> : <FaEyeSlash />}
						</span>
					</div>

					<button type="submit" disabled={loading}>
						{loading ? "Resetting..." : "Reset Password"}
					</button>
					<p className="message">{message}</p>
				</form>
			</div>
		</div>
	);
};

export default ResetPasswordForm;
