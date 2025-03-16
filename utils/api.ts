import axios from 'axios';

const API_URL = "http://localhost:8000"; // Update to FastAPI's port

export const addEmployee = async (name: string, image: string) => {
  try {
    const response = await fetch(`http://localhost:5000/api/add_employee`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, image }),
    });

    const result = await response.json();
    console.log("Add Employee Response:", result);
    return result;
  } catch (error) {
    console.error("Error adding employee:", error);
    throw new Error("Failed to add employee.");
  }
};

interface RecognizeEmployeeResponse {
  message: string;
}

export const recognizeEmployee = async (imageData: string): Promise<RecognizeEmployeeResponse> => {
  try {
    const response = await axios.post('http://127.0.0.1:8000/api/recognize_employee', {
      image: imageData
    });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.error || "Failed to recognize employee");
    } else {
      throw new Error("Network error or server unavailable");
    }
  }
};

