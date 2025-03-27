import React from "react";
import "../styling/MovieCard.css"; // Import CSS file

function MovieCard({ title, image }) {
  return (
    <div className="movie-card">
      <img src={image} alt={title} className="movie-poster" />
      <h3 className="movie-title">{title}</h3>
    </div>
  );
}
export default MovieCard;