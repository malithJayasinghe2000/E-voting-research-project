import Sidebar from "../components/Sidebar";
import Header from '../components/Header';
import { useEffect, useState } from "react";
import { FiEdit2, FiUserCheck, FiUserX, FiSearch, FiChevronDown } from "react-icons/fi";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
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
        body: JSON.stringify({ id, is_active: !currentStatus }),
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
  
  const filteredCandidates = candidates
    .filter((candidate) => 
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.party.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.nationalId.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((candidate) => {
      if (filterStatus === "all") return true;
      return filterStatus === "active" ? candidate.is_active : !candidate.is_active;
    });

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl">
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                  <h1 className="text-2xl font-bold text-gray-800 mb-2 sm:mb-0">
                    Candidate Management
                  </h1>
                  {/* <button
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center"
                    // Add functionality for adding a new candidate
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    Add Candidate
                  </button> */}
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                  {/* Search box */}
                  <div className="relative w-full sm:max-w-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiSearch className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search candidates..."
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {/* Filter dropdown */}
                  <div className="relative w-full sm:w-auto">
                    <select
                      className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as any)}
                    >
                      <option value="all">All Candidates</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <FiChevronDown className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : error ? (
                  <div className="bg-red-100 text-red-700 p-4 rounded-md">
                    <p>{error}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCandidates.length === 0 ? (
                      <div className="col-span-full text-center py-8 text-gray-500">
                        No candidates found matching your criteria.
                      </div>
                    ) : (
                      filteredCandidates.map((candidate) => (
                        <div
                          key={candidate._id}
                          className={`bg-white rounded-lg shadow-sm border transition-all hover:shadow-md ${
                            candidate.is_active ? 'border-green-200' : 'border-red-200'
                          }`}
                        >
                          <div className="p-6">
                            <div className="flex items-center">
                              <img
                                src={candidate.image || 'https://via.placeholder.com/100'}
                                alt={candidate.name}
                                className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
                                onError={({ currentTarget }) => {
                                  currentTarget.onerror = null; // Prevent infinite loop
                                  currentTarget.src = 'https://via.placeholder.com/100';
                                }}
                              />
                              <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-800">
                                  {candidate.name}
                                </h3>
                                <div className="flex items-center mt-1">
                                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                                    candidate.is_active ? 'bg-green-500' : 'bg-red-500'
                                  }`}></span>
                                  <span className={`text-sm ${
                                    candidate.is_active ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {candidate.is_active ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 space-y-2 text-sm text-gray-600">
                              <p><span className="font-medium">Party:</span> {candidate.party || 'N/A'}</p>
                              <p><span className="font-medium">ID:</span> {candidate.nationalId || 'N/A'}</p>
                              <p className="line-clamp-2"><span className="font-medium">Bio:</span> {candidate.bio || 'No bio available'}</p>
                            </div>

                            <div className="mt-6 flex space-x-2">
                              <button
                                onClick={() => handleEditClick(candidate)}
                                className="flex items-center justify-center px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors w-full"
                              >
                                <FiEdit2 className="mr-2" />
                                Edit
                              </button>
                              <button
                                onClick={() => toggleActiveStatus(candidate._id, candidate.is_active)}
                                className={`flex items-center justify-center px-4 py-2 rounded-md w-full transition-colors ${
                                  candidate.is_active 
                                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                }`}
                              >
                                {candidate.is_active ? (
                                  <>
                                    <FiUserX className="mr-2" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <FiUserCheck className="mr-2" />
                                    Activate
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal for Editing Candidate */}
      {editCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Edit Candidate</h2>
                <button 
                  onClick={() => setEditCandidate(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="px-6 py-4">
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input
                    type="text"
                    name="image"
                    value={formData.image}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {formData.image && (
                    <div className="mt-2">
                      <img 
                        src={formData.image} 
                        alt="Preview" 
                        className="h-20 w-20 object-cover rounded-md"
                        onError={({ currentTarget }) => {
                          currentTarget.onerror = null;
                          currentTarget.src = 'https://via.placeholder.com/100';
                        }} 
                      />
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Party</label>
                  <input
                    type="text"
                    name="party"
                    value={formData.party}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">National ID</label>
                  <input
                    type="text"
                    name="nationalId"
                    value={formData.nationalId}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleFormChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  ></textarea>
                </div>
              </form>
            </div>
            
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
              <button
                onClick={() => setEditCandidate(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateCandidate}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
