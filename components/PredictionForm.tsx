import { useState, useEffect } from "react";
import axios from "axios";

interface CandidateData {
  keywords: string;
  party: string;
}

const TweetCollectionForm: React.FC = () => {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [candidateKeywords, setCandidateKeywords] = useState<Record<string, CandidateData>>({});
  const [generalKeywords, setGeneralKeywords] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [candidates, setCandidates] = useState<Array<{ name: string; party: string }>>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<string>("");
  const [collecting, setCollecting] = useState<boolean>(false);
  const [running, setRunning] = useState<boolean>(false);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await axios.get("/api/Candidates/getCandidateList");
        setCandidates(response.data.candidates);
      } catch (error) {
        console.error("Error fetching candidates:", error);
      }
    };
    fetchCandidates();
  }, []);

  const handleCandidateKeywordChange = (candidateName: string, value: string) => {
    setCandidateKeywords((prev) => ({
      ...prev,
      [candidateName]: {
        ...prev[candidateName],
        keywords: value
      }
    }));
  };

  const handleAddCandidate = () => {
    if (selectedCandidate) {
      const candidate = candidates.find(c => c.name === selectedCandidate);
      if (candidate && !candidateKeywords[selectedCandidate]) {
        setCandidateKeywords((prev) => ({
          ...prev,
          [selectedCandidate]: {
            keywords: "",
            party: candidate.party
          }
        }));
        setSelectedCandidate("");
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setCollecting(true);

    try {
      await axios.post("/api/Candidates/collect-tweets", {
        start_date: startDate,
        end_date: endDate,
        candidate_keywords: candidateKeywords,
        general_keywords: generalKeywords.split(",").map((kw) => kw.trim()).filter(Boolean),
      });

      await Promise.all(
        Object.entries(candidateKeywords).map(([candidateName, data]) =>
          axios.post("/api/Candidates/candidateKeyword", {
            name: candidateName,
            party: data.party,
            keywords: data.keywords.split(",").map((kw) => kw.trim()).filter(Boolean)
          })
        )
      );

      setMessage("Tweets collection started successfully!");
    } catch (error) {
      console.error("Error collecting tweets:", error);
      setMessage("Failed to start tweet collection.");
    }

    setLoading(false);
  };

  const handleStopCollection = async () => {
    setMessage("");
    setCollecting(false);
    try {
      const response = await axios.delete("/api/Candidates/collect-tweets");
      if (response.status === 200) {
        setMessage("Tweet collection stopped successfully!");
      } else {
        setMessage("Failed to stop tweet collection.");
      } 
    } catch (error) {
      console.error("Error stopping tweet collection:", error);
      setMessage("Failed to stop tweet collection.");
    }
  };

  const handleStartPrediction = async () => {
    setMessage("Starting prediction...");
    try {
      console.log("Sending request to start prediction...");
      const response = await axios.post("http://127.0.0.1:5000/api/start_prediction");
      console.log("Prediction started:", response.data);

      setMessage(response.data.message);
      setRunning(true);
    } catch (error) {
      console.error("Error starting prediction:", error);
      setMessage("Failed to start prediction.");
    }
  };
  
  const handleStopPrediction = async () => {
    setMessage("Stopping prediction...");
    try {
      const response = await axios.post("http://127.0.0.1:5000/api/stop_prediction");
      setMessage(response.data.message);
      setRunning(false);
    } catch (error) {
      console.error("Error stopping prediction:", error);
      setMessage("Failed to stop prediction.");
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Collect Tweets</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date inputs remain the same */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Start Date:</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">End Date:</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm" required />
        </div>

        {/* Candidate keywords section */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Candidate Keywords:</label>
          <div className="space-y-2">
            {Object.entries(candidateKeywords).map(([candidateName, data]) => (
              <div key={candidateName}>
                <label className="block text-sm font-medium text-gray-700">
                  {candidateName} ({data.party}):
                </label>
                <input
                  type="text"
                  value={data.keywords}
                  onChange={(e) => handleCandidateKeywordChange(candidateName, e.target.value)}
                  placeholder="Enter keywords separated by commas"
                  className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm"
                />
              </div>
            ))}
          </div>

          <div className="mt-2 flex items-center space-x-2">
            <select 
              value={selectedCandidate} 
              onChange={(e) => setSelectedCandidate(e.target.value)} 
              className="px-3 py-2 border rounded-md shadow-sm w-full"
            >
              <option value="">Select Candidate</option>
              {candidates.map((candidate) => (
                <option key={candidate.name} value={candidate.name}>
                  {candidate.name} ({candidate.party})
                </option>
              ))}
            </select>
            <button 
              type="button" 
              onClick={handleAddCandidate} 
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Add
            </button>
          </div>
        </div>

        {/* General keywords remains the same */}
        <div>
          <label className="block text-sm font-medium text-gray-700">General Keywords:</label>
          <textarea
            value={generalKeywords}
            onChange={(e) => setGeneralKeywords(e.target.value)}
            placeholder="Enter additional keywords separated by commas"
            rows={3}
            className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm"
          />
        </div>

        {/* Buttons remain the same */}
        <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700">
          {loading ? "Collecting..." : "Start Collecting"}
        </button>

        {collecting && (
          <button type="button" onClick={handleStopCollection} className="w-full mt-2 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700">
            Stop Collecting
          </button>
        )}

        <button
          onClick={handleStartPrediction}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
          disabled={running}
        >
          Start Prediction
        </button>

        {running && (
          <button
            onClick={handleStopPrediction}
            className="w-full mt-2 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
            disabled={!running}
          >
            Stop Prediction
          </button>
        )}

        {message && (
          <div className={`mt-4 p-2 text-center rounded-md ${
            message.includes("success") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
};

export default TweetCollectionForm;