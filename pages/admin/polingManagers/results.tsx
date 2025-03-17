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
      const response = await fetch(`http://127.0.0.1:5000/api/vote/count?poll_manager_id=${pollingManagerId}`);
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

  const handleFetchAllResults = async () => {
    setLoading(true);
    const data = await getAllResultsFromBlockchain();
    setAllResults(data);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-blue-800 mb-4">Polling Manager Dashboard</h2>
        
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : Object.keys(voteCounts).length === 0 ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">No votes found for your polling station.</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">Submit each priority level sequentially to store votes on the blockchain.</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {Object.entries(voteCounts).map(([candidateId, votes]) => (
                <div key={candidateId} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-700">Candidate: {candidateId}</h3>
                  </div>
                  
                  <div className="space-y-2">
                    {Object.entries(votes).map(([priority, count]) => (
                      (priority === '1' || (priority === '2' && showPriority2) || (priority === '3' && showPriority3)) && (
                        <div key={priority} className="flex justify-between items-center p-2 rounded-lg bg-gray-50">
                          <span className="font-medium text-gray-600">Priority {priority}</span>
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold text-sm">
                            {count} votes
                          </span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Blockchain Storage Actions</h3>
              <div className="flex flex-wrap gap-3">
                {!showPriority2 && (
                  <button
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow hover:from-green-600 hover:to-green-700 transition-all flex items-center space-x-2"
                    onClick={async () => {
                      await handleStoreVotes(1);
                      setShowPriority2(true);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <span>Store Priority 1 Votes</span>
                  </button>
                )}

                {showPriority2 && !showPriority3 && (
                  <button
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow hover:from-blue-600 hover:to-blue-700 transition-all flex items-center space-x-2"
                    onClick={async () => {
                      await handleStoreVotes(2);
                      setShowPriority3(true);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <span>Store Priority 2 Votes</span>
                  </button>
                )}

                {showPriority3 && (
                  <button
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow hover:from-purple-600 hover:to-purple-700 transition-all flex items-center space-x-2"
                    onClick={async () => {
                      await handleStoreVotes(3);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <span>Store Priority 3 Votes</span>
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-blue-800 mb-4">Blockchain Results</h2>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">View All Results</h3>
          <button
            onClick={handleFetchAllResults}
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg shadow hover:from-indigo-600 hover:to-indigo-700 transition-all flex items-center space-x-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            <span>Fetch All Results</span>
          </button>
        </div>

        {loading && (
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}

        {allResults && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">All Blockchain Results</h3>
            {allResults.length === 0 ? (
              <div className="bg-gray-50 p-4 text-center rounded-lg border border-gray-200">
                <p className="text-gray-500">No results found in the blockchain.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allResults.map(({ pollingManagerId, candidateId, priority1, priority2, priority3 }) => (
                  <div key={`${pollingManagerId}-${candidateId}`} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="border-b border-gray-200 pb-2 mb-3">
                      <div className="text-sm text-gray-500">Polling Manager</div>
                      <div className="font-medium">{pollingManagerId}</div>
                    </div>
                    <div className="border-b border-gray-200 pb-2 mb-3">
                      <div className="text-sm text-gray-500">Candidate</div>
                      <div className="font-medium">{candidateId}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 rounded-lg bg-green-50">
                        <span className="text-sm text-gray-600">Priority 1</span>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-semibold text-sm">{priority1}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded-lg bg-blue-50">
                        <span className="text-sm text-gray-600">Priority 2</span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold text-sm">{priority2}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded-lg bg-purple-50">
                        <span className="text-sm text-gray-600">Priority 3</span>
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full font-semibold text-sm">{priority3}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VoteCounts;
