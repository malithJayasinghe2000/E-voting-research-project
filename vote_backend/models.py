import cv2
import numpy as np
import yaml
from yaml.loader import SafeLoader
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
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
from concurrent.futures import ThreadPoolExecutor

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
mask_model = load_model("mask_detector.h5")
liveness_model = load_model("liveness_detector.h5")

face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# MongoDB connection
MONGO_URI = "mongodb+srv://sandaru2:sandaru2@test.bgjabxi.mongodb.net/biznesAdverticerDB?retryWrites=true&w=majority"
client = AsyncIOMotorClient(MONGO_URI)
db = client["biznesAdverticerDB"]
employees_collection = db["employees"]
attendance_collection = db["attendance"]

executor = ThreadPoolExecutor()

# Open webcam
cap = cv2.VideoCapture(0)

INPUT_SIZE = (224, 224)

class ImageRequest(BaseModel):
    image: str  # Base64-encoded image

def decode_image(image_data: str):
    """ Decode base64 image and convert to OpenCV format """
    image_bytes = base64.b64decode(image_data)
    img = Image.open(io.BytesIO(image_bytes))
    return cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)

def detect_liveness(frame):
    """ Run liveness detection """
    frame_resized = cv2.resize(frame, INPUT_SIZE)
    frame_array = np.array(frame_resized, dtype="float32") / 255.0  # Normalize
    frame_array = np.expand_dims(frame_array, axis=0)  # Add batch dimension

    pred = liveness_model.predict(frame_array)[0][0]  # Extract prediction value
    return "Real" if pred > 0.5 else "Fake", float(pred)  # Convert to Python float

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

@app.post("/api/recognize_employee")
async def recognize_employee(data: ImageRequest):
    """ Recognize employee and check liveness before granting access """
    frame = decode_image(data.image)

    # Run liveness detection and face recognition in parallel
    loop = asyncio.get_running_loop()
    liveness_future = loop.run_in_executor(None, detect_liveness, frame)
    face_embedding = await get_face_embedding(frame)

    if face_embedding is None:
        raise HTTPException(status_code=400, detail="Could not extract face embedding")

    # Wait for liveness detection to complete
    liveness_result, confidence = await liveness_future

    if liveness_result == "Fake":
        raise HTTPException(status_code=403, detail="Liveness check failed. User is not live.")

    employees = employees_collection.find()
    async for employee in employees:
        known_embedding = np.array(employee["encoding"], dtype=np.float32)
        face_embedding = np.array(face_embedding, dtype=np.float32)

        # Normalize embeddings
        known_embedding /= np.linalg.norm(known_embedding)
        face_embedding /= np.linalg.norm(face_embedding)

        # Compute similarity
        distance = np.linalg.norm(known_embedding - face_embedding)

        if distance < 0.5:
            await record_attendance(employee["_id"], employee["name"])
            return {
                "message": f"Welcome {employee['name']}",
                "liveness": liveness_result,
                "confidence": confidence  # Now it's a Python float
            }

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

        pred = mask_model.predict(face)
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

                pred = mask_model.predict(face)
                mask, without_mask = pred[0] if pred.shape[1] == 2 else (1 - pred[0][0], pred[0][0])

                await ws.send_json({"mask_detected": bool(mask > without_mask)})
                await asyncio.sleep(1)
    except Exception as e:
        print(f"WebSocket Error: {e}")
    finally:
        cap.release()
        print("Camera released on WebSocket close")

class YOLO_Pred:
    def __init__(self, onnx_model, data_yaml):
        with open(data_yaml, mode='r') as f:
            data_yaml = yaml.load(f, Loader=SafeLoader)

        self.labels = data_yaml['names']
        self.nc = data_yaml['nc']
        
        self.yolo = cv2.dnn.readNetFromONNX(onnx_model)
        self.yolo.setPreferableBackend(cv2.dnn.DNN_BACKEND_OPENCV)
        self.yolo.setPreferableTarget(cv2.dnn.DNN_TARGET_CPU)

    def detect_faces(self, frame):
        row, col, _ = frame.shape
        max_rc = max(row, col)
        input_image = np.zeros((max_rc, max_rc, 3), dtype=np.uint8)
        input_image[0:row, 0:col] = frame
        
        INPUT_WH_YOLO = 640
        blob = cv2.dnn.blobFromImage(input_image, 1/255, (INPUT_WH_YOLO, INPUT_WH_YOLO), swapRB=True, crop=False)
        self.yolo.setInput(blob)
        preds = self.yolo.forward()
        
        detections = preds[0]
        boxes, confidences, classes = [], [], []
        image_w, image_h = input_image.shape[:2]
        x_factor = image_w / INPUT_WH_YOLO
        y_factor = image_h / INPUT_WH_YOLO
        
        for row in detections:
            confidence = row[4]
            if confidence > 0.4:
                class_score = row[5:].max()
                class_id = row[5:].argmax()
                if class_score > 0.25:
                    cx, cy, w, h = row[:4]
                    left = int((cx - 0.5 * w) * x_factor)
                    top = int((cy - 0.5 * h) * y_factor)
                    width = int(w * x_factor)
                    height = int(h * y_factor)
                    
                    boxes.append([left, top, width, height])
                    confidences.append(confidence)
                    classes.append(class_id)
        
        boxes_np, confidences_np = np.array(boxes), np.array(confidences)
        indexes = cv2.dnn.NMSBoxes(boxes_np.tolist(), confidences_np.tolist(), 0.25, 0.45)
        
        if isinstance(indexes, tuple) or len(indexes) == 0:
            indexes = []
        else:
            indexes = indexes.flatten()
        
        for i in indexes:
            x, y, w, h = boxes_np[i]
            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
        
        return frame, len(indexes)

@app.websocket("/ws/face_detection")
async def face_detection(ws: WebSocket):
    """
    WebSocket endpoint for real-time face detection.
    This endpoint opens the webcam and streams face detection results to the frontend.
    """
    print("WebSocket connection attempt for face detection")
    await ws.accept()
    print("WebSocket connection accepted")
    
    # Initialize YOLO model
    yolo = YOLO_Pred('best.onnx', 'data.yaml')
    
    # Initialize webcam
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Could not open webcam")
        await ws.send_json({"error": "Could not open webcam"})
        await ws.close()
        return
    
    # Counter for tracking consecutive frames with multiple faces
    high_face_count = 0
    high_face_threshold = 5  # Alert after 5 consecutive frames with multiple faces
    
    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                print("Failed to read frame")
                await ws.send_json({"error": "Failed to read frame"})
                break
            
            # Detect faces using YOLO
            _, face_count = yolo.detect_faces(frame)
            print(f"Detected {face_count} faces")
            
            # Send face count to frontend
            await ws.send_json({"face_count": face_count})
            
            # Track consecutive frames with multiple faces
            if face_count >= 2:  # Alert if 2 or more faces are detected
                high_face_count += 1
                if high_face_count >= high_face_threshold:
                    print("Multiple faces detected for too many frames")
                    await ws.send_json({
                        "face_count": face_count,
                        "alert": True,
                        "message": "Multiple faces detected. Please ensure only one person is in front of the camera."
                    })
            else:
                # Reset counter if face count is normal
                high_face_count = 0
            
            # Brief pause to control the frame rate
            await asyncio.sleep(0.1)
            
    except WebSocketDisconnect:
        print("WebSocket client disconnected")
    except Exception as e:
        print(f"Error in face detection WebSocket: {str(e)}")
        await ws.send_json({"error": f"Error: {str(e)}"})
    finally:
        cap.release()
        print("WebSocket connection closed, camera released")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
