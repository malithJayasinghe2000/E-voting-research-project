export async function fetchVoteCounts() {
    try {
      const response = await fetch("http://localhost:5000/api/vote/count"); // Adjust API URL
      if (!response.ok) throw new Error("Failed to fetch vote counts");
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching votes:", error);
      return null;
    }
  }
  