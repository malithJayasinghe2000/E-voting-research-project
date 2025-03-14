"use client";

import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import { recognizeEmployee } from "../utils/api";

const WebcamCapture: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const capture = async () => {
    if (!webcamRef.current) {
      setMessage("Webcam is not available.");
      return;
    }

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      setMessage("Failed to capture image.");
      return;
    }

    setLoading(true); // Disable button while processing
    setMessage("Processing...");

    try {
      const res = await recognizeEmployee(imageSrc.split(",")[1]); // Remove metadata
      setMessage(res.message);
    } catch (error: any) {
      setMessage(error.message || "Recognition failed.");
    } finally {
      setLoading(false); // Re-enable button after process
    }
  };

  return (
    <div className="flex flex-col items-center">
      <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="border rounded-lg" />

      <div className="flex gap-2 mt-3">
        <button
          onClick={capture}
          disabled={loading}
          className={`px-4 py-2 rounded ${loading ? "bg-gray-400" : "bg-green-500 text-white"}`}
        >
          {loading ? "Recognizing..." : "Recognize Voter"}
        </button>
      </div>

      {message && <p className="mt-3 text-gray-700">{message}</p>}
    </div>
  );
};

export default WebcamCapture;
