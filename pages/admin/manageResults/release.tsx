import { useEffect, useState } from 'react';
import { getAllResultsFromBlockchain } from '../../../services/blockchain';
import axios from 'axios';

interface VoteCountsProps {}

const VoteCounts: React.FC<VoteCountsProps> = () => {
  const [voteCounts, setVoteCounts] = useState<Record<string, Record<string, Record<string, number>>>>({});
  const [loading, setLoading] = useState(true);
  const [showPriority2, setShowPriority2] = useState(false);
  const [showFinalResult, setShowFinalResult] = useState(false);

  useEffect(() => {
    const fetchVotes = async () => {
      const results = await getAllResultsFromBlockchain();
      if (results) {
        const counts = results.reduce((acc, { pollingManagerId, candidateId, priority1, priority2 }) => {
          if (!acc[pollingManagerId]) {
            acc[pollingManagerId] = {};
          }
          if (!acc[pollingManagerId][candidateId]) {
            acc[pollingManagerId][candidateId] = { 1: 0, 2: 0 };
          }
          acc[pollingManagerId][candidateId][1] += priority1;
          acc[pollingManagerId][candidateId][2] += priority2;
          return acc;
        }, {} as Record<string, Record<string, Record<string, number>>>);
        setVoteCounts(counts);
      }
      setLoading(false);
    };
    fetchVotes();
  }, []);

  const getTotalFirstPriorityVotes = () => Object.values(voteCounts).reduce((sum, managerVotes) => {
    return sum + Object.values(managerVotes).reduce((managerSum, v) => managerSum + (v['1'] || 0), 0);
  }, 0);

  const getMaxFirstPriorityVotes = () => Math.max(...Object.values(voteCounts).flatMap(managerVotes => {
    return Object.values(managerVotes).map(v => v['1'] || 0);
  }));

  const getTopTwoCandidates = () => {
    const candidateTotals: Record<string, { first: number; second: number }> = {};
    Object.values(voteCounts).forEach(managerVotes => {
      Object.entries(managerVotes).forEach(([candidateId, votes]) => {
        if (!candidateTotals[candidateId]) {
          candidateTotals[candidateId] = { first: 0, second: 0 };
        }
        candidateTotals[candidateId].first += votes['1'] || 0;
        candidateTotals[candidateId].second += votes['2'] || 0;
      });
    });
    return Object.entries(candidateTotals)
      .map(([id, v]) => ({ id, first: v.first, second: v.second }))
      .sort((a, b) => b.first - a.first)
      .slice(0, 2);
  };

  const totalFirstVotes = getTotalFirstPriorityVotes();
  const maxFirstVotes = getMaxFirstPriorityVotes();
  const maxVotesPercentage = (maxFirstVotes / totalFirstVotes) * 100;
  const topTwo = getTopTwoCandidates();

  const getFinalResult = () => {
    const [first, second] = topTwo;
    const firstTotal = first.first + (showPriority2 ? first.second : 0);
    const secondTotal = second.first + (showPriority2 ? second.second : 0);
    return firstTotal > secondTotal ? first.id : second.id;
  };

  const handlePublishResults = async () => {
    try {
      await axios.post('/api/vote/publish', { voteCounts });
      alert('Results published successfully!');
    } catch (error) {
      console.error('Failed to publish results:', error);
      alert('Failed to publish results.');
    }
  };

  if (loading) return <p>Loading vote counts...</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Vote Counts</h2>
      {Object.keys(voteCounts).length === 0 ? (
        <p>No votes found.</p>
      ) : (
        <>
          {maxVotesPercentage <= 51 && (
            <div className="mb-4">
              <p>No candidate has more than 51% of first-priority votes.</p>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded"
                onClick={() => setShowPriority2(true)}
              >
                Count Priority 2 Votes
              </button>
            </div>
          )}
          {Object.entries(voteCounts).map(([managerId, managerVotes]) => (
            <div key={managerId} className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Polling Manager: {managerId}</h3>
              <ul className="space-y-4">
                {Object.entries(managerVotes).map(([candidateId, votes]) => (
                  <li key={candidateId} className="p-3 border rounded-lg shadow">
                    <h4 className="text-md font-semibold mb-2">Candidate: {candidateId}</h4>
                    <ul>
                      {Object.entries(votes).map(([priority, count]) => (
                        (priority === '1' || (priority === '2' && showPriority2)) && (
                          <li key={priority} className="flex justify-between">
                            <span className="font-bold">{count} votes (Priority {priority})</span>
                          </li>
                        )
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {showPriority2 && (
            <div className="mt-4">
              <button
                className="px-4 py-2 bg-green-500 text-white rounded"
                onClick={() => setShowFinalResult(true)}
              >
                Show Final Result
              </button>
              {showFinalResult && (
                <p className="mt-4 text-lg font-bold">
                  Winner: {getFinalResult()}
                </p>
              )}
            </div>
          )}
          <div className="mt-4">
            <button
              className="px-4 py-2 bg-red-500 text-white rounded"
              onClick={handlePublishResults}
            >
              Publish Results
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default VoteCounts;
