import cv2
import numpy as np
from flask import Flask, jsonify
from keras.preprocessing.image import img_to_array
from keras.applications.mobilenet_v2 import preprocess_input
from tensorflow.keras.models import load_model
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})


# Load the trained model
model = load_model("mask_detector.h5")

# Load face detector
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Open webcam
cap = cv2.VideoCapture(0)  # Use '0' for the default webcam


@app.route('/api/detect_mask', methods=['GET'])
def detect_mask():
    """ Capture a frame and detect if a mask is worn """
    success, frame = cap.read()
    if not success:
        return jsonify({"error": "Failed to capture image"}), 500

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

    if len(faces) == 0:
        return jsonify({"message": "No face detected", "mask": None})

    for (x, y, w, h) in faces:
        face = frame[y:y + h, x:x + w]

        # Preprocess the face
        face = cv2.resize(face, (224, 224))
        face = img_to_array(face)
        face = preprocess_input(face)
        face = np.expand_dims(face, axis=0)

        # Predict mask or no mask
        pred = model.predict(face)

        if pred.shape[1] == 1:
            without_mask = pred[0][0]
            mask = 1 - without_mask
        else:
            mask, without_mask = pred[0]

        mask_detected = mask > without_mask

        return jsonify({"mask_detected": bool(mask_detected)})

    return jsonify({"message": "Face detected but no mask result"})


if __name__ == "__main__":
    app.run(debug=True)
