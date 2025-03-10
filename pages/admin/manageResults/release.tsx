import { useEffect, useState } from 'react';
import { getAllResultsFromBlockchain } from '../../../services/blockchain';
import axios from 'axios';

interface VoteCountsProps {}

const VoteCounts: React.FC<VoteCountsProps> = () => {
  const [voteCounts, setVoteCounts] = useState<Record<string, Record<string, Record<string, number>>>>({});
  const [loading, setLoading] = useState(true);
  const [showPriority2, setShowPriority2] = useState(false);
  const [showPriority3, setShowPriority3] = useState(false);
  const [showFinalResult, setShowFinalResult] = useState(false);
  const [finalResults, setFinalResults] = useState<Record<string, number>>({});
  const [priority1Results, setPriority1Results] = useState<Record<string, number>>({});
  const [priority2Results, setPriority2Results] = useState<Record<string, number>>({});
  const [priority3Results, setPriority3Results] = useState<Record<string, number>>({});

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

  const getTotalVotes = (priority: number) => Object.values(voteCounts).reduce((sum, managerVotes) => {
    return sum + Object.values(managerVotes).reduce((managerSum, v) => managerSum + (v[priority] || 0), 0);
  }, 0);

  const getTopTwoCandidates = (priority: number) => {
    const candidateTotals: Record<string, number> = {};
    Object.values(voteCounts).forEach(managerVotes => {
      Object.entries(managerVotes).forEach(([candidateId, votes]) => {
        if (!candidateTotals[candidateId]) {
          candidateTotals[candidateId] = 0;
        }
        candidateTotals[candidateId] += votes[priority] || 0;
      });
    });
    return Object.entries(candidateTotals)
      .map(([id, total]) => ({ id, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 2);
  };

  const handlePublishResults = async (pollingManagerId: string) => {
    try {
      const resultsToPublish = {
        pollingManagerId,
        votes: Object.entries(voteCounts[pollingManagerId]).map(([candidateId, counts]) => ({
          candidateId,
          priority1: Number(counts["1"]) || 0,
          priority2: Number(counts["2"]) || 0,
          priority3: Number(counts["3"]) || 0,
        })),
      };
  
      await axios.post('/api/vote/publish', resultsToPublish);
      alert(`Results for polling manager ${pollingManagerId} published successfully!`);
    } catch (error) {
      console.error("Failed to publish results:", error);
      alert("Failed to publish results.");
    }
  };

  const handleCountResults = (priority: number) => {
    const counts: Record<string, number> = {};
    Object.values(voteCounts).forEach(managerVotes => {
      Object.entries(managerVotes).forEach(([candidateId, votes]) => {
        if (!counts[candidateId]) {
          counts[candidateId] = 0;
        }
        counts[candidateId] += votes[priority] || 0;
      });
    });
    if (priority === 1) setPriority1Results(counts);
    if (priority === 2) setPriority2Results(counts);
    if (priority === 3) setPriority3Results(counts);
  };

  if (loading) return <p>Loading vote counts...</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Vote Counts</h2>
      {Object.keys(voteCounts).length === 0 ? (
        <p>No votes found.</p>
      ) : (
        <>
          <div className="mb-4">
            <button
              className="px-4 py-2 bg-yellow-500 text-white rounded"
              onClick={() => handleCountResults(1)}
            >
              Count Priority 1 Votes
            </button>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded ml-2"
              onClick={() => handleCountResults(2)}
            >
              Count Priority 2 Votes
            </button>
            <button
              className="px-4 py-2 bg-purple-500 text-white rounded ml-2"
              onClick={() => handleCountResults(3)}
            >
              Count Priority 3 Votes
            </button>
          </div>
          {Object.entries(voteCounts).map(([managerId, managerVotes]) => (
            <div key={managerId} className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Polling Manager: {managerId}</h3>
              <ul className="space-y-4">
                {Object.entries(managerVotes).map(([candidateId, votes]) => (
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
              <button
                className="px-4 py-2 bg-red-500 text-white rounded mt-4"
                onClick={() => handlePublishResults(managerId)}
              >
                Publish Results for {managerId}
              </button>
            </div>
          ))}
          {Object.keys(priority1Results).length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-bold">Priority 1 Results:</h3>
              <ul className="space-y-2">
                {Object.entries(priority1Results).map(([candidateId, totalVotes]) => (
                  <li key={candidateId} className="flex justify-between">
                    <span>{candidateId}</span>
                    <span>{totalVotes} votes</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {Object.keys(priority2Results).length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-bold">Priority 2 Results:</h3>
              <ul className="space-y-2">
                {Object.entries(priority2Results).map(([candidateId, totalVotes]) => (
                  <li key={candidateId} className="flex justify-between">
                    <span>{candidateId}</span>
                    <span>{totalVotes} votes</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {Object.keys(priority3Results).length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-bold">Priority 3 Results:</h3>
              <ul className="space-y-2">
                {Object.entries(priority3Results).map(([candidateId, totalVotes]) => (
                  <li key={candidateId} className="flex justify-between">
                    <span>{candidateId}</span>
                    <span>{totalVotes} votes</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VoteCounts;
