import Select from "react-select";
import AsyncSelect from "react-select/async";
import genres from "../Data/genres.json";
import moods from "../Data/moods.json";
import idToGenre from "../Data/idtogenre.json";
import "../styling/MoviePreferences.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";

const API_KEY = process.env.REACT_APP_API_ACCESS_TOKEN;

const options = {
	method: "GET",
	headers: {
		accept: "application/json",
		Authorization: `Bearer ${API_KEY}`,
	},
};

const mappedGenres = genres.map((name) => ({
	value: name.toLowerCase(),
	label: name,
}));

const ratings = [1, 2, 3, 4, 5];

const mappedRatings = ratings.map((num) => ({
	value: num,
	label: num,
}));

const mappedMoods = moods.map((mood) => ({
	value: mood.toLowerCase(),
	label: mood,
}));

const genreMap = new Map(
	idToGenre.genres.map((value) => [value.id, value.name])
);

const oldRecent = [
	{ label: "Recent", value: 1 },
	{ label: "Classic", value: 0 },
];

function debounce(fn, delay) {
	let timeoutId;
	let lastReject;
	return function (...args) {
		if (lastReject) {
			lastReject({ canceled: true });
		}
		clearTimeout(timeoutId);
		return new Promise((resolve, reject) => {
			timeoutId = setTimeout(async () => {
				try {
					const result = await fn(...args);
					resolve(result);
				} catch (error) {
					reject(error);
				}
			}, delay);
		});
	};
}

const loadOptions = async (inputValue) => {
	try {
		const response = await fetch(
			`https://api.themoviedb.org/3/search/movie?query=${inputValue}&include_adult=false&language=en-US&page=1&region=US`,
			options
		);
		const result = await response.json();
		return result.results.map((movie) => ({
			value: movie.id,
			label: movie.original_title,
			genre: movie.genre_ids.map((value) => genreMap.get(value)),
		}));
	} catch {
		console.log("Error has Occurred when calling API to retrieve movies");
		return [];
	}
};

const debouncedLoadOptions = debounce(loadOptions, 300);

function MoviePreferencesModal() {
	const [genres, setGenres] = useState([]);
	const [movies, setMovies] = useState([]);
	const [animation, setAnimation] = useState(0);
	const [olderRecent, setOlderRecent] = useState(-1);
	const { userId } = useAuth();
	const navigate = useNavigate();

	const handleMoviesChange = useCallback(async (values) => {
		if (Array.isArray(values)) {
			setMovies(values);
		} else {
			setMovies([values]);
		}
	}, []);

	const handleFormSubmit = useCallback(
		async (e) => {
			e.preventDefault();
			try {
				const response = await fetch(
					"http://localhost:8000/Recommendations/SubmitModal",
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							user_id: userId,
							genres: genres.map((obj) => obj.label),
							fav_movies: movies.flatMap((obj) => obj.genre),
							animated_movies: animation.label,
							older_recent: olderRecent.value,
						}),
					}
				);
				if (!response.ok) {
					console.log(response.status);
				} else {
					navigate("/");
				}
			} catch (err) {
				console.log(err);
			}
		},
		[genres, movies, userId, animation, olderRecent, navigate]
	);

	return (
		<div className="Modal-Container">
			<div className="preference-modal">
				<form className="preference-modal-inside" onSubmit={handleFormSubmit}>
					<h1>Set movie preferences</h1>
					<h2>Preferred Genres</h2>
					<Select
						options={mappedGenres}
						isMulti={true}
						classNamePrefix="react-select"
						value={genres}
						onChange={(values) => {
							if (Array.isArray(values)) {
								setGenres(values);
							} else {
								setGenres([values]);
							}
						}}
					/>
					<h2>What are Your 3 Favourite Movies</h2>
					<AsyncSelect
						loadOptions={debouncedLoadOptions}
						classNamePrefix="react-select"
						isMulti={true}
						value={movies}
						onChange={handleMoviesChange}
					/>
					<h2>How Much Do You Enjoy Animated Movies (1-5)</h2>
					<Select
						options={mappedRatings}
						classNamePrefix="react-select"
						value={animation}
						onChange={(value) => setAnimation(value)}
					/>
					<h2>What is your mood right now</h2>
					<Select options={mappedMoods} classNamePrefix="react-select" />
					<h2>Do you Prefer Older Movies or Recent Movies</h2>
					<Select
						options={oldRecent}
						classNamePrefix="react-select"
						value={olderRecent}
						onChange={(value) => {
							setOlderRecent(value);
						}}
					/>
					<button type="submit">SUBMIT</button>
				</form>
			</div>
		</div>
	);
}

export default MoviePreferencesModal;
