import { useParams } from "react-router-dom";
import { useAuth } from "./AuthContext";
import "../styling/MoviePage.css";
import StarRate from "./StarRate";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const API_KEY = process.env.REACT_APP_TMDB_API_KEY;

// must be called with either movie name AND year, OR using the movie's id
const MoviePage = ({ movieName = "default", year = "default" }) => {
	const [movie, setMovie] = useState(null);
	const [error, setError] = useState(null);
	const { id } = useParams();
	const { userId } = useAuth();
	const [rating, setRating] = useState(null);

	useEffect(() => {
		console.log("useEffect triggered with:", movieName, year);
		console.log("Backdrop Path:", movie?.backdropPath);
		if (!movieName && !id) return;

		const fetchMovie = async () => {
			try {
				let movieId;

				if (movieName !== "default" && year !== "default") {
					console.log("Fetching movie with:", movieName, year);
					const searchRes = await fetch(
						`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
							movieName
						)}&year=${year}`
					);
					if (!searchRes.ok) {
						throw new Error("Failed to fetch search results");
					}

					const searchData = await searchRes.json();
					console.log("searchData:", searchData);

					if (searchData.results.length === 0) {
						setError("Movie not found");
						return;
					}

					movieId = searchData.results[0].id;
				} else {
					movieId = id;
				}

				const detailsRes = await fetch(
					`https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}&append_to_response=release_dates,credits,videos`
				);
				if (!detailsRes.ok)
					throw new Error("Failed to fetch movie details, invalid movie ID");

				const details = await detailsRes.json();
				console.log("Fetched movie details:", details);

				const usRelease = details.release_dates?.results.find(
					(r) => r.iso_3166_1 === "US"
				);
				const advisoryRating =
					usRelease?.release_dates.find((r) => r.certification)
						?.certification || "N/A";

				const director =
					details.credits.crew.find((person) => person.job === "Director")
						?.name || "Unknown";
				const genres = details.genres.map((genre) => genre.name).join(", ");
				const cast = details.credits.cast
					.slice(0, 5)
					.map((actor) => actor.name)
					.join(", ");
				const trailer = details.videos.results.find(
					(video) => video.site === "YouTube" && video.type === "Trailer"
				);
				const trailerUrl = trailer
					? `https://www.youtube.com/embed/${trailer.key}`
					: null;

				setMovie({
					title: details.title,
					overview: details.overview,
					releaseYear: details.release_date?.split("-")[0],
					runtime: details.runtime,
					posterPath: details.poster_path,
					advisoryRating: advisoryRating,
					director: director,
					genres: genres,
					cast: cast,
					trailerUrl: trailerUrl,
					bannerURL: details.backdrop_path || "",
				});

				setError(null);
			} catch (err) {
				console.error("Error fetching movie details:", err);
				setError("Failed to fetch movie details");
				setMovie(null);
			}
		};

		fetchMovie();
	}, [movieName, year, id]);

	if (error) return <p>{error}</p>;
	if (!movie) return <p>Loading...</p>;

	const handleRatingSubmit = (newRating) => {
		setRating(newRating);

		sendRatingToBackend(newRating);
	};

	const sendRatingToBackend = async (newRating) => {
		try {
			const ratingData = {
				//userId: userId,
				movieId: id,
				rating: newRating,
				title: movie.title,
				year: movie.releaseYear,
				genres: movie.genres,
			};

			const response = await axios.post(
				`http://localhost:8000/users/${userId}/ratings`,
				ratingData
			);
			toast.success("Rating submitted successfully:", response.data);
		} catch (error) {
			toast.error("Failed to submit rating:", error);
		}
	};

	return (
		<div className="movie-page">
			<div className="banner-container">
				<img
					className="banner-image"
					src={`https://image.tmdb.org/t/p/original${movie.bannerURL}`}
					loading="lazy"
					alt="banner"
				></img>
				<div className="banner-overlay"></div>
			</div>

			<header className="header">
				<h1 className="title">{movie.title}</h1>
				<h2 className="year">{movie.releaseYear}</h2>
			</header>

			<div className="content-wrapper">
				<section className="main-content" id="sub">
					<section className="info">
						<p>
							<strong>Directed by:</strong> {movie.director}
						</p>
						<p>
							<strong>
								{movie.advisoryRating}, {movie.runtime} min
							</strong>
						</p>
					</section>

					<section className="genres">
						<p>
							<em>{movie.genres}</em>
						</p>
					</section>

					<section className="overview">
						<h3>Overview</h3>
						<p>{movie.overview}</p>
					</section>

					<section className="rating">
						<h3>Rate</h3>
						<StarRate onRatingSelected={handleRatingSubmit} />
					</section>

					<section className="cast">
						<h3>Cast</h3>
						<p>
							<em>{movie.cast}</em>
						</p>
					</section>

					<section className="trailer">
						<h3>Trailer</h3>
						{movie.trailerUrl ? (
							<iframe
								height="315"
								frameBorder="0"
								src={movie.trailerUrl}
								title="YouTube video player"
								allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
								allowFullScreen
							></iframe>
						) : (
							<p>No trailer available</p>
						)}
					</section>
				</section>

				<div className="sidebar">
					<img
						className="poster"
						src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
						loading="lazy"
						alt="Poster"
					></img>
				</div>
			</div>
		</div>
	);
};

export default MoviePage;
