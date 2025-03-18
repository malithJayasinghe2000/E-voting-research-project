import React, { useState, useEffect } from "react";
//import DatePicker from "react-datepicker";
//import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";


const religions = ["Christianity", "Islam", "Hinduism", "Buddhism", "Other"];

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

  // In your formData state
  const [formData, setFormData] = useState({
    name: "",
    party: "",
    slogan: "",
    image: "",
    no: "", // Added
    nationalId: "", // Added
    socialLinks: {
      linkedin: "",
      github: "",
      twitter: "",
      whatsapp: "",
    },
    bio: {
      dob: "",
      nationality: "",
      religion: "",
      maritalStatus: "",
      netWorth: "",
    },
    education: [""],
    experience: [""],
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
    fetchParties();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNestedChange = (e: React.ChangeEvent<HTMLInputElement>, parentKey: keyof typeof formData) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [parentKey]: {
        ...(prevData[parentKey] as Record<string, string>),  // Ensure it's treated as an object
        [name]: value,
      },
    }));
  };
  
  

  const handleArrayChange = (
    index: number,
    value: string,
    section: "education" | "experience"
  ) => {
    const updatedArray = [...formData[section]];
    updatedArray[index] = value;
    setFormData((prev) => ({
      ...prev,
      [section]: updatedArray,
    }));
  };

  const addArrayItem = (section: "education" | "experience") => {
    setFormData((prev) => ({
      ...prev,
      [section]: [...prev[section], ""],
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
  
    const { name, party, electionId } = formData;
    if (!name || !party || !electionId) {
      setError("Please fill in all required fields.");
      return;
    }
  
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("name", formData.name);
      uploadFormData.append("party", formData.party);
      uploadFormData.append("slogan", formData.slogan);
      uploadFormData.append("electionId", formData.electionId);
      uploadFormData.append("no", formData.no);
      uploadFormData.append("nationalId", formData.nationalId);
  
      // Flatten socialLinks
      Object.entries(formData.socialLinks).forEach(([key, value]) => {
        uploadFormData.append(`socialLinks.${key}`, value);
      });
  
      // Flatten bio
      Object.entries(formData.bio).forEach(([key, value]) => {
        uploadFormData.append(`bio.${key}`, value);
      });
  
      // Handle array fields
      uploadFormData.append("education", JSON.stringify(formData.education));
      uploadFormData.append("experience", JSON.stringify(formData.experience));
  
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
          party: "",
          slogan: "",
          image: "",
          socialLinks: { linkedin: "", github: "", twitter: "", whatsapp: "" },
          bio: { dob: "", nationality: "", religion: "", maritalStatus: "", netWorth: "" },
          education: [""],
          experience: [""],
          electionId: "",
          no: "",
          nationalId: "",
        });
        setImageFile(null);
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
          <label className="block font-medium mb-1">Name *</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border rounded p-2" required />
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">Slogan</label>
          <input type="text" name="slogan" value={formData.slogan} onChange={handleChange} className="w-full border rounded p-2" />
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">Party *</label>
          <select name="party" value={formData.party} onChange={handleSelectChange} className="w-full border rounded p-2" required>
            <option value="">Select a party</option>
            {parties.map((party) => (
              <option key={party._id} value={party._id}>{party.short_name}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">Image *</label>
          <input type="file" name="image" onChange={handleFileChange} className="w-full border rounded p-2" required />
        </div>
        {/* Candidate No & National ID */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Candidate No *</label>
          <input
            type="text"
            name="no"
            value={formData.no}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">National ID *</label>
          <input
            type="text"
            name="nationalId"
            value={formData.nationalId}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        </div>


        {/* Social Links */}
        <h2 className="font-semibold mb-2">Social Links</h2>
        {["linkedin", "github", "twitter", "whatsapp"].map((platform) => (
          <div key={platform} className="mb-2">
            <label className="block capitalize mb-1">{platform}</label>
            <input type="text" name={platform} value={formData.socialLinks[platform as keyof typeof formData.socialLinks]} onChange={(e) => handleNestedChange(e, "socialLinks")} className="w-full border rounded p-2" />
          </div>
        ))}

       {/* Bio Section */}
       <h2 className="font-semibold mt-4 mb-2">Bio Details</h2>
        {["dob", "nationality", "religion", "maritalStatus", "netWorth"].map((bioField) => (
          <div key={bioField} className="mb-2">
            <label className="block capitalize mb-1">{bioField}</label>
            <input
              type="text"
              name={bioField}
              value={formData.bio[bioField as keyof typeof formData.bio]}  // Ensure safe access
              onChange={(e) => handleNestedChange(e, "bio")}
              className="w-full border rounded p-2"
            />
          </div>
        ))}

        {/* Education */}
        <h2 className="font-semibold mt-4 mb-2">Education</h2>
        {formData.education.map((edu, i) => (
          <div key={i} className="mb-2">
            <input type="text" value={edu} onChange={(e) => handleArrayChange(i, e.target.value, "education")} className="w-full border rounded p-2" />
          </div>
        ))}
        <button type="button" onClick={() => addArrayItem("education")} className="text-blue-500 mb-4">+ Add Education</button>

        {/* Experience */}
        <h2 className="font-semibold mt-4 mb-2">Experience</h2>
        {formData.experience.map((exp, i) => (
          <div key={i} className="mb-2">
            <input type="text" value={exp} onChange={(e) => handleArrayChange(i, e.target.value, "experience")} className="w-full border rounded p-2" />
          </div>
        ))}
        <button type="button" onClick={() => addArrayItem("experience")} className="text-blue-500 mb-4">+ Add Experience</button>

        {/* Election */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Election *</label>
          <select name="electionId" value={formData.electionId} onChange={handleSelectChange} className="w-full border rounded p-2" required>
            <option value="">Select an election</option>
            {elections.map((election) => (
              <option key={election._id} value={election._id}>{election.title}</option>
            ))}
          </select>
        </div>

        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Add Candidate
        </button>
      </form>
    </div>
  );
};

export default AddCandidateForm;
