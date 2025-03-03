import React, { useState, useEffect } from "react";
import axios from "axios";


const AddPartyForm: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    short_name: "",
    full_name: "",
    description: "",
    logo: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

 

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
  
    // Validate required fields
    const { short_name, full_name, description } = formData;
    if (!short_name || !full_name || !description || !imageFile) {
      setError("Please fill in all required fields.");
      return;
    }
  
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("short_name", formData.short_name);
      uploadFormData.append("full_name", formData.full_name);
      uploadFormData.append("description", formData.description);
      if (imageFile) {
        uploadFormData.append("logo", imageFile);
      }
  
      const response = await axios.post("/api/Parties/addParty", uploadFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      if (response.status === 201) {
        setSuccess("Party added successfully!");
        setFormData({
          short_name: "",
          full_name: "",
          description: "",
          logo: "",
        });
        setImageFile(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add party.");
    }
  };
  
  
  return (
    <div className="max-w-xl mx-auto p-4 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4">Add Party</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {success && <div className="text-green-500 mb-4">{success}</div>}
      
        <form onSubmit={handleSubmit}>
            <div className="mb-4">
            <label className="block text-gray-600">Short Name</label>
            <input
                type="text"
                name="short_name"
                value={formData.short_name}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
            />
            </div>
            <div className="mb-4">
            <label className="block text-gray-600">Full Name</label>
            <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
            />
            </div>
            <div className="mb-4">
            <label className="block text-gray-600">Description</label>
            <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
            />
            </div>
            <div className="mb-4">
            <label className="block text-gray-600">Logo</label>
            <input
                type="file"
                name="logo"
                onChange={handleFileChange}
                className="w-full p-2 border border-gray-300 rounded"
            />
            </div>
            <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded"
            >
            Add Party
            </button>
        </form>

    </div>
  );
};



export default AddPartyForm;
