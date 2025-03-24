import LoginForm from "./components/LoginForm/LoginForm.js";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignupForm from "./components/SignupForm/SignupForm.js";
import ForgotPasswordForm from "./components/ForgotPasswordForm/ForgotPasswordForm.js";
import ResetPasswordForm from "./components/ForgotPasswordForm/ResetPasswordForm.js";
import "./App.css";
import FlicksLandingPage from "./components/MainPage.js";
import MoviePage from "./components/MoviePage.jsx";
import ProfilePage from "./components/ProfilePage.jsx"
import MovieCard from "./components/MovieCard.jsx";
import { AuthProvider } from './components/AuthContext.jsx';
import SearchPage from "./components/SearchPage.jsx";
import { Toaster } from 'react-hot-toast';
function App() {
	return (
		
		<Router>
			<AuthProvider><Toaster position="top-center" reverseOrder={false}/>
			<Routes>
				<Route path="/" element={<FlicksLandingPage />} />
				<Route path="/SignUp" element={<SignupForm />} />
				<Route path="/Login" element={<LoginForm />} />
				<Route path="/ForgotPassword" element={<ForgotPasswordForm />} />

				<Route path="/ResetPassword/:token" element={<ResetPasswordForm />} />
				<Route path="/Profile" element={<ProfilePage/>} />
				<Route path="/Search" element={<SearchPage />} />
				<Route
					path="/Search/:id"
					element={<MoviePage movieName="default" year="default" />}
				/>
			</Routes>
			</AuthProvider>

		</Router>
		
		//<MovieCard/>
		//<MoviePage/>
		//<ProfilePage/>
		 
	);
}

export default App;
