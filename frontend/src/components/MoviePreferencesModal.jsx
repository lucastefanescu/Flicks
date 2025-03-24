import Select from "react-select";
import AsyncSelect from "react-select/async";
import genres from "../Data/genres.json";
import moods from "../Data/moods.json";
import "../styling/MoviePreferences.css";
import { useMemo } from "react";

const API_KEY = process.env.REACT_APP_TMDB_API_KEY;

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

const oldRecent = [
	{ label: "Recent", value: "recent" },
	{ label: "Classic", value: "classic" },
];

function debounce(fn, delay) {
	let timeoutId;
	return function (...args) {
		clearTimeout(timeoutId);
		return new Promise((resolve, reject) => {
			timeoutId = setTimeout(async () => {
				try {
					const result = await fn.apply(args);
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
			`https://api.themoviedb.org/3/search/movie?query=${inputValue}&include_adult=true&language=en-US&page=1&region=US`,
			options
		);
		const result = await response.json();
		return result.results.map((movie) => ({
			value: movie.original_title.toLowerCase(),
			label: movie.original_title,
		}));
	} catch {
		console.log("Error has Occurred when calling API to retrieve movies");
		return [];
	}
};

const debouncedLoadOptions = debounce(loadOptions, 300);

function MoviePreferencesModal() {
	return (
		<div>
			<div className="preference-modal">
				<div className="preference-modal-inside">
					<h1>Set movie preferences</h1>
					<h2>Preferred Genres</h2>
					<Select
						options={mappedGenres}
						isMulti={true}
						classNamePrefix="react-select"
					/>
					<h2>What are Your 3 Favourite Movies</h2>
					<AsyncSelect
						loadOptions={debouncedLoadOptions}
						classNamePrefix="react-select"
					/>
					<h2>How Much Do You Enjoy Animated Movies (1-5)</h2>
					<Select options={mappedRatings} classNamePrefix="react-select" />
					<h2>What is your mood right now</h2>
					<Select options={mappedMoods} classNamePrefix="react-select" />
					<h2>Do you Prefer Older Movies or Recent Movies</h2>
					<Select options={oldRecent} classNamePrefix="react-select" />
					<button>SUBMIT</button>
				</div>
			</div>
		</div>
	);
}

export default MoviePreferencesModal;
