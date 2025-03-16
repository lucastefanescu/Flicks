import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styling/ForgotPasswordForm.css";
import { MdEmail } from "react-icons/md";
import logo from "../../pictures/flick_logo.png";

const ForgotPasswordForm = () => {
	return (
		<div className="logincontainer forgotpassword-container">
			<div className="loginwrapper forgot-wrapper">
				<form>
					<img src={logo} alt="App Logo" width="100" />

					<h1 className="loginformtitle forgotpassword">Forgot Password</h1>

					<div className="input-box">
						<input type="text" placeholder="Email" required />
						<MdEmail className="icon" />
					</div>

					<button type="submit">Send Email</button>
				</form>
			</div>
		</div>
	);
};

export default ForgotPasswordForm;
