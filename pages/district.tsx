import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import DistrictResults from "../components/DistrictResults";
import PollingDivisions from "../components/PollingDivisions";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import HomeNavbar from "@/components/Home-Navbar";
import ResultDashboard from "./resultDashboard";
import PredictionDashboard from "./predictionDashboard";

const colorMap: Record<string, string> = {
  "Anura Kumara": "#FF0000",
  "Sajith Premadasa": "#FFD700",
  "Ranil Wickremesinghe": "#008000",
  "candidate": "#FF0000",
  "new candidate": "#FFD700",
  "test new": "#008000",
  // Add additional mappings here if needed
};

const DistrictPage: React.FC = () => {
  const router = useRouter();
  const { district } = router.query;

  const [loading, setLoading] = useState(true);
  const [districtData, setDistrictData] = useState<null | any>(null);
  const [currentView, setCurrentView] = useState('home');

  useEffect(() => {
    if (!district) return;

    const fetchDistrictData = async () => {
      try {
        const res = await axios.get(`/api/vote/fetchResultsByDistrict?district=${district}`);
        const data = res.data;

        // Add colors manually here
        const enhancedOverallResults = data.overallResults.map((candidate: any) => ({
          ...candidate,
          color: colorMap[candidate.name] || "#CCCCCC",
        }));

        const enhancedPollingDivisions = data.pollingDivisions.map((division: any) => ({
          ...division,
          candidates: division.candidates.map((candidate: any) => ({
            ...candidate,
            color: colorMap[candidate.name] || "#CCCCCC",
          })),
        }));

        setDistrictData({
          candidates: enhancedOverallResults,
          totalVotes: data.totalVotes,
          pollingDivisions: enhancedPollingDivisions,
        });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching district data:", err);
        setLoading(false);
      }
    };

    fetchDistrictData();
  }, [district]);

  if (loading) {
    return <div>Loading district data...</div>;
  }

  if (!districtData) {
    return <div>No data found for this district.</div>;
  }

  return (
    <div className="min-h-screen relative backdrop-blur">
      <div
          className="absolute inset-0 before:absolute before:inset-0
          before:w-full before:h-full before:bg-[url('/assets/images/bg.jpeg')]
          before:blur-sm before:z-[-1] before:bg-no-repeat before:bg-cover"
        />
        <HomeNavbar
            onResultDashboardClick={() => setCurrentView('resultDashboard')}
            onPredictionDashboardClick={() => setCurrentView('predictionDashboard')} // Add handler
            onHomeClick={() => setCurrentView('home')}
          />
          {currentView === 'resultDashboard' && <ResultDashboard />}
          {currentView === 'predictionDashboard' && <PredictionDashboard />}
    <div style={{ padding: "20px" }}>
      {/* Page Title */}
      <div style={{ marginBottom: "20px", textAlign: "center", backgroundColor: "#af3512", padding: "15px", borderRadius: "20px" }}>
        <h1 style={{ fontSize: "30px", color: "#333", fontWeight: "bold" }}>
          District Election Overview - {district}
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
                  (division: any) => division.name
                )}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Polling Divisions */}
      <PollingDivisions divisions={districtData.pollingDivisions} />
    </div>
    </div>
  );
};

export default DistrictPage;
