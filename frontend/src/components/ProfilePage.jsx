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
		items: 3,
	},
	tablet: {
		breakpoint: { max: 1024, min: 464 },
		items: 2,
	},
	mobile: {
		breakpoint: { max: 464, min: 0 },
		items: 1,
	},
};

const options = {
	method: "GET",
	headers: {
		accept: "application/json",
		Authorization:
			"Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0YjNiNmUxMjEwOGRlYTRiZWY3NTJkZGY1OGUwMTY4ZCIsIm5iZiI6MTc0MDUxODQzMy4wNDcwMDAyLCJzdWIiOiI2N2JlMzQyMTM5Y2I3ODIwZDBlZjlkMjUiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.Gum5ygmItHZaQaZkWHWNTr8s5KNxSzPTwau8fi88BXU",
	},
};

const ProfilePage = () => {
	const [] = useState([]);
	const [Recommendations, setRecommendations] = useState([]);
	const { userId } = useAuth();
	useEffect(() => {
		console.log("RECOMMENDATIONS: " + Recommendations);
	}, [Recommendations]);

	useEffect(() => {
		console.log("USER ID IS: " + userId);
	}, [userId]);

	useEffect(() => {
		async function fetchData() {
			try {
				const response = await fetch(
					"http://localhost:8000/Recommendations/getCosRecommendations",
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
				const finalQueryIds = queryIds[1];
				finalQueryIds.forEach(async (id) => {
					const response2 = await fetch(
						`https://api.themoviedb.org/3/movie/${id}?language=en-US`,
						options
					);
					if (!response2.ok) {
						console.log("error in second fetch" + response.status);
					}
					const result = await response2.json();
					console.log(Object.values(result));
					// setRecommendations(result.belongs_to_collection.poster_path);
				});
			} catch (err) {
				console.log(err);
			}
		}
		fetchData();
	}, [userId]);

	return (
		<>
			<Navbar></Navbar>
			<Carousel responsive={responsive}>
				<div>item 1</div>
				{Recommendations.map((value, i) => {
					return <img src={`${value}`} alt={`movie ${i}`} key={i} />;
				})}
			</Carousel>
		</>
	);
};
export default ProfilePage;
