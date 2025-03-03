import Sidebar from "../components/Sidebar";
import Header from '../components/Header';
import { useEffect, useState } from "react";

interface Candidate {
  _id: string;
  name: string;
  image: string;
  party: string;
  nationalId: string;
  is_active: boolean;
  bio: string;
  electionId: string;
}

export default function ManageCandidates() {
  const [candidates, setCandidates] = useState([] as Candidate[]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editCandidate, setEditCandidate] = useState<Candidate | null>(null);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    image: "",
    party: "",
    nationalId: "",
    bio: "",
  });

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await fetch('/api/Candidates/getCandidates');
        if (!response.ok) {
          throw new Error('Failed to fetch candidates');
        }
        const data = await response.json();
        setCandidates(data.candidates);
      } catch (error) {
        setError((error as any).message);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, []); 

  const handleEditClick = (candidate: Candidate) => {
    setEditCandidate(candidate);
    setFormData({
      id: candidate._id,
      name: candidate.name,
      image: candidate.image,
      party: candidate.party,
      nationalId: candidate.nationalId,
      bio: candidate.bio,
    });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateCandidate = async () => {
    console.log('formData', formData);
    try {
      const response = await fetch('/api/Candidates/updateCandidate', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: editCandidate?._id, ...formData }),
      });

      if (!response.ok) {
        throw new Error('Failed to update candidate');
      }

      const updatedCandidate = await response.json();
      setCandidates((prev) =>
        prev.map((candidate) =>
          candidate._id === updatedCandidate.data._id ? updatedCandidate.data : candidate
        )
      );
      setEditCandidate(null); // Close modal/form
    } catch (error) {
      console.error(error);
    }
  };

  const toggleActiveStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/Candidates/updateCandidate', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !currentStatus }), // Toggle the current status
      });
  
      if (!response.ok) {
        throw new Error('Failed to update candidate status');
      }
  
      const updatedCandidate = await response.json();
      setCandidates((prev) =>
        prev.map((candidate) =>
          candidate._id === updatedCandidate.data._id ? updatedCandidate.data : candidate
        )
      );
    } catch (error) {
      console.error(error);
    }
  };
  

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="flex">
      <Sidebar />
      <div className="w-full">
        <Header />
        <div className="p-10">
          <h1 className="text-2xl font-bold">Manage Candidates</h1>
          <div className="grid grid-cols-3 gap-4 mt-5">
            {candidates.map((candidate) => (
              <div
              key={candidate._id}
              className="bg-white p-5 rounded-lg shadow-md"
            >
              <img
                src={candidate.image}
                alt={candidate.name}
                className="w-20 h-20 rounded-full mx-auto"
              />
              <h1 className="text-xl font-bold mt-2">{candidate.name}</h1>
              <p className="text-gray-500">{candidate.party}</p>
              <p className="text-gray-500">{candidate.nationalId}</p>
              <p className="text-gray-500">{candidate.bio}</p>
              <p className="text-gray-500">{candidate.electionId}</p>
              <p className={`mt-2 font-bold ${candidate.is_active ? 'text-green-500' : 'text-red-500'}`}>
                {candidate.is_active ? 'Active' : 'Inactive'}
              </p>
              <button
                onClick={() => toggleActiveStatus(candidate._id, candidate.is_active)}
                className={`mt-2 px-4 py-2 rounded ${
                  candidate.is_active ? 'bg-red-500 hover:bg-red-700' : 'bg-green-500 hover:bg-green-700'
                } text-white font-bold`}
              >
                {candidate.is_active ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={() => handleEditClick(candidate)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2"
              >
                Edit
              </button>
            </div>
            
            ))}
          </div>

          {/* Edit Form/Modal */}
          {editCandidate && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-8 rounded-lg shadow-md w-1/3">
                <h2 className="text-xl font-bold mb-4">Edit Candidate</h2>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="Name"
                  className="w-full mb-2 p-2 border rounded"
                />
                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleFormChange}
                  placeholder="Image URL"
                  className="w-full mb-2 p-2 border rounded"
                />
                <input
                  type="text"
                  name="party"
                  value={formData.party}
                  onChange={handleFormChange}
                  placeholder="Party"
                  className="w-full mb-2 p-2 border rounded"
                />
                <input
                  type="text"
                  name="nationalId"
                  value={formData.nationalId}
                  onChange={handleFormChange}
                  placeholder="National ID"
                  className="w-full mb-2 p-2 border rounded"
                />
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleFormChange}
                  placeholder="Bio"
                  className="w-full mb-2 p-2 border rounded"
                ></textarea>
                <div className="flex justify-end">
                  <button
                    onClick={handleUpdateCandidate}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditCandidate(null)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
