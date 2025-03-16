"use client";

import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import { recognizeEmployee } from "../utils/api";
import { FiCamera, FiCheck, FiAlertCircle } from "react-icons/fi";

interface WebcamCaptureProps {
  onSuccess?: () => void;
}

const WebcamCapture: React.FC<WebcamCaptureProps> = ({ onSuccess }) => {
  const webcamRef = useRef<Webcam>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const capture = async () => {
    if (!webcamRef.current) {
      setMessage("Webcam is not available.");
      setStatus("error");
      return;
    }

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      setMessage("Failed to capture image.");
      setStatus("error");
      return;
    }

    setLoading(true); // Disable button while processing
    setMessage("Processing your identification...");
    setStatus("idle");

    try {
      const res = await recognizeEmployee(imageSrc.split(",")[1]); // Remove metadata
      setMessage(res.message);
      setStatus("success");
      
      // Call the onSuccess callback after a short delay if provided
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (error: any) {
      setMessage(error.message || "Recognition failed.");
      setStatus("error");
    } finally {
      setLoading(false); // Re-enable button after process
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <Webcam 
        ref={webcamRef} 
        screenshotFormat="image/jpeg" 
        className="w-full rounded-lg border-2 border-gray-300 shadow-md mb-4"
        videoConstraints={{
          facingMode: "user",
          width: { min: 640 },
          height: { min: 480 }
        }}
      />

      {status === "success" && (
        <div className="flex items-center justify-center mb-4 p-3 w-full bg-green-100 border-l-4 border-green-500 rounded-lg">
          <FiCheck className="text-green-500 mr-2" size={20} />
          <p className="text-green-700">{message}</p>
        </div>
      )}

      {status === "error" && (
        <div className="flex items-center justify-center mb-4 p-3 w-full bg-red-100 border-l-4 border-red-500 rounded-lg">
          <FiAlertCircle className="text-red-500 mr-2" size={20} />
          <p className="text-red-700">{message}</p>
        </div>
      )}

      {loading && (
        <div className="mb-4 p-3 w-full bg-blue-50 text-center rounded-lg">
          <div className="inline-block mr-2">
            <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <span className="text-blue-700">{message}</span>
        </div>
      )}

      <button
        onClick={capture}
        disabled={loading}
        className={`px-6 py-3 rounded-lg font-medium flex items-center justify-center ${
          loading 
            ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
            : "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg transform transition-all hover:-translate-y-1"
        }`}
      >
        <FiCamera className="mr-2" size={20} />
        {loading ? "Recognizing..." : "Verify Identity"}
      </button>
    </div>
  );
};

export default WebcamCapture;
