import LoginForm from "./components/LoginForm/LoginForm.js";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import SignupForm from "./components/SignupForm/SignupForm.js";
import ForgotPasswordForm from "./components/ForgotPasswordForm/ForgotPasswordForm.js";
import ResetPasswordForm from "./components/ForgotPasswordForm/ResetPasswordForm.js";
import "./App.css";
import FlicksLandingPage from "./components/MainPage.js";
import MoviePage from "./components/MoviePage.jsx";
import ProfilePage from "./components/ProfilePage.jsx";
import { AuthProvider } from "./components/AuthContext.jsx";
import SearchPage from "./components/SearchPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import MoviePreferenceModal from "./components/MoviePreferencesModal.jsx";
import { Toaster } from "react-hot-toast";

function App() {
	return (
		<Router>
			<AuthProvider>
				<Toaster
					position="top-center"
					reverseOrder={false}
					toastOptions={{
						success: {
							iconTheme: {
								primary: "#FFD700",
								secondary: "#1C1C1C",
							},
						},
						error: {
							iconTheme: {
								primary: "#DC143C",
								secondary: "#F5F5F5",
							},
						},
					}}
				/>
				<Routes>
					<Route path="/" element={<FlicksLandingPage />} />
					<Route path="/SignUp" element={<SignupForm />} />
					<Route path="/Login" element={<LoginForm />} />
					<Route path="/ForgotPassword" element={<ForgotPasswordForm />} />
					<Route path="/ResetPassword/:token" element={<ResetPasswordForm />} />
					<Route element={<ProtectedRoute />}>
						<Route path="/Profile" element={<ProfilePage />} />
						<Route path="/Search" element={<SearchPage />} />
						<Route
							path="/Search/:id"
							element={<MoviePage movieName="default" year="default" />}
						/>
						<Route path="/Preferences" element={<MoviePreferenceModal />} />
					</Route>
					<Route path="*" element={<Navigate to="/Login" replace />} />
				</Routes>
			</AuthProvider>
		</Router>
	);
}

export default App;
