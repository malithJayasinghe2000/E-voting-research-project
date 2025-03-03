from flask import Flask, request, jsonify
from homomorphic_encryption import HomomorphicEncryption
import pymongo

app = Flask(__name__)
db_client = pymongo.MongoClient("mongodb+srv://sandaru2:sandaru2@test.bgjabxi.mongodb.net/biznesAdverticerDB?retryWrites=true&w=majority")
db = db_client["biznesAdverticerDB"]
votes_collection = db["votes"]

# Initialize Homomorphic Encryption
he = HomomorphicEncryption()

@app.route("/api/vote/encrypt", methods=["POST"])
def encrypt_vote():
    data = request.json
    candidates = data.get("candidates", [])

    if not candidates:
        return jsonify({"error": "No candidates selected"}), 400

    # Encrypt each candidate number
    encrypted_votes = [he.encrypt_vote(candidate) for candidate in candidates]

    # Store encrypted votes in MongoDB
    votes_collection.insert_one({"encrypted_votes": encrypted_votes})

    return jsonify({"message": "Votes encrypted and stored successfully"}), 200

if __name__ == "__main__":
    app.run(debug=True)
