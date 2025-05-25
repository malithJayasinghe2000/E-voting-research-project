import { useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import TweetCollectionForm from "@/components/PredictionForm";

export default function AdminPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">
            <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
            <p>Welcome to the admin panel!</p>

            {/* Prediction Access Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mt-6 max-w-md">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Access Predictions</h2>
                  <p className="text-gray-600">View and analyze election predictions.</p>
                </div>
                <img src="../assets/images/dashboard.png" alt="Predictions" className="w-16 h-16" />
              </div>

              {/* Button inside the card */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                View Predictions
              </button>
            </div>

            {/* PredictionForm Modal */}
            {isModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white rounded-lg p-6 w-[600px] relative">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
                  >
                    ✖
                  </button>
                  <TweetCollectionForm />
                </div>
              </div>
            )}
            </div>

          
        </main>
      </div>
    </div>
  );
}
