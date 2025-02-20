import { useState } from "react";
import axios from "axios";

const TweetCollectionForm: React.FC = () => {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [candidateKeywords, setCandidateKeywords] = useState<Record<string, string>>({
    "Sajith Premadasa": "",
    "Ranil Wickremesinghe": "",
    "Anura Kumara Dissanayake": "",
    "Gotabaya Rajapaksa": "",
  });
  const [generalKeywords, setGeneralKeywords] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  // Handles input change for candidate keywords
  const handleCandidateKeywordChange = (candidate: string, value: string) => {
    setCandidateKeywords((prev) => ({ ...prev, [candidate]: value }));
  };

  // Handles form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post("http://localhost:5000/collect-tweets", {
        start_date: startDate,
        end_date: endDate,
        candidate_keywords: candidateKeywords,
        general_keywords: generalKeywords.split(",").map((kw) => kw.trim()).filter(Boolean),
      });

      setMessage("Tweets collected successfully!");
    } catch (error) {
      console.error("Error collecting tweets:", error);
      setMessage("Failed to collect tweets.");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Collect Tweets</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date Range Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm"
            required
          />
        </div>

        {/* Candidate Keywords */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Candidate Keywords:</label>
          <div className="space-y-2">
            {Object.keys(candidateKeywords).map((candidate) => (
              <div key={candidate}>
                <label className="block text-sm font-medium text-gray-700">{candidate}:</label>
                <input
                  type="text"
                  value={candidateKeywords[candidate]}
                  onChange={(e) => handleCandidateKeywordChange(candidate, e.target.value)}
                  placeholder="Enter keywords separated by commas"
                  className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm"
                />
              </div>
            ))}
          </div>
        </div>

        {/* General Keywords */}
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
        >
          {loading ? "Collecting..." : "Start Collecting"}
        </button>
      </form>

      {/* Status Message */}
      {message && (
        <div className={`mt-4 p-2 text-center rounded-md ${message.includes("success") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default TweetCollectionForm;
