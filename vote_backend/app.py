import io
from tkinter import Image
import cv2
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from pymongo import MongoClient
import base64
import hashlib
import rsa
from homomorphic_encryption import HomomorphicEncryption
from datetime import datetime
import tenseal as ts
from deepface import DeepFace
from gtts import gTTS
import os
from PIL import Image

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Initialize Homomorphic Encryption
he = HomomorphicEncryption()

# Connect to MongoDB
client = MongoClient("mongodb+srv://sandaru2:sandaru2@test.bgjabxi.mongodb.net/biznesAdverticerDB?retryWrites=true&w=majority")
db = client["biznesAdverticerDB"]
votes_collection = db["votes"]

employees_collection = db["employees"]
attendance_collection = db["attendance"]

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

        if not data or 'votes' not in data or 'poll_manager_id' not in data:
            return jsonify({"error": "Invalid request, 'votes' and 'poll_manager_id' are required"}), 400

        votes = data['votes']
        poll_manager_id = data['poll_manager_id']

        if not isinstance(votes, list) or not votes:
            return jsonify({"error": "'votes' must be a non-empty list"}), 400

        for vote in votes:
            candidate_id = vote.get('candidate_id')
            priority = vote.get('priority')

            if candidate_id is None or priority is None:
                return jsonify({"error": "'candidate_id' and 'priority' are required"}), 400

            try:
                priority = float(priority)  # Convert priority to number
            except ValueError:
                return jsonify({"error": "Priority must be a number"}), 400

            # Encrypt only the priority
            encrypted_priority = he.encrypt_vote(priority)
            encrypted_priority_serialized = base64.b64encode(encrypted_priority.serialize()).decode('utf-8')

            # Check if the candidate already exists in the database for the same polling manager
            existing_vote = votes_collection.find_one({"candidate_id": candidate_id, "poll_manager_id": poll_manager_id})

            if existing_vote:
                # If the candidate exists under the same polling manager, update the existing entry
                votes_collection.update_one(
                    {"candidate_id": candidate_id, "poll_manager_id": poll_manager_id},
                    {"$push": {"encrypted_priorities": encrypted_priority_serialized}}
                )
            else:
                # If the candidate does not exist under this polling manager, create a new entry
                votes_collection.insert_one({
                    "candidate_id": candidate_id,
                    "poll_manager_id": poll_manager_id,  # Store the polling manager ID
                    "encrypted_priorities": [encrypted_priority_serialized],
                    "timestamp": datetime.utcnow().isoformat()
                })


        return jsonify({"message": "Votes encrypted and stored securely"}), 200

    except Exception as e:
        return jsonify({"error": f"Error encrypting votes: {str(e)}"}), 500


@app.route('/api/vote/count', methods=['GET'])
def count_votes():
    try:
        poll_manager_id = request.args.get("poll_manager_id")  # Get polling manager ID from query params

        if not poll_manager_id:
            return jsonify({"error": "Polling manager ID is required"}), 400

        vote_counts = {}

        # Query votes specific to the provided polling manager
        for doc in votes_collection.find({"poll_manager_id": poll_manager_id}):
            candidate_id = doc["candidate_id"]
            encrypted_priorities = doc["encrypted_priorities"]

            priority_sums = {}  # Dictionary to store encrypted sums per priority

            for encrypted_priority_serialized in encrypted_priorities:
                encrypted_priority = ts.ckks_vector_from(he.context, base64.b64decode(encrypted_priority_serialized))
                decrypted_priority = int(round(encrypted_priority.decrypt()[0]))  # Decrypt first to get priority level

                if decrypted_priority not in priority_sums:
                    priority_sums[decrypted_priority] = 1
                else:
                    priority_sums[decrypted_priority] += 1  # Count occurrences, not priority value

            # Store results
            vote_counts[candidate_id] = priority_sums

        return jsonify(vote_counts), 200
    except Exception as e:
        return jsonify({"error": f"Error counting votes: {str(e)}"}), 500

# Convert image from base64

def decode_image(image_data):
    image_bytes = base64.b64decode(image_data)
    img = Image.open(io.BytesIO(image_bytes))
    return cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)

