import Sidebar from "../components/Sidebar";
import Header from '../components/Header';
import { useEffect, useState } from "react";
import axios from "axios";

interface Candidate {
  _id: string;
  name: string;
  slogan: string;
  image: string;
  party: string;
  electionId: string;
  no: string;
  nationalId: string;
  socialLinks: {
    linkedin: string;
    github: string;
    twitter: string;
    whatsapp: string;
  };
  bio: {
    dob: string;
    nationality: string;
    religion: string;
    maritalStatus: string;
    netWorth: string;
  };
  education: string[];
  experience: string[];
  is_active: boolean;
}

interface Election {
  _id: string;
  title: string;
}

interface Party {
  _id: string;
  short_name: string;
}

export default function ManageCandidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [elections, setElections] = useState<Election[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editCandidate, setEditCandidate] = useState<Candidate | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<Candidate>({
    _id: "",
    name: "",
    slogan: "",
    image: "",
    party: "",
    electionId: "",
    no: "",
    nationalId: "",
    socialLinks: { linkedin: "", github: "", twitter: "", whatsapp: "" },
    bio: { dob: "", nationality: "", religion: "", maritalStatus: "", netWorth: "" },
    education: [""],
    experience: [""],
    is_active: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [candidatesRes, electionsRes, partiesRes] = await Promise.all([
          axios.get('/api/Candidates/getCandidates'),
          axios.get('/api/Elections/getElections'),
          axios.get('/api/Parties/getParties'),
        ]);
        setCandidates(candidatesRes.data.candidates);
        setElections(electionsRes.data.elections);
        setParties(partiesRes.data.parties);
      } catch (error) {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleEditClick = (candidate: Candidate) => {
    setEditCandidate(candidate);
    setFormData(candidate);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNestedChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    section: "socialLinks" | "bio"
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [name]: value },
    }));
  };

  const handleArrayChange = (index: number, value: string, section: "education" | "experience") => {
    const updatedArray = [...formData[section]];
    updatedArray[index] = value;
    setFormData((prev) => ({ ...prev, [section]: updatedArray }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleUpdateCandidate = async () => {
    const uploadFormData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (typeof value === "object") {
        uploadFormData.append(key, JSON.stringify(value));
      } else {
        uploadFormData.append(key, value);
      }
    });

    if (imageFile) {
      uploadFormData.append("image", imageFile);
    }

    try {
      const response = await axios.put("/api/Candidates/updateCandidate", uploadFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200) {
        setCandidates((prev) =>
          prev.map((candidate) =>
            candidate._id === response.data._id ? response.data : candidate
          )
        );
        setEditCandidate(null);
      }
    } catch (error) {
      console.error("Failed to update candidate");
    }
  };

  const toggleActiveStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await axios.put('/api/Candidates/updateCandidate', {
        id,
        is_active: !currentStatus,
      });

      if (response.status === 200) {
        setCandidates((prev) =>
          prev.map((candidate) =>
            candidate._id === response.data._id ? response.data : candidate
          )
        );
      }
    } catch (error) {
      console.error("Failed to update candidate status");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="p-10">
          <h1 className="text-2xl font-bold">Manage Candidates</h1>
          <div className="grid grid-cols-3 gap-4 mt-5">
            {candidates.map((candidate) => (
              <div key={candidate._id} className="bg-white p-5 rounded-lg shadow-md">
                <img src={candidate.image} alt={candidate.name} className="w-20 h-20 rounded-full mx-auto" />
                <h1 className="text-xl font-bold mt-2">{candidate.name}</h1>
                <p className="text-gray-500">{candidate.party}</p>
                <p className="text-gray-500">{candidate.nationalId}</p>
                <p className="text-gray-500">{candidate.bio?.nationality}</p>
                <p className="text-gray-500">{candidate.slogan}</p>
                <button onClick={() => toggleActiveStatus(candidate._id, candidate.is_active)} className="mt-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                  {candidate.is_active ? "Deactivate" : "Activate"}
                </button>
                <button onClick={() => handleEditClick(candidate)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2">
                  Edit
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
