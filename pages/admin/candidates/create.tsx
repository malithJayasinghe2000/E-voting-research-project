import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { FiUpload, FiUser, FiFlag, FiFileText, FiInfo, FiCheck, FiX } from "react-icons/fi";

interface Election {
  _id: string;
  title: string;
}

interface Party {
  _id: string;
  short_name: string;
}

const AddCandidateForm: React.FC = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    no: "",
    image: "",
    party: "",
    nationalId: "",
    bio: "",
    role: "candidate",
    electionId: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const response = await fetch('/api/Elections/getElections');
        if (!response.ok) {
          throw new Error('Failed to fetch elections');
        }
        const data = await response.json();
        setElections(data.elections);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('An unknown error occurred');
        }
      }
    };

    const fetchParties = async () => {
      try {
        const response = await fetch('/api/Parties/getParties');
        if (!response.ok) {
          throw new Error('Failed to fetch parties');
        }
        const data = await response.json();
        setParties(data.parties);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchElections();
    fetchParties();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear the error for this field if it exists
    if (formErrors[name]) {
      setFormErrors((prev) => ({...prev, [name]: ''}));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Clear the error for image if it exists
      if (formErrors.image) {
        setFormErrors((prev) => ({...prev, image: ''}));
      }
    }
  };

  const handleSelectChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear the error for this field if it exists
    if (formErrors[name]) {
      setFormErrors((prev) => ({...prev, [name]: ''}));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.no.trim()) errors.no = "Candidate number is required";
    if (!formData.party) errors.party = "Party is required";
    if (!formData.nationalId.trim()) errors.nationalId = "National ID is required";
    if (!formData.electionId) errors.electionId = "Election is required";
    if (!imageFile) errors.image = "Image is required";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("name", formData.name);
      uploadFormData.append("no", formData.no);
      uploadFormData.append("party", formData.party);
      uploadFormData.append("nationalId", formData.nationalId);
      uploadFormData.append("bio", formData.bio);
      uploadFormData.append("electionId", formData.electionId);
      if (imageFile) {
        uploadFormData.append("image", imageFile);
      }

      const response = await axios.post("/api/Candidates/addCandidate", uploadFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201) {
        setSuccess("Candidate added successfully!");
        setFormData({
          name: "",
          no: "",
          image: "",
          party: "",
          nationalId: "",
          bio: "",
          role: "candidate",
          electionId: "",
        });
        setImageFile(null);
        setImagePreview(null);
        // Redirect to manage candidates page
        window.location.href = "/admin/candidates/manage";
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add candidate.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h1 className="text-2xl font-bold text-gray-800">Add New Candidate</h1>
                <p className="text-sm text-gray-600 mt-1">Fill in the details to register a new candidate</p>
              </div>
              
              {loading ? (
                <div className="p-6 flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="p-6">
                  {error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <FiX className="h-5 w-5 text-red-500" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {success && (
                    <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <FiCheck className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-green-700">{success}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                          <FiUser className="mr-2" /> Full Name <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${formErrors.name ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'}`}
                          placeholder="Enter candidate's full name"
                        />
                        {formErrors.name && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="no" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                          <FiInfo className="mr-2" /> Candidate Number <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          type="text"
                          id="no"
                          name="no"
                          value={formData.no}
                          onChange={handleChange}
                          className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${formErrors.no ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'}`}
                          placeholder="Enter candidate number"
                        />
                        {formErrors.no && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.no}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <FiUpload className="mr-2" /> Image <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className={`border-2 border-dashed rounded-lg p-4 ${formErrors.image ? 'border-red-500' : 'border-gray-300'}`}>
                        <div className="flex flex-col items-center">
                          {imagePreview ? (
                            <div className="mb-4">
                              <img src={imagePreview} alt="Preview" className="h-40 w-40 object-cover rounded-lg" />
                            </div>
                          ) : (
                            <div className="bg-gray-100 mb-4 rounded-lg h-40 w-40 flex items-center justify-center">
                              <FiUser className="h-16 w-16 text-gray-400" />
                            </div>
                          )}
                          <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors">
                            <span>Choose File</span>
                            <input
                              type="file"
                              id="image"
                              name="image"
                              onChange={handleFileChange}
                              className="hidden"
                              accept="image/*"
                            />
                          </label>
                          <p className="mt-2 text-xs text-gray-500">Upload a clear photo of the candidate</p>
                        </div>
                      </div>
                      {formErrors.image && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.image}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="party" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                          <FiFlag className="mr-2" /> Party <span className="text-red-500 ml-1">*</span>
                        </label>
                        <select
                          id="party"
                          name="party"
                          value={formData.party}
                          onChange={handleSelectChange}
                          className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${formErrors.party ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'}`}
                        >
                          <option value="">Select a party</option>
                          {parties.map((party) => (
                            <option key={party._id} value={party._id}>
                              {party.short_name}
                            </option>
                          ))}
                        </select>
                        {formErrors.party && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.party}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="nationalId" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                          <FiInfo className="mr-2" /> National ID <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          type="text"
                          id="nationalId"
                          name="nationalId"
                          value={formData.nationalId}
                          onChange={handleChange}
                          className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${formErrors.nationalId ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'}`}
                          placeholder="Enter national ID"
                        />
                        {formErrors.nationalId && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.nationalId}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <FiFileText className="mr-2" /> Bio
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        rows={4}
                        value={formData.bio}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        placeholder="Enter candidate's biographical information"
                      />
                    </div>

                    <div>
                      <label htmlFor="electionId" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <FiInfo className="mr-2" /> Election <span className="text-red-500 ml-1">*</span>
                      </label>
                      <select
                        id="electionId"
                        name="electionId"
                        value={formData.electionId}
                        onChange={handleSelectChange}
                        className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${formErrors.electionId ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'}`}
                      >
                        <option value="">Select an election</option>
                        {elections.map((election) => (
                          <option key={election._id} value={election._id}>
                            {election.title}
                          </option>
                        ))}
                      </select>
                      {formErrors.electionId && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.electionId}</p>
                      )}
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => window.location.href = "/admin/candidates/manage"}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className={`px-6 py-2 bg-blue-600 text-white rounded-md shadow-sm flex items-center justify-center ${
                          submitting ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"
                        } transition-colors`}
                      >
                        {submitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          <>
                            <FiCheck className="mr-2" /> Add Candidate
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AddCandidateForm;
