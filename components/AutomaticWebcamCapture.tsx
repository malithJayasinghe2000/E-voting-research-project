"use client";

import { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import { recognizeEmployee } from "../utils/api";
import { FiCheck, FiAlertCircle, FiUserX } from "react-icons/fi";

interface AutomaticWebcamCaptureProps {
  onSuccess?: () => void;
  captureInterval?: number; // Time in ms between capture attempts
  maxAttempts?: number; // Maximum number of attempts before stopping
}

const AutomaticWebcamCapture: React.FC<AutomaticWebcamCaptureProps> = ({ 
  onSuccess, 
  captureInterval = 2000, // 2 seconds between attempts
  maxAttempts = 5 // Maximum 5 attempts
}) => {
  const webcamRef = useRef<Webcam>(null);
  const [message, setMessage] = useState("Preparing to scan your face...");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error" | "already_voted">("idle");
  const [attempts, setAttempts] = useState(0);

  // Function to capture image and process it
  const captureAndProcess = async () => {
    if (!webcamRef.current || status === "success" || status === "already_voted" || attempts >= maxAttempts) {
      return;
    }

    setLoading(true);
    setMessage(`Scanning your face...`);

    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        setMessage("Failed to capture image. Trying again...");
        setAttempts(prev => prev + 1);
        setLoading(false);
        return;
      }

      // Process image
      const res = await recognizeEmployee(imageSrc.split(",")[1]);
      setMessage(res.message);
      setStatus("success");
      
      // Call the onSuccess callback after a short delay if provided
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (error: any) {
      console.log("Recognition error:", error.message);
      
      // Check if this is an "already voted" error - ensure case insensitive matching
      if (error.message?.toLowerCase().includes("already voted")) {
        setMessage("You have already voted in this election. Access denied.");
        setStatus("already_voted");
        return;
      }
      
      // If failed for other reasons, increment attempt counter
      setAttempts(prev => prev + 1);
      
      if (attempts + 1 >= maxAttempts) {
        setMessage("Failed to recognize after multiple attempts. Please try again.");
        setStatus("error");
      } else {
        setMessage(`Verification failed. Trying again... (${attempts + 1}/${maxAttempts})`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Trigger automatic capture at regular intervals
  useEffect(() => {
    // If max attempts reached or already successful or already voted, don't try again
    if (status === "success" || status === "already_voted" || attempts >= maxAttempts) return;
    
    // Initial delay before first capture to let camera initialize properly
    const initialDelay = setTimeout(() => {
      captureAndProcess();
    }, 1000);
    
    return () => clearTimeout(initialDelay);
  }, []); // Only run once on mount

  // Set up interval for repeated attempts
  useEffect(() => {
    // If max attempts reached or already successful or already voted, don't try again
    if (status === "success" || status === "already_voted" || attempts >= maxAttempts) return;
    
    // Skip the first attempt as it's handled by the initial effect
    if (attempts === 0) return;
    
    const timer = setTimeout(() => {
      captureAndProcess();
    }, captureInterval);
    
    return () => clearTimeout(timer);
  }, [attempts, status]);

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
      
      {status === "already_voted" && (
        <div className="flex items-center justify-center mb-4 p-3 w-full bg-orange-100 border-l-4 border-orange-500 rounded-lg">
          <FiUserX className="text-orange-500 mr-2" size={20} />
          <p className="text-orange-700">{message}</p>
        </div>
      )}

      <div className="w-full bg-blue-50 p-4 rounded-lg text-center">
        {loading ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 text-blue-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-blue-700">{message}</span>
          </div>
        ) : (
          <div className="text-blue-700">
            {status === "idle" && attempts < maxAttempts ? message : message}
          </div>
        )}
      </div>
    </div>
  );
};

export default AutomaticWebcamCapture;
