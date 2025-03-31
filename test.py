import csv
from pymongo import MongoClient
from surprise import SVD, Dataset, Reader

client = MongoClient("mongodb://localhost:27017")  # Use your Mongo URI
db = client["mydatabase"]
collection = db["ratings"]

csv_file = "ratings_temp.csv"
with open(csv_file, "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["userId", "movieId", "rating"])
    
    cursor = collection.find({})
    for doc in cursor:
        writer.writerow([doc["userId"], doc["movieId"], doc["rating"]])

# ----- Step 2: Load the dataset using Surprise from the CSV file -----
# Here we tell Surprise the file's format and rating scale.
reader = Reader(line_format="user item rating", sep=",", rating_scale=(1, 5))
data = Dataset.load_from_file(csv_file, reader=reader)
trainset = data.build_full_trainset()

# Train the SVD model
svd = SVD()
svd.fit(trainset)

# ----- Step 3: Get the candidate item IDs without loading the full dataset -----
# Instead of reading a DataFrame to get all movie IDs, use Mongo's distinct() command.
all_movie_ids = collection.distinct("movieId")

# ----- Step 4: Recommendation function (same as before) -----
def recommend_for_user(trained_svd, trainset, user_id, all_items, top_n=10):
    # Convert to Surprise’s internal user ID
    inner_uid = trainset.to_inner_uid(user_id)

    # Items the user has already interacted with in the training set
    user_items = {j for (j, _) in trainset.ur[inner_uid]}

    # Build a testset for all items the user hasn't rated
    testset = []
    for movie_id in all_items:
        inner_iid = trainset.to_inner_iid(movie_id)
        if inner_iid not in user_items:
            testset.append((user_id, movie_id, 0))  # 0 is a dummy rating

    # Get predictions and sort them
    predictions = trained_svd.test(testset)
    predictions.sort(key=lambda x: x.est, reverse=True)

    # Return the top N recommendations
    return [(pred.iid, pred.est) for pred in predictions[:top_n]]

# Example usage:
user_id = 123
recommendations = recommend_for_user(svd, trainset, user_id, all_movie_ids, top_n=10)
for movie_id, score in recommendations:
    print(f"Movie: {movie_id}, Estimated Rating: {score:.2f}")
