import React from "react";
import DistrictResults from "../components/DistrictResults";
import PollingDivisions from "../components/PollingDivisions";
import Sidebar from "../components/Sidebar";

const districtData = {
  candidates: [
    { name: "Anura Kumara", party: "NPP", votes: 629963, percentage: 47.21, imageUrl: "assets/images/profile.png",color: "#FF0000" },
    { name: "Sajith Premadasa", party: "SJB", votes: 342108, percentage: 25.64,imageUrl: "assets/images/profile.png", color: "#FFD700" },
    { name: "Ranil Wickremesinghe", party: "IND16", votes: 281436, percentage: 21.09,imageUrl: "assets/images/profile.png", color: "#008000" },
    // Add more candidates here
  ],
  totalVotes: 1500000,
  pollingDivisions: [
    {
      name: "Colombo-North",
      candidates: [
        { name: "Anura Kumara", votes: 25400, percentage: 38.21, color: "#FF0000" },
        { name: "Sajith Premadasa", votes: 18400, percentage: 27.66, color: "#FFD700" },
        { name: "Ranil Wickremesinghe", votes: 16000, percentage: 24.08, color: "#008000" },
      ],
    },
    {
      name: "Colombo-West",
      candidates: [
        { name: "Sajith Premadasa", votes: 45000, percentage: 42.58, color: "#FFD700" },
        { name: "Anura Kumara", votes: 30000, percentage: 28.38, color: "#FF0000" },
        { name: "Ranil Wickremesinghe", votes: 20000, percentage: 18.94, color: "#008000" },
      ],
    },
    {
      name: "Dehiwala",
      candidates: [
        { name: "Ranil Wickremesinghe", votes: 32000, percentage: 35.29, color: "#008000" },
        { name: "Sajith Premadasa", votes: 30000, percentage: 33.12, color: "#FFD700" },
        { name: "Anura Kumara", votes: 20000, percentage: 22.06, color: "#FF0000" },
      ],
    },
    {
      name: "Homagama",
      candidates: [
        { name: "Anura Kumara", votes: 41000, percentage: 40.67, color: "#FF0000" },
        { name: "Sajith Premadasa", votes: 32000, percentage: 31.72, color: "#FFD700" },
        { name: "Ranil Wickremesinghe", votes: 15000, percentage: 14.87, color: "#008000" },
      ],
    },
    {
      name: "Kaduwela",
      candidates: [
        { name: "Sajith Premadasa", votes: 35000, percentage: 39.82, color: "#FFD700" },
        { name: "Anura Kumara", votes: 30000, percentage: 34.10, color: "#FF0000" },
        { name: "Ranil Wickremesinghe", votes: 20000, percentage: 22.73, color: "#008000" },
      ],
    },
    {
      name: "Kesbewa",
      candidates: [
        { name: "Anura Kumara", votes: 28000, percentage: 37.84, color: "#FF0000" },
        { name: "Sajith Premadasa", votes: 26000, percentage: 35.14, color: "#FFD700" },
        { name: "Ranil Wickremesinghe", votes: 17000, percentage: 22.97, color: "#008000" },
      ],
    },
    {
      name: "Kolonnawa",
      candidates: [
        { name: "Ranil Wickremesinghe", votes: 40000, percentage: 45.88, color: "#008000" },
        { name: "Sajith Premadasa", votes: 32000, percentage: 36.69, color: "#FFD700" },
        { name: "Anura Kumara", votes: 12000, percentage: 13.79, color: "#FF0000" },
      ],
    },
    {
      name: "Kotte",
      candidates: [
        { name: "Sajith Premadasa", votes: 47000, percentage: 43.96, color: "#FFD700" },
        { name: "Ranil Wickremesinghe", votes: 36000, percentage: 33.65, color: "#008000" },
        { name: "Anura Kumara", votes: 19000, percentage: 17.78, color: "#FF0000" },
      ],
    },
    {
      name: "Maharagama",
      candidates: [
        { name: "Anura Kumara", votes: 37000, percentage: 40.00, color: "#FF0000" },
        { name: "Sajith Premadasa", votes: 32000, percentage: 34.59, color: "#FFD700" },
        { name: "Ranil Wickremesinghe", votes: 15000, percentage: 16.22, color: "#008000" },
      ],
    },
    // Add more divisions
  ],
};

const DistrictPage: React.FC = () => {
  return (
    
<div style={{ padding: "20px" }}>
  {/* Page Title */}
  <div style={{ marginBottom: "20px", textAlign: "center", backgroundColor:"#af3512", padding:"15px",borderRadius:"20px"}}>
    <h1 style={{ fontSize: "30px", color: "#333", fontWeight: "bold" }}>
      District Election Overview -Colombo 
    </h1>
    <p style={{ fontSize: "14px", color: "#ffffff" }}>
      Comprehensive results and details by polling divisions.
    </p>
  </div>

  <div style={{ display: "flex", gap: "20px", padding: "20px" }}>
    {/* Main Content */}
    <div style={{ flex: 3 }}>
      <div style={{ display: "flex", gap: "20px" }}>
        {/* District Results */}
        <div style={{ flex: 2 }}>
          <DistrictResults
            candidates={districtData.candidates}
            totalVotes={districtData.totalVotes}
          />
        </div>

        {/* Sidebar */}
        <div style={{ flex: 1 }}>
          <Sidebar
            divisions={districtData.pollingDivisions.map(
              (division) => division.name
            )}
          />
        </div>
      </div>


    </div>
  </div>
        {/* Polling Divisions (below the DistrictResults and Sidebar) */}
        <PollingDivisions divisions={districtData.pollingDivisions} />
</div>


  );
};

export default DistrictPage;
