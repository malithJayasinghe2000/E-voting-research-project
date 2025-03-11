import cv2
import numpy as np
from fastapi import FastAPI, WebSocket
from fastapi.responses import JSONResponse
from keras.preprocessing.image import img_to_array
from keras.applications.mobilenet_v2 import preprocess_input
from tensorflow.keras.models import load_model
from fastapi.middleware.cors import CORSMiddleware
import asyncio

app = FastAPI()

# Enable CORS for frontend interaction
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the trained model
model = load_model("mask_detector.h5")

# Load face detector
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Open webcam
cap = cv2.VideoCapture(0)  # Use '0' for the default webcam


@app.get("/api/detect_mask")
async def detect_mask():
    """ Capture a frame and detect if a mask is worn """
    success, frame = cap.read()
    if not success:
        return JSONResponse(content={"error": "Failed to capture image"}, status_code=500)

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

    if len(faces) == 0:
        return {"message": "No face detected", "mask": None}

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

        return {"mask_detected": bool(mask_detected)}

    return {"message": "Face detected but no mask result"}


@app.websocket("/ws/detect")
async def detect_mask(ws: WebSocket):
    """ WebSocket endpoint for real-time mask detection """
    await ws.accept()

    global cap  # Use global to ensure proper handling
    cap.release()  # Release the camera if it was in use
    cap = cv2.VideoCapture(0)  # Reinitialize the camera

    try:
        while True:
            success, frame = cap.read()
            if not success:
                await ws.send_json({"error": "Failed to capture image"})
                break

            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

            if len(faces) == 0:
                await ws.send_json({"mask_detected": None, "message": "No face detected"})
                await asyncio.sleep(1)  # Prevent overloading
                continue

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

                await ws.send_json({"mask_detected": bool(mask_detected)})
                await asyncio.sleep(1)  # Limit detection frequency
    except Exception as e:
        print(f"WebSocket Error: {e}")
    finally:
        cap.release()  # Ensure camera is released when WebSocket closes
        print("Camera released on WebSocket close")



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
