import axios from "axios";

const API_URL = "http://localhost:5000"; // Adjust if hosted elsewhere

export const addEmployee = async (name: string, image: string) => {
    try {
      const response = await fetch("http://localhost:5000/api/add_employee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image }),
      });
  
      const result = await response.json();
      console.log(result);
      return result;
    } catch (error) {
      console.error("Error adding employee:", error);
      throw new Error("Failed to add employee.");
    }
  };
  
  
  export const recognizeEmployee = async (imageBase64: string) => {
    try {
      console.log("Sending image length:", imageBase64.length);
  
      const response = await fetch("http://localhost:5000/api/recognize_employee", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: imageBase64 }),
      });
  
      const data = await response.json();
      console.log("Recognition response:", data);
      return data;
    } catch (error) {
      console.error("Error recognizing employee:", error);
    }
  };
  
  