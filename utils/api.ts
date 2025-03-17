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

export const recognizeEmployee = async (imageBase64: string) => {
  try {
    if (!imageBase64) {
      throw new Error("Image data is missing.");
    }

    console.log("Sending image, length:", imageBase64.length);

    const response = await fetch(`http://localhost:8000/api/recognize_employee`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image: imageBase64 }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Recognition API error:", errorData);
      throw new Error(errorData.detail || "Failed to recognize employee.");
    }

    const data = await response.json();
    console.log("Recognition response:", data);
    return data;
  } catch (error) {
    console.error("Error recognizing employee:", error.message);
    throw new Error(error.message || "Failed to recognize employee.");
  }
};

