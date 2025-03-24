import { FaStar, FaStarHalfAlt } from "react-icons/fa";
import React, { useState } from "react"

export default function StarRate({ onRatingSelected = () => {} }) {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);

    const handleMouseMove = (event, index) => {
        const { left, width } = event.currentTarget.getBoundingClientRect();
        const xPos = event.clientX - left;
        const isHalf = xPos < width / 2;
        setHover(isHalf ? index + 0.5 : index + 1);
    };

    const handleRatingClick = (selectedRating) => {
        setRating(selectedRating);
        if (onRatingSelected) {
            onRatingSelected(selectedRating);
        }
    };


    return (
        <div style={{ display: "flex", gap: "5px" }}>
            {[...Array(5)].map((_, index) => {
                const currentRate = index + 1;
                const displayRating = hover || rating;

                return (
                    <div
                        key={index}
                        style={{ position: "relative", cursor: "pointer" }}
                        onMouseMove={(e) => handleMouseMove(e, index)}
                        onMouseLeave={() => setHover(0)}
                        onClick={() => handleRatingClick(displayRating)}
                    >
                        {displayRating >= currentRate - 0.5 && displayRating < currentRate ? (
                            <FaStarHalfAlt size={30} color="#ffd700" />
                        ) : displayRating >= currentRate ? (
                            <FaStar size={30} color="#ffd700" />
                        ) : (
                            <FaStar size={30} color="#DC143C" />
                        )}
                    </div>
                );
            })}
        </div>
    )
}