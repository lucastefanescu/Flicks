import "../styling/ProfilePage.css";
import MainPageNavBar from "./MainPageNavbar";
import React, { useState, useEffect, useRef } from 'react';
import MovieCard from "./MovieCard.jsx";

const liked_movies = [{title: "test1", image: "image1"},{title: "test2", image: "image2"},{title: "test3", image: "image3"}];// db call
const movie_recommendations = [{title: "test1", image: "image1"},{title: "test2", image: "image2"},{title: "test3", image: "image3"}] // db call 
const users_name = "User" // need to do a dbcall to assign this or save as cookie

const liked_movie_elements = liked_movies.map(movie => <MovieCard title={movie.title} image={movie.image} /> );
const movie_recommendations_elements = movie_recommendations.map(movie => <MovieCard title={movie.title} image={movie.image} />)

const ProfilePage = () => {
    return (
		<div className="main">
			<MainPageNavBar
			/>
            <h1 className="welcome_text">Hello {users_name} </h1>
            <div>
                <h3 className="section_heading">Liked Movies</h3>
                <div className="movie_container">{liked_movie_elements}</div>
            </div>
            <div>
                <h3 className="section_heading">Movie Recommendations</h3>
                <div className="movie_container">{movie_recommendations_elements}</div>
            </div>
           
            </div>
    );
}
export default ProfilePage;