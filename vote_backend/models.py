import cv2
import numpy as np
from fastapi import FastAPI, WebSocket, File, UploadFile, HTTPException, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from keras.preprocessing.image import img_to_array
from keras.applications.mobilenet_v2 import preprocess_input
from tensorflow.keras.models import load_model
from motor.motor_asyncio import AsyncIOMotorClient
import base64
import io
from datetime import datetime
from PIL import Image
from deepface import DeepFace
import asyncio
from pydantic import BaseModel

app = FastAPI()

# Enable CORS for frontend interaction
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load models
model = load_model("mask_detector.h5")

face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# MongoDB connection
MONGO_URI = "mongodb+srv://sandaru2:sandaru2@test.bgjabxi.mongodb.net/biznesAdverticerDB?retryWrites=true&w=majority"
client = AsyncIOMotorClient(MONGO_URI)
db = client["biznesAdverticerDB"]
employees_collection = db["employees"]
attendance_collection = db["attendance"]

# Open webcam
cap = cv2.VideoCapture(0)


def decode_image(image_data: str):
    """ Decode base64 image and convert to OpenCV format """
    image_bytes = base64.b64decode(image_data)
    img = Image.open(io.BytesIO(image_bytes))
    return cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)


async def get_face_embedding(img):
    """ Extract face embedding using DeepFace """
    try:
        embedding = await asyncio.to_thread(
            DeepFace.represent, img, model_name="Facenet", enforce_detection=False
        )
        return embedding[0]["embedding"] if embedding else None
    except Exception as e:
        print(f"Embedding error: {e}")
        return None


async def record_attendance(employee_id, name):
    """ Log employee attendance """
    await attendance_collection.insert_one({
        "employee_id": employee_id,
        "type": "entry" if 5 <= datetime.now().hour < 17 else "exit",
        "timestamp": datetime.now()
    })


# @app.post("/api/add_employee")
# async def add_employee(name: str, image: str):
#     """ Add employee to database with face encoding """
#     frame = decode_image(image)
#     embedding = await get_face_embedding(frame)

#     if embedding is None:
#         raise HTTPException(status_code=400, detail="Could not extract face embedding")

#     await employees_collection.insert_one({"name": name, "encoding": embedding})
#     return {"message": f"{name} added successfully!"}


class ImageRequest(BaseModel):
    image: str  # Ensure 'image' is a string (Base64-encoded)

@app.post("/api/recognize_employee")
async def recognize_employee(data: ImageRequest):
    """ Recognize employee and record attendance """
    frame = decode_image(data.image)  # Access 'image' correctly
    embedding = await get_face_embedding(frame)

    if embedding is None:
        raise HTTPException(status_code=400, detail="Could not extract face embedding")

    employees = employees_collection.find()
    async for employee in employees:
        known_embedding = np.array(employee["encoding"], dtype=np.float32)
        embedding = np.array(embedding, dtype=np.float32)

        # Normalize embeddings
        known_embedding /= np.linalg.norm(known_embedding)
        embedding /= np.linalg.norm(embedding)

        # Compute similarity
        distance = np.linalg.norm(known_embedding - embedding)

        if distance < 0.5:
            await record_attendance(employee["_id"], employee["name"])
            return {"message": f"Welcome {employee['name']}"}

    raise HTTPException(status_code=404, detail="Employee not recognized")


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
        face = cv2.resize(face, (224, 224))
        face = img_to_array(face)
        face = preprocess_input(face)
        face = np.expand_dims(face, axis=0)

        pred = model.predict(face)
        mask, without_mask = pred[0] if pred.shape[1] == 2 else (1 - pred[0][0], pred[0][0])

        return {"mask_detected": bool(mask > without_mask)}

    return {"message": "Face detected but no mask result"}


@app.websocket("/ws/detect")
async def detect_mask(ws: WebSocket):
    """ WebSocket endpoint for real-time mask detection """
    await ws.accept()

    global cap
    cap.release()
    cap = cv2.VideoCapture(0)

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
                await asyncio.sleep(1)
                continue

            for (x, y, w, h) in faces:
                face = frame[y:y + h, x:x + w]
                face = cv2.resize(face, (224, 224))
                face = img_to_array(face)
                face = preprocess_input(face)
                face = np.expand_dims(face, axis=0)

                pred = model.predict(face)
                mask, without_mask = pred[0] if pred.shape[1] == 2 else (1 - pred[0][0], pred[0][0])

                await ws.send_json({"mask_detected": bool(mask > without_mask)})
                await asyncio.sleep(1)
    except Exception as e:
        print(f"WebSocket Error: {e}")
    finally:
        cap.release()
        print("Camera released on WebSocket close")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
