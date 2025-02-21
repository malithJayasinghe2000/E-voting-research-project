import React from "react";
import SriLankaMap from "@/components/map";
import ElectionResults from '@/components/partyResult';
import { Cell, Legend, Pie, PieChart, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { results } from "@/data/candidateResults";

// Example predicted vote count data
const predictedVoteData = [
    { month: "Jan", NPP: 4800000, SJB: 4000000, IND16: 2000000, SLPP: 290000, IND9: 190000 },
    { month: "Feb", NPP: 4900000, SJB: 4100000, IND16: 2050000, SLPP: 295000, IND9: 195000 },
    { month: "Mar", NPP: 5000000, SJB: 4150000, IND16: 2080000, SLPP: 298000, IND9: 198000 },
    { month: "Apr", NPP: 5100000, SJB: 4200000, IND16: 2100000, SLPP: 300000, IND9: 200000 },
    { month: "May", NPP: 5150000, SJB: 4250000, IND16: 2120000, SLPP: 302000, IND9: 202000 },
    { month: "Jun", NPP: 5200000, SJB: 4300000, IND16: 2150000, SLPP: 305000, IND9: 205000 },
    { month: "Jul", NPP: 5250000, SJB: 4350000, IND16: 2170000, SLPP: 308000, IND9: 208000 },
    { month: "Aug", NPP: 5300000, SJB: 4400000, IND16: 2200000, SLPP: 310000, IND9: 210000 },
    { month: "Sep", NPP: 5400000, SJB: 4450000, IND16: 2220000, SLPP: 315000, IND9: 215000 },
    { month: "Oct", NPP: 5500000, SJB: 4500000, IND16: 2250000, SLPP: 320000, IND9: 220000 },
    { month: "Nov", NPP: 5550000, SJB: 4550000, IND16: 2270000, SLPP: 325000, IND9: 225000 },
    { month: "Dec", NPP: 5600000, SJB: 4600000, IND16: 2300000, SLPP: 330000, IND9: 230000 },
  ];
  

const ResultDashboard: React.FC = () => {
  return (
    <div style={{ padding: "20px" }}>
      {/* Page Title */}
      <div style={{ marginBottom: "20px", textAlign: "center", backgroundColor: "#af3512", padding: "15px", borderRadius: "20px" }}>
        <h1 style={{ fontSize: "30px", color: "#333", fontWeight: "bold" }}>
          Election Overview - Prediction
        </h1>
        <p style={{ fontSize: "14px", color: "#ffffff" }}>
          Predicted results and details
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
              background: "#ffffff",
              border: "1px solid #eaeaea",
              borderRadius: "8px",
              boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
              padding: "15px",
              display: "flex",
              flexDirection: "column",
              minWidth: "300px",
              width: "100%",
              alignItems: "center"
            }}
          >
            <SriLankaMap />
          </div>

          {/* Sidebar (Election Results) */}
          <div
            style={{
              flex: 1,
              background: "#ffffff",
              border: "1px solid #eaeaea",
              borderRadius: "8px",
              boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
              padding: "15px",
              display: "flex",
              flexDirection: "column",
              minWidth: "300px",
              width: "100%",
            }}
          >
            <ElectionResults />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: "20px", marginTop: "20px" }}>
        {/* Pie Chart Section */}
        <div style={{ flex: 2, background: "#ffffff",
              border: "1px solid #eaeaea",
              borderRadius: "8px",
              boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
              padding: "15px",
              display: "flex",
              flexDirection: "column",
              alignItems:"center",
              minWidth: "300px",
              width: "100%",textAlign: "center" }}>
            <h2 style={{ marginBottom: "20px", fontSize: "18px", color: "#333", fontWeight: "bold" }}>
                Party-wise Vote Distribution
            </h2>
          <PieChart width={390} height={400}>
            <Pie
              data={results}
              dataKey="voteCount"
              nameKey="partyName"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label={(entry) => `${entry.partyName}: ${entry.percentage.toFixed(1)}%`}
            >
              {results.map((candidateName, index) => (
                <Cell key={`cell-${index}`} fill={candidateName.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>

        {/* Line Chart Section */}
        <div style={{ flex: 3 ,background: "#ffffff",
              border: "1px solid #eaeaea",
              borderRadius: "8px",
              boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
              padding: "15px",
              display: "flex",
              flexDirection: "column",
              minWidth: "300px",
              alignItems:"center",
              width: "100%",}}>
        <h2 style={{ marginBottom: "20px", fontSize: "18px", color: "#333", fontWeight: "bold" }}>
            Predicted Vote Growth Over the Year
        </h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={predictedVoteData}
              margin={{ top: 5, right: 20, bottom: 5, left: 15 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="NPP" stroke="#E63946" name="NPP" />
              <Line type="monotone" dataKey="SJB" stroke="#FFD166" name="SJB" />
              <Line type="monotone" dataKey="IND16" stroke="#06D6A0" name="IND16" />
              <Line type="monotone" dataKey="SLPP" stroke="#D7263D" name="SLPP" />
              <Line type="monotone" dataKey="IND9" stroke="#9E9E9E" name="IND9" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ResultDashboard;
