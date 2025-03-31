import React, {
	useEffect,
	useRef,
	useState,
	useCallback,
	useMemo,
} from "react";
import "../styling/SearchPage.css";
import logocard from "../pictures/flickslogocard.svg";
import searchpicture from "../pictures/search.svg";
import Navbar from "./Navbar.jsx";
import { Link } from "react-router-dom";

function debounce(func, delay) {
	let timer;
	return function (...args) {
		clearTimeout(timer);
		timer = setTimeout(() => {
			func(...args);
		}, delay);
	};
}

function SearchPage() {
	const [popularMovies, setPopularMovies] = useState([]);
	const [searchResults, setSearchresults] = useState([]);
	const [focused, setFocused] = useState(false);
	const inputRef = useRef(null);
	const baseURL = "https://image.tmdb.org/t/p/w500";
	const baseURLSmaller = "https://image.tmdb.org/t/p/w92";

	const options = useMemo(
		() => ({
			method: "GET",
			headers: {
				accept: "application/json",
				Authorization: `Bearer ${process.env.REACT_APP_API_ACCESS_TOKEN}`,
			},
		}),
		[]
	);

	const handleBlur = useCallback(() => {
		setTimeout(() => {
			setFocused(false);
		}, 200);
	}, []);
	const handleFocus = useCallback(() => {
		setFocused(true);
	}, []);

	const handleSearchBarClick = useCallback(() => {
		if (inputRef.current) {
			inputRef.current.focus();
		}
	}, []);

	const updateSearchResults = useCallback(
		(query) => {
			fetch(
				`https://api.themoviedb.org/3/search/movie?query=${query.target.value}&language=en-US&page=1`,
				options
			)
				.then((res) => res.json())
				.then((res) =>
					setSearchresults(
						res.results
							.slice(0, 10)
							.map((movie) => [
								movie.title,
								movie.poster_path,
								movie.release_date,
								movie.vote_average,
								movie.id,
							])
					)
				)
				.catch((err) => console.log(err));
		},
		[options]
	);

	const debouncedUpdateSearchResults = useMemo(
		() => debounce(updateSearchResults, 200),
		[updateSearchResults]
	);

	useEffect(() => {
		fetch(
			"https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=1",
			options
		)
			.then((res) => res.json())
			.then((res) => {
				setPopularMovies(
					res.results.slice(0, 10).map((movie) => ({
					  id: movie.id,
					  poster: movie.poster_path
					}))
				  );
				  
			})
			.catch((err) => console.error(err));
	}, [options]);

	return (
		<div>
			<Navbar />
			<div className="searchpage">
				<div className="search-wrapper">
					<div
						className={`search-bar ${
							focused && searchResults.length > 0 ? "active" : ""
						}`}
						onClick={handleSearchBarClick}
					>
						<img src={searchpicture} alt="search" />
						<input
							type="text"
							placeholder="Search"
							ref={inputRef}
							onFocus={handleFocus}
							onBlur={handleBlur}
							onChange={debouncedUpdateSearchResults}
						/>
					</div>
					{focused && (
						<div className="search-results">
							{searchResults.map((input, i) => {
								return (
									<Link
										to={`/Search/${input[4]}`}
										className="search-result-wrapper"
										key={`wrapper-${i}`}
									>
										<img
											className={`search-result-image ${i}`}
											src={`${baseURLSmaller}${input[1]}`}
											key={`image ${i}`}
											onError={(e) => (e.target.src = logocard)}
										/>
										<div className="search-result-info-wrapper">
											<p
												className={`search-result-name ${i}`}
												key={`movie-name ${i}`}
											>
												{input[0]}
											</p>
											<p
												className={`search-result-date ${i}`}
												key={`movie-year ${i}`}
											>
												{input[2].slice(0, 4)}
											</p>
											<p
												className={`search-result-rating ${i}`}
												key={`movie-rating ${i}`}
											>{`Flicks Rating: ${input[3]
												.toString()
												.slice(0, 3)}/10`}</p>
										</div>
									</Link>
								);
							})}
						</div>
					)}
				</div>
				<h1>Search for your favourite Movies</h1>
				<div className="searchPopularMoviesContainer">
					{popularMovies.map((movie, i) => {
						 return (
							<Link to={`/Search/${movie.id}`} key={i}>
							  <img
								src={`${baseURL}${movie.poster}`}
								alt={`movie ${i}`}
								className={`popular-movie ${i}`}
							  />
							</Link>
						  );
					})}
				</div>
			</div>
		</div>
	);
}

export default SearchPage;
