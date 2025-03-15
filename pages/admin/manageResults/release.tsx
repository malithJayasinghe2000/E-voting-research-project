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
      const resultsToPublish = {
        plkUser, 
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
  

  if (loading) return <p>Loading polling managers...</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Vote Counts</h2>
      {groupedPollingManagers.length === 0 ? (
        <p>No polling managers found.</p>
      ) : (
        groupedPollingManagers.map(({ plkUser, pollingManagers }) => (
          <div key={plkUser} className="mb-6">
            <h3 className="text-lg font-semibold mb-2">PLK User: {plkUser}</h3>
            {pollingManagers.map((pollingManager: any) => (
              <div key={pollingManager._id} className="mb-4">
                <h4 className="text-md font-semibold mb-2">Polling Manager: {pollingManager.email}</h4>
                {voteCounts[pollingManager._id] && (
                  <div className="mt-4">
                    <ul className="space-y-4">
                      {Object.entries(voteCounts[pollingManager._id]).map(([candidateId, votes]) => (
                        <li key={candidateId} className="p-3 border rounded-lg shadow">
                          <h4 className="text-md font-semibold mb-2">Candidate: {candidateId}</h4>
                          <ul>
                            {Object.entries(votes).map(([priority, count]) => (
                              <li key={priority} className="flex justify-between">
                                <span className="font-bold">{count} votes (Priority {priority})</span>
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
            <button
              className="px-4 py-2 bg-red-500 text-white rounded mt-4"
              onClick={() => handlePublishResults(plkUser)}
            >
              Publish Results for {plkUser}
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default VoteCounts;
