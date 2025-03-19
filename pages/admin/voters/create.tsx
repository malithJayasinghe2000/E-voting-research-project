import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import { addEmployee } from "../../../utils/api"; // Ensure this is correctly imported

const WebcamCapture: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const [formData, setFormData] = useState({
    name: "",
    nic: "",
    birthday: "",
    gender: "",
    voterType: "",
    village: "",
    householdNo: "",
    gramaNiladariDivision: "",
    pollingDistrictNo: "",
    pollingDivision: "",
    electoralDistrict: "",
    relationshipToChief: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const capture = async () => {
    if (!webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      setMessage("Failed to capture image. Please try again.");
      return;
    }

    // Ensure all required fields are filled
    for (const key in formData) {
      if (!formData[key as keyof typeof formData]) {
        setMessage("Please fill in all fields before submitting.");
        return;
      }
    }

    try {
      const res = await addEmployee({
        ...formData,
        image: imageSrc.split(",")[1], // Remove metadata
      });
      setMessage(res.message);
    } catch (error: any) {
      setMessage(error.message || "An error occurred while saving voter data.");
    }
  };

  return (
    <div className="flex flex-col items-center p-4 border rounded-lg shadow-md bg-white max-w-md mx-auto">
      <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="border rounded-lg" />

      {/* Input Fields */}
      <div className="w-full mt-4">
        <label className="text-lg font-semibold text-gray-700">Enter Voter Details</label>

        {[
          { label: "Full Name", name: "name", type: "text", placeholder: "Enter full name" },
          { label: "NIC Number", name: "nic", type: "text", placeholder: "Enter NIC number" },
          { label: "Date of Birth", name: "birthday", type: "date", placeholder: "" },
          { label: "Village", name: "village", type: "text", placeholder: "Enter village" },
          { label: "Household No", name: "householdNo", type: "text", placeholder: "Enter household number" },
          { label: "Grama Niladari Division", name: "gramaNiladariDivision", type: "text", placeholder: "Enter Grama Niladari Division" },
          { label: "Polling District No", name: "pollingDistrictNo", type: "text", placeholder: "Enter Polling District No" },
          { label: "Polling Division", name: "pollingDivision", type: "text", placeholder: "Enter Polling Division" },
          { label: "Electoral District", name: "electoralDistrict", type: "text", placeholder: "Enter Electoral District" },
          { label: "Relationship to Chief Occupier", name: "relationshipToChief", type: "text", placeholder: "Enter Relationship" },
        ].map(({ label, name, type, placeholder }) => (
          <div className="mt-3" key={name}>
            <label className="block font-medium text-gray-600">{label}</label>
            <input
              type={type}
              name={name}
              placeholder={placeholder}
              value={formData[name as keyof typeof formData]}
              onChange={handleChange}
              className="mt-1 p-2 border rounded-md w-full"
            />
          </div>
        ))}

        {/* Gender Dropdown */}
        <div className="mt-3">
          <label className="block font-medium text-gray-600">Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="mt-1 p-2 border rounded-md w-full bg-white"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Voter Type Dropdown */}
        <div className="mt-3">
          <label className="block font-medium text-gray-600">Voter Type</label>
          <select
            name="voterType"
            value={formData.voterType}
            onChange={handleChange}
            className="mt-1 p-2 border rounded-md w-full bg-white"
          >
            <option value="">Select Voter Type</option>
            <option value="Blinds People">Blinds People</option>
            <option value="Normal People">Normal People</option>
          </select>
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={capture}
        className="bg-blue-500 text-white px-4 py-2 rounded mt-4 w-full"
      >
        Add Voter
      </button>

      {/* Message Display */}
      {message && <p className="mt-3 text-gray-700">{message}</p>}
    </div>
  );
};

export default WebcamCapture;
