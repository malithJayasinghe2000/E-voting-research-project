"use client";

import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import { addEmployee, recognizeEmployee } from "../utils/api";

const WebcamCapture: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const capture = async (mode: "add" | "recognize") => {
    if (!webcamRef.current) return;
  
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;
  
    try {
      if (mode === "add" && name) {
        const res = await addEmployee(name, imageSrc.split(",")[1]); // Remove metadata
        setMessage(res.message);
      } else {
        const res = await recognizeEmployee(imageSrc.split(",")[1]); // Remove metadata
        setMessage(res.message);
      }
    } catch (error: any) {
      setMessage(error.message);
    }
  };
  
  return (
    <div className="flex flex-col items-center">
      <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="border rounded-lg" />
      
      <input
        type="text"
        placeholder="Enter name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mt-2 p-2 border rounded-md"
      />
      
      <div className="flex gap-2 mt-3">
        <button onClick={() => capture("add")} className="bg-blue-500 text-white px-4 py-2 rounded">
          Add Employee
        </button>
        <button onClick={() => capture("recognize")} className="bg-green-500 text-white px-4 py-2 rounded">
          Recognize Employee
        </button>
      </div>

      {message && <p className="mt-3 text-gray-700">{message}</p>}
    </div>
  );
};

export default WebcamCapture;
