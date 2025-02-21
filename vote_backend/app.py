from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import base64
import hashlib
import rsa
from homomorphic_encryption import HomomorphicEncryption
from datetime import datetime
import tenseal as ts

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Initialize Homomorphic Encryption
he = HomomorphicEncryption()

# Connect to MongoDB
client = MongoClient("mongodb+srv://sandaru2:sandaru2@test.bgjabxi.mongodb.net/biznesAdverticerDB?retryWrites=true&w=majority")
db = client["biznesAdverticerDB"]
votes_collection = db["votes"]

# Generate RSA Keys for Digital Signatures
public_key, private_key = rsa.newkeys(512)

# Sign function
def sign_vote(vote_data):
    vote_hash = hashlib.sha256(vote_data.encode()).hexdigest()
    signature = rsa.sign(vote_hash.encode(), private_key, 'SHA-256')
    return base64.b64encode(signature).decode()

@app.route('/api/vote/encrypt', methods=['POST'])
def encrypt_vote_route():
    try:
        data = request.get_json()
        
        if not data or 'votes' not in data:
            return jsonify({"error": "Invalid request, 'votes' are required"}), 400

        votes = data['votes']

        if not isinstance(votes, list) or not votes:
            return jsonify({"error": "'votes' must be a non-empty list"}), 400

        for vote in votes:
            candidate_id = vote.get('candidate_id')
            priority = vote.get('priority')

            if candidate_id is None or priority is None:
                return jsonify({"error": "'candidate_id' and 'priority' are required"}), 400

            try:
                priority = float(priority)  # ✅ Convert priority to number
            except ValueError:
                return jsonify({"error": "Priority must be a number"}), 400

            # Encrypt only the priority and store candidate_id as a string
            encrypted_priority = he.encrypt_vote(priority)
            encrypted_priority_serialized = base64.b64encode(encrypted_priority.serialize()).decode('utf-8')

            # Check if the candidate already exists in the database
            existing_vote = votes_collection.find_one({"candidate_id": candidate_id})

            if existing_vote:
                # If the candidate exists, update the existing entry with the new priority
                votes_collection.update_one(
                    {"candidate_id": candidate_id},
                    {"$push": {"encrypted_priorities": encrypted_priority_serialized}}
                )
            else:
                # If the candidate does not exist, create a new entry with the first priority
                votes_collection.insert_one({
                    "candidate_id": candidate_id,  # Store candidate_id as a string
                    "encrypted_priorities": [encrypted_priority_serialized],  # Store first encrypted priority in array
                    "timestamp": datetime.utcnow().isoformat()
                })

        return jsonify({"message": "Votes encrypted and stored securely"}), 200

    except Exception as e:
        return jsonify({"error": f"Error encrypting votes: {str(e)}"}), 500


@app.route('/api/vote/count', methods=['GET'])
def count_votes():
    try:
        vote_counts = {}

        for doc in votes_collection.find():
            candidate_id = doc["candidate_id"]
            encrypted_priorities = doc["encrypted_priorities"]

            priority_sums = {}  # Dictionary to store encrypted sums per priority

            for encrypted_priority_serialized in encrypted_priorities:
                encrypted_priority = ts.ckks_vector_from(he.context, base64.b64decode(encrypted_priority_serialized))
                decrypted_priority = int(round(encrypted_priority.decrypt()[0]))  # Decrypt first to get priority level

                # **Fix: Only count as one vote per occurrence**
                if decrypted_priority not in priority_sums:
                    priority_sums[decrypted_priority] = 1  # First vote in this priority
                else:
                    priority_sums[decrypted_priority] += 1  # Just add 1, not the priority value

            vote_counts[candidate_id] = priority_sums  # Store structured priority-wise results

        return jsonify(vote_counts), 200
    except Exception as e:
        return jsonify({"error": f"Error counting votes: {str(e)}"}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
