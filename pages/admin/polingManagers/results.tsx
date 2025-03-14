import { useEffect, useState } from 'react';
import { storeResultsOnBlockchain, getResultsFromBlockchain, getAllResultsFromBlockchain } from '../../../services/blockchain';
import { useSession } from "next-auth/react";

interface VoteCountsProps {}

const VoteCounts: React.FC<VoteCountsProps> = () => {
  const [voteCounts, setVoteCounts] = useState<Record<string, Record<string, number>>>({});
  const [loading, setLoading] = useState(true);
  const [showPriority2, setShowPriority2] = useState(false);
  const [showPriority3, setShowPriority3] = useState(false);
  const [candidateId, setCandidateId] = useState("");
  const [results, setResults] = useState<{ priority1: number; priority2: number; priority3: number } | null>(null);
  const [allResults, setAllResults] = useState<
    { pollingManagerId: string; candidateId: string; priority1: number; priority2: number; priority3: number }[] | null
  >(null);

  const { data: session } = useSession();
  const pollingManagerId = session?.user?._id; // Get the Polling Manager's ID

  useEffect(() => {
    const fetchVotes = async () => {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/vote/count?poll_manager_id=${pollingManagerId}`);
      const counts = await response.json();
      console.log(counts);
      setVoteCounts(counts);

      setLoading(false);
    };

    if (pollingManagerId) {
      fetchVotes();
    }
  }, [pollingManagerId]);

  const handleStoreVotes = async (priority: number) => {
    if (!pollingManagerId) {
      console.error("Polling Manager ID is undefined");
      return;
    }
    const candidateVotes: Record<string, number> = {};
    for (const [candidateId, votes] of Object.entries(voteCounts)) {
      const count = votes[priority.toString()];
      if (count !== undefined) {
        candidateVotes[candidateId] = count;
      }
    }
    await storeResultsOnBlockchain(pollingManagerId, candidateVotes, priority);
    console.log(candidateVotes);
  };

  // const handleFetchResults = async (candidateId: string) => {
  //   setLoading(true);
  //   const data = await getResultsFromBlockchain(pollingManagerId, candidateId);
  //   setResults(data);
  //   setLoading(false);
  // };

  const handleFetchAllResults = async () => {
    setLoading(true);
    const data = await getAllResultsFromBlockchain();
    setAllResults(data);
    setLoading(false);
  };

  if (loading) {
    return <p>Loading vote counts...</p>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Vote Counts</h2>
      {Object.keys(voteCounts).length === 0 ? (
        <p>No votes found for your polling station.</p>
      ) : (
        <>
            <ul className="space-y-4">
            {Object.entries(voteCounts).map(([candidateId, votes]) => (
              <li key={candidateId} className="p-3 border rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Candidate: {candidateId}</h3>
              {Object.entries(votes).map(([priority, count]) => (
                (priority === '1' || (priority === '2' && showPriority2) || (priority === '3' && showPriority3)) && (
                <div key={priority} className="mb-4">
                  <h4 className="text-md font-semibold mb-2">(Priority: {priority})</h4>
                  <p className="font-bold">{count} votes</p>
                </div>
                )
              ))}
              </li>
            ))}
            </ul>

          {/* Buttons to Store Priority Votes on Blockchain */}
          <div className="mt-4">
            {!showPriority2 && (
              <button
                className="px-4 py-2 bg-green-500 text-white rounded"
                onClick={async () => {
                  await handleStoreVotes(1);
                  setShowPriority2(true);
                }}
              >
                Store Priority 1 Votes on Blockchain
              </button>
            )}

            {showPriority2 && !showPriority3 && (
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded ml-2"
                onClick={async () => {
                  await handleStoreVotes(2);
                  setShowPriority3(true);
                }}
              >
                Store Priority 2 Votes on Blockchain
              </button>
            )}

            {showPriority3 && (
              <button
                className="px-4 py-2 bg-purple-500 text-white rounded ml-2"
                onClick={async () => {
                  await handleStoreVotes(3);
                }}
              >
                Store Priority 3 Votes on Blockchain
              </button>
            )}
          </div>
        </>
      )}

      {/* Get Individual Candidate Results */}
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Blockchain Vote Results</h2>
        <input
          type="text"
          placeholder="Enter Candidate ID"
          value={candidateId}
          onChange={(e) => setCandidateId(e.target.value)}
          className="p-2 border rounded mr-2"
        />
        {/* <button
          onClick={() => handleFetchResults(candidateId)}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Get Results
        </button> */}

        {loading && <p>Loading...</p>}

        {results && (
          <div className="mt-4">
            <p><strong>Priority 1 Votes:</strong> {results.priority1}</p>
            <p><strong>Priority 2 Votes:</strong> {results.priority2}</p>
            <p><strong>Priority 3 Votes:</strong> {results.priority3}</p>
          </div>
        )}
      </div>

      {/* Get All Blockchain Vote Results */}
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">All Blockchain Vote Results</h2>
        <button
          onClick={handleFetchAllResults}
          className="px-4 py-2 bg-indigo-500 text-white rounded"
        >
          Get All Results
        </button>

        {loading && <p>Loading...</p>}

        {allResults && (
          <ul className="space-y-4 mt-4">
            {allResults.length === 0 ? (
              <p>No votes found.</p>
            ) : (
              allResults.map(({ pollingManagerId, candidateId, priority1, priority2, priority3 }) => (
                <li key={`${pollingManagerId}-${candidateId}`} className="p-3 border rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-2">Polling Manager: {pollingManagerId}</h3>
                  <h3 className="text-lg font-semibold mb-2">Candidate: {candidateId}</h3>
                  <p><strong>Priority 1 Votes:</strong> {priority1}</p>
                  <p><strong>Priority 2 Votes:</strong> {priority2}</p>
                  <p><strong>Priority 3 Votes:</strong> {priority3}</p>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default VoteCounts;
