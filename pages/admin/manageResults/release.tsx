import { useEffect, useState } from 'react';
import { getAllResultsFromBlockchain } from '../../../services/blockchain';

interface VoteCountsProps {}

const VoteCounts: React.FC<VoteCountsProps> = () => {
  const [voteCounts, setVoteCounts] = useState<Record<string, Record<string, number>>>({});
  const [loading, setLoading] = useState(true);
  const [showPriority2, setShowPriority2] = useState(false);
  const [showFinalResult, setShowFinalResult] = useState(false);

  useEffect(() => {
    const fetchVotes = async () => {
      const results = await getAllResultsFromBlockchain();
      if (results) {
        const counts = results.reduce((acc, { candidateId, priority1, priority2 }) => ({
          ...acc,
          [candidateId]: { 1: priority1, 2: priority2 }
        }), {});
        setVoteCounts(counts);
      }
      setLoading(false);
    };
    fetchVotes();
  }, []);

  const getTotalFirstPriorityVotes = () => Object.values(voteCounts).reduce((sum, v) => sum + (v['1'] || 0), 0);
  const getMaxFirstPriorityVotes = () => Math.max(...Object.values(voteCounts).map(v => v['1'] || 0));
  const getTopTwoCandidates = () => Object.entries(voteCounts)
    .map(([id, v]) => ({ id, first: v['1'] || 0, second: v['2'] || 0 }))
    .sort((a, b) => b.first - a.first)
    .slice(0, 2);

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
          <ul className="space-y-4">
            {Object.entries(voteCounts).map(([id, v]) => (
              <li key={id} className="p-3 border rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Candidate: {id}</h3>
                <ul>
                  {Object.entries(v).map(([p, c]) => (
                    (p === '1' || (p === '2' && showPriority2)) && (
                      <li key={p} className="flex justify-between">
                        <span className="font-bold">{c} votes (Priority {p})</span>
                      </li>
                    )
                  ))}
                </ul>
              </li>
            ))}
          </ul>
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
        </>
      )}
    </div>
  );
};

export default VoteCounts;
