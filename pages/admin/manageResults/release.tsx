import { useEffect, useState } from 'react';
import { getAllResultsFromBlockchain } from '../../../services/blockchain';
import axios from 'axios';

interface VoteCountsProps {}

const VoteCounts: React.FC<VoteCountsProps> = () => {
  const [groupedPollingManagers, setGroupedPollingManagers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [voteCounts, setVoteCounts] = useState<Record<string, Record<string, Record<string, number>>>>({});

  useEffect(() => {
    const fetchPollingManagers = async () => {
      try {
        const response = await axios.get('/api/pollingManagers/groupByPlk');
        setGroupedPollingManagers(response.data);
      } catch (error) {
        console.error("Error fetching polling managers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPollingManagers();
  }, []);

  useEffect(() => {
    const fetchVotes = async () => {
      const results = await getAllResultsFromBlockchain();
      if (results) {
        const counts = results.reduce((acc, { pollingManagerId, candidateId, priority1, priority2, priority3 }) => {
          if (!acc[pollingManagerId]) {
            acc[pollingManagerId] = {};
          }
          if (!acc[pollingManagerId][candidateId]) {
            acc[pollingManagerId][candidateId] = { 1: 0, 2: 0, 3: 0 };
          }
          acc[pollingManagerId][candidateId][1] += priority1;
          acc[pollingManagerId][candidateId][2] += priority2;
          acc[pollingManagerId][candidateId][3] += priority3;
          return acc;
        }, {} as Record<string, Record<string, Record<string, number>>>);
        setVoteCounts(counts);
      }
      setLoading(false);
    };
    fetchVotes();
  }, []);

  const handlePublishResults = async (plkUser: string) => {
    try {
      const groupDetails = groupedPollingManagers.find(group => group.plkUser === plkUser)?.plkUserDetails;
      const resultsToPublish = {
        plkUser,
        local_council: groupDetails?.local_council,
        district: groupDetails?.district,
        pollingManagers: groupedPollingManagers
          .find(group => group.plkUser === plkUser)
          ?.pollingManagers.map((pollingManager: any) => ({
        pollingManagerId: pollingManager._id,
        votes: Object.entries(voteCounts[pollingManager._id] || {}).map(([candidateId, counts]) => ({
          candidateId,
          priority1: Number(counts["1"]) || 0,
          priority2: Number(counts["2"]) || 0,
          priority3: Number(counts["3"]) || 0,
        })),
          })) || []
      };
  
      await axios.post('/api/vote/publish', resultsToPublish);
      console.log(resultsToPublish)
      alert(`Results for PLK user ${plkUser} published successfully!`);
    } catch (error) {
      console.error("Failed to publish results:", error);
      alert("Failed to publish results.");
    }
  };
  

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Vote Results Management</h2>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : groupedPollingManagers.length === 0 ? (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <p className="text-lg text-gray-600">No polling managers found.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {groupedPollingManagers.map(({ plkUser, pollingManagers }) => (
              <div key={plkUser} className="border border-gray-200 rounded-lg p-6">
                Disctrict : {groupedPollingManagers.find(group => group.plkUser === plkUser)?.plkUserDetails.district}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-blue-700">Division: {groupedPollingManagers.find(group => group.plkUser === plkUser)?.plkUserDetails.local_council}</h3>
                  <button
                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg shadow hover:from-red-600 hover:to-pink-700 transition-all duration-300 flex items-center space-x-2"
                    onClick={() => handlePublishResults(plkUser)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Publish Results</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pollingManagers.map((pollingManager: any) => (
                    <div key={pollingManager._id} className="bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-300">
                      <h4 className="text-lg font-medium text-gray-700 mb-3">
                        <span className="text-gray-500">Polling Station:</span> {pollingManager._id}
                      </h4>
                      {voteCounts[pollingManager._id] ? (
                        <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                          {Object.entries(voteCounts[pollingManager._id]).map(([candidateId, votes]) => (
                            <div key={candidateId} className="bg-white p-3 rounded-lg border border-gray-200">
                              <h5 className="font-medium text-gray-800 mb-2 pb-2 border-b border-gray-100">
                                Candidate: {candidateId}
                              </h5>
                              <div className="space-y-1">
                                {Object.entries(votes).map(([priority, count]) => (
                                  <div key={priority} className="flex justify-between items-center">
                                    <span className="text-gray-600">Priority {priority}:</span>
                                    <span className="font-semibold bg-blue-100 text-blue-800 py-1 px-2 rounded-full text-sm">
                                      {count} votes
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">No votes recorded</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VoteCounts;
