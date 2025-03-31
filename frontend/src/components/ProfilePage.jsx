import "../styling/ProfilePage.css";
import Navbar from "./Navbar";
import Carousel from "react-multi-carousel";
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";
import "react-multi-carousel/lib/styles.css";

const responsive = {
	superLargeDesktop: {
		breakpoint: { max: 4000, min: 3000 },
		items: 5,
	},
	desktop: {
		breakpoint: { max: 3000, min: 1024 },
		items: 4,
	},
	tablet: {
		breakpoint: { max: 1024, min: 464 },
		items: 3,
	},
	mobile: {
		breakpoint: { max: 464, min: 0 },
		items: 2,
	},
};

const API_ACESS_TOKEN = process.env.REACT_APP_API_ACCESS_TOKEN;

const options = {
	method: "GET",
	headers: {
		accept: "application/json",
		Authorization: `Bearer ${API_ACESS_TOKEN}`,
	},
};

const poster_prefix = "https://image.tmdb.org/t/p/w500";

const ProfilePage = () => {
	const [ratings, setRatings] = useState([]);
	const [Recommendations, setRecommendations] = useState([]);
	const { userId } = useAuth();

	useEffect(() => {
		async function fetchData() {
			try {
				const response = await fetch(
					`http://localhost:8000/users/${userId}/getRatings`
				);
				if (!response.ok) {
					console.log("error retrieving ratings for user");
				}
				const result = await response.json();
				const resultArray = Object.entries(result).flat();
				const resultQueries = resultArray[1] || [];

				const movies = await Promise.all(
					resultQueries.map(async (id) => {
						const response_tmdb = await fetch(
							`https://api.themoviedb.org/3/movie/${id}?language=en-US`,
							options
						);
						if (!response.ok) {
							console.log("error retrieving movies with movieIds");
							return null;
						}
						return response_tmdb.json();
					})
				);
				const validMovies = movies.filter(Boolean);
				const final = validMovies.map(
					(movie) => `${poster_prefix}${movie.poster_path}`
				);
				console.log(final);
				setRatings(final);
			} catch (error) {
				console.log("error fetching the ratings from user: " + error);
			}
		}
		fetchData();
	}, [userId]);

	useEffect(() => {
		async function fetchData() {
			try {
				const response = await fetch(
					"http://localhost:8000/Recommendations/recommendForUser",
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							user_id: userId,
						}),
					}
				);
				if (!response.ok) {
					console.log(response.status);
					return;
				}
				const result = await response.json();
				const queryIds = Object.entries(result).flat();
				const finalQueryIds = queryIds[3];
				console.log("final QUERY IDS" + finalQueryIds);
				const movies = await Promise.all(
					finalQueryIds.map(async (id) => {
						const response2 = await fetch(
							`https://api.themoviedb.org/3/movie/${id}?language=en-US`,
							options
						);
						if (!response2.ok) {
							console.log("error in second fetch" + response2.status);
							return null;
						}
						return response2.json();
					})
				);

				const validMovies = movies.filter(Boolean);

				const finalResult = validMovies.map(
					(value) => `${poster_prefix}${value.poster_path}`
				);

				setRecommendations(finalResult);
			} catch (err) {
				console.log(err);
			}
		}
		fetchData();
	}, [userId]);

	return (
		<div className="Profile-Container">
			<Navbar></Navbar>
			<h1>Hi... Name</h1>
			<h2>Your Rated Movies</h2>
			<div className="carousel-wrapper ratings">
				<Carousel
					responsive={responsive}
					className={"carousel ratings"}
					itemClass={"profile-wrapper ratings"}
				>
					{ratings.map((movie, i) => {
						return (
							<img
								src={movie}
								alt="movie"
								className={`carousel-item rating ${i}`}
							></img>
						);
					})}
				</Carousel>
			</div>

			<h2>Recommended For You</h2>
			<div className="carousel-wrapper recommendations">
				<Carousel
					responsive={responsive}
					className={"carousel recommendations"}
					itemClass={"profile-wrapper recommendations"}
				>
					{Recommendations.map((value, i) => {
						return (
							<img
								src={value}
								alt={`movie ${i}`}
								key={i}
								className={`carousel-item recommendations ${i}`}
							/>
						);
					})}
				</Carousel>
			</div>
		</div>
	);
};
export default ProfilePage;
