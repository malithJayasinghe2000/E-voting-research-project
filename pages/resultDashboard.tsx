import React from "react";
import SriLankaMap from "@/components/map";
import ElectionResults from '@/components/partyResult'
import PollingDistricts from '@/components/PollingDistricts'




const ResultDashboard: React.FC = () => {
  return (
    
<div style={{ padding: "20px" }}>
  {/* Page Title */}
  <div style={{ marginBottom: "20px", textAlign: "center", backgroundColor:"#af3512", padding:"15px",borderRadius:"20px"}}>
    <h1 style={{ fontSize: "30px", color: "#333", fontWeight: "bold" }}>
       Election Overview  
    </h1>
    <p style={{ fontSize: "14px", color: "#ffffff" }}>
      Comprehensive results and details 
    </p>
  </div>

  <div
  style={{
    display: "flex",
    gap: "20px",
    padding: "20px",
    width: "100%", // Ensure the container spans the full screen width
    boxSizing: "border-box", // Include padding in width calculations
  }}
>
  {/* Main Content */}
  <div
    style={{
      display: "flex",
      gap: "20px",
      alignItems: "stretch", // Ensures both children have the same height
      flexWrap: "wrap", // Make the layout responsive
      width: "100%", // Full-width container
    }}
  >
    {/* District Results (Sri Lanka Map) */}
    <div
      style={{
        flex: 2,
        background: "#ffffff", // Optional background for visualization
        border: "1px solid #eaeaea",
        borderRadius: "8px",
        boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
        padding: "15px",
        display: "flex", // Ensure inner content adjusts properly
        flexDirection: "column",
        minWidth: "300px", // Prevent components from shrinking too much
        width: "100%", // Ensure it takes up available width
        alignItems:"center"
      }}
    >
      <SriLankaMap />
    </div>

    {/* Sidebar (Election Results) */}
    <div
      style={{
        flex: 1,
        background: "#ffffff", // Optional background for visualization
        border: "1px solid #eaeaea",
        borderRadius: "8px",
        boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
        padding: "15px",
        display: "flex", // Ensure inner content adjusts properly
        flexDirection: "column",
        minWidth: "300px", // Prevent components from shrinking too much
        width: "100%", // Ensure it takes up available width
      }}
    >
      <ElectionResults />
    </div>
  </div>
</div>


        {/* Polling Districts (below the DistrictResults and Sidebar) */}
        <PollingDistricts />
</div>


  );
};

export default ResultDashboard;