@app.route("/api/add_employee", methods=["POST"])
def add_employee():
    # Get all the fields from the request
    data = request.json
    name = data.get("name")
    nic = data.get("nic")
    birthday = data.get("birthday")
    gender = data.get("gender")
    voter_type = data.get("voterType")
    village = data.get("village")
    household_no = data.get("householdNo")
    grama_niladari_division = data.get("gramaNiladariDivision")
    polling_district_no = data.get("pollingDistrictNo")
    polling_division = data.get("pollingDivision")
    electoral_district = data.get("electoralDistrict")
    relationship_to_chief = data.get("relationshipToChief")
    image_data = data.get("image")

    # Check if all required fields are provided
    required_fields = [
        "name", "nic", "birthday", "gender", "voterType", "village", 
        "householdNo", "gramaNiladariDivision", "pollingDistrictNo", 
        "pollingDivision", "electoralDistrict", "relationshipToChief", "image"
    ]
    
    # If any required field is missing, return error
    missing_fields = [field for field in required_fields if data.get(field) is None or data.get(field) == ""]
    
    if missing_fields:
        return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400
    
    frame = decode_image(image_data)
    embedding = get_face_embedding(frame)
    if embedding is None:
        return jsonify({"error": "Could not extract face embedding"}), 400
    
    embedding = get_face_embedding(frame)
    if embedding is None:
        return jsonify({"error": "Could not extract face embedding"}), 400
    
    
    # Create MongoDB document
    employee_data = {
        "name": name,
        "nic": nic,
        "birthday": birthday,
        "gender": gender,
        "voterType": voter_type,
        "village": village,
        "householdNo": household_no,
        "gramaNiladariDivision": grama_niladari_division,
        "pollingDistrictNo": polling_district_no,
        "pollingDivision": polling_division,
        "electoralDistrict": electoral_district,
        "relationshipToChief": relationship_to_chief,
        "encoding": embedding,  # Store face embedding for recognition
        "voted": 0  # Default value: 0 (not voted)
    }

    # Insert into MongoDB
    employees_collection.insert_one(employee_data)

    return jsonify({"message": f"{name} added successfully with all required voter details!"})

@app.route("/api/recognize_employee", methods=["POST"])
def recognize_employee():
    data = request.json
    image_data = data.get("image")
    
    if not image_data:
        return jsonify({"error": "Image is required"}), 400
    
    frame = decode_image(image_data)
    embedding = get_face_embedding(frame)
    if embedding is None:
        return jsonify({"error": "Could not extract face embedding"}), 400
    
    employees = employees_collection.find()
    for employee in employees:
        known_embedding = np.array(employee["encoding"], dtype=np.float32)
        embedding = np.array(embedding, dtype=np.float32)

        # Normalize both embeddings
        known_embedding /= np.linalg.norm(known_embedding)
        embedding /= np.linalg.norm(embedding)

        # Compute distance
        distance = np.linalg.norm(known_embedding - embedding)
        print(f"Comparing with {employee['name']}, Distance: {distance}")  # Debug

        if distance < 0.5:  # Reduce threshold for normalized embeddings
            # Check if this voter has already voted
            if "voted" in employee and employee["voted"] == 1:
                return jsonify({
                    "error": "You have already voted in this election.",
                    "already_voted": True
                }), 403
            
            # Update the voter's status to "voted" = 1
            employees_collection.update_one(
                {"_id": employee["_id"]},
                {"$set": {"voted": 1}}
            )
            
            record_attendance(employee["_id"], employee["name"])
            return jsonify({"message": f"Welcome {employee['name']}"})

    return jsonify({"error": "Employee not recognized"}), 404

def get_face_embedding(img):
    try:
        return DeepFace.represent(img, model_name="Facenet", enforce_detection=False)[0]["embedding"]
    except Exception as e:
        print(f"Embedding error: {e}")
        return None

def record_attendance(employee_id, name):
    attendance_collection.insert_one({
        "employee_id": employee_id,
        "type": "entry" if 5 <= datetime.now().hour < 17 else "exit",
        "timestamp": datetime.now()
    })
    play_greeting(name)

def play_greeting(name):
    greeting = f"Welcome {name}"
    print(greeting)  # Print the greeting instead of playing audio

# def play_greeting(name):
#     greeting = f"Welcome {name}"
#     tts = gTTS(greeting, lang='en')
#     tts.save("greeting.mp3")
#     os.system("greeting.mp3")

if __name__ == '__main__':
    app.run(debug=True, port=5000)