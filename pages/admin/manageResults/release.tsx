// src/components/VoteCounts.tsx
import { useEffect, useState } from 'react';
import {fetchVoteCounts} from '../../api/Results/release';   

interface VoteCountsProps {}

const VoteCounts: React.FC<VoteCountsProps> = () => {
  const [voteCounts, setVoteCounts] = useState<Record<string, Record<string, number>>>({});
  const [loading, setLoading] = useState(true);
  const [showPriority2, setShowPriority2] = useState(false);
  const [showFinalResult, setShowFinalResult] = useState(false);

  useEffect(() => {
    const fetchVotes = async () => {
      const counts = await fetchVoteCounts();
      console.log(counts);
      setVoteCounts(counts);
      setLoading(false);
    };
    fetchVotes();
  }, []);

  const getTotalFirstPriorityVotes = () => {
    let total = 0;
    Object.values(voteCounts).forEach(votes => {
      if (votes['1']) {
        total += votes['1'];
      }
    });
    return total;
  };

  const getMaxFirstPriorityVotes = () => {
    let maxVotes = 0;
    Object.values(voteCounts).forEach(votes => {
      if (votes['1'] && votes['1'] > maxVotes) {
        maxVotes = votes['1'];
      }
    });
    return maxVotes;
  };

  const getTopTwoCandidates = () => {
    const candidates = Object.entries(voteCounts).map(([candidateId, votes]) => ({
      candidateId,
      firstPriorityVotes: votes['1'] || 0,
      secondPriorityVotes: votes['2'] || 0,
    }));
    candidates.sort((a, b) => b.firstPriorityVotes - a.firstPriorityVotes);
    return candidates.slice(0, 2);
  };

  if (loading) {
    return <p>Loading vote counts...</p>;
  }

  const totalFirstPriorityVotes = getTotalFirstPriorityVotes();
  const maxFirstPriorityVotes = getMaxFirstPriorityVotes();
  const maxVotesPercentage = (maxFirstPriorityVotes / totalFirstPriorityVotes) * 100;
  const topTwoCandidates = getTopTwoCandidates();

  const getFinalResult = () => {
    const [first, second] = topTwoCandidates;
    const firstTotalVotes = first.firstPriorityVotes + (showPriority2 ? first.secondPriorityVotes : 0);
    const secondTotalVotes = second.firstPriorityVotes + (showPriority2 ? second.secondPriorityVotes : 0);
    return firstTotalVotes > secondTotalVotes ? first.candidateId : second.candidateId;
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Vote Counts</h2>
      {Object.keys(voteCounts).length === 0 ? (
        <p>No votes found.</p>
      ) : (
        <>
          {maxVotesPercentage <= 51 && (
            <div className="mb-4">
              <p>No candidate has more than 51% of the first priority votes.</p>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded"
                onClick={() => setShowPriority2(true)}
              >
                Count Priority 2 Votes
              </button>
            </div>
          )}
          <ul className="space-y-4">
            {Object.entries(voteCounts).map(([candidateId, votes]) => (
              <li key={candidateId} className="p-3 border rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Candidate: {candidateId}</h3>
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
