import React, { useState, useEffect } from "react";
import axios from "axios";

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
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
      } finally {
        setLoading(false);
      }
    };

    fetchElections();
  }, []);

  useEffect(() => {
    const fetchParties = async () => {
      try {
        const response = await fetch('/api/Parties/getParties');
        if (!response.ok) {
          throw new Error('Failed to fetch elections');
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

    fetchParties();
  }, []);

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

  const handleSelectChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate required fields
    const { name, no, party, nationalId, electionId } = formData;
    if (!name || !no || !party || !nationalId || !electionId) {
      setError("Please fill in all required fields.");
      return;
    }

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
        // Redirect to manage candidates page
        window.location.href = "/admin/candidates/manage";
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add candidate.");
    }
  };
  

  return (
    <div className="max-w-xl mx-auto p-4 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4">Add Candidate</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {success && <div className="text-green-500 mb-4">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block font-medium mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="no" className="block font-medium mb-1">
            Candidate No <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="no"
            name="no"
            value={formData.no}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="image" className="block font-medium mb-1">
            Image <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            id="image"
            name="image"
            onChange={handleFileChange}
            className="w-full border rounded p-2"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="party" className="block font-medium mb-1">
            Party <span className="text-red-500">*</span>
          </label>
          <select
            id="party"
            name="party"
            value={formData.party}
            onChange={handleSelectChange}
            className="w-full border rounded p-2"
            required
          >
            <option value="">Select a party</option>
            {parties.map((party) => (
              <option key={party._id} value={party._id}>
                {party.short_name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="nationalId" className="block font-medium mb-1">
            National ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="nationalId"
            name="nationalId"
            value={formData.nationalId}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="bio" className="block font-medium mb-1">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="electionId" className="block font-medium mb-1">
            Election <span className="text-red-500">*</span>
          </label>
          <select
            id="electionId"
            name="electionId"
            value={formData.electionId}
            onChange={handleSelectChange}
            className="w-full border rounded p-2"
            required
          >
            <option value="">Select an election</option>
            {elections.map((election) => (
              <option key={election._id} value={election._id}>
                {election.title}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Add Candidate
        </button>
      </form>
    </div>
  );
};

export default AddCandidateForm;
