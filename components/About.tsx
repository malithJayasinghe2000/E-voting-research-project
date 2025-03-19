import React from "react";
import { FiCalendar, FiUsers, FiFlag, FiCheckCircle, FiClock, FiInfo, FiMapPin } from "react-icons/fi";

const About = () => {
  return (
    <div id="about" className="flex flex-col justify-center min-h-screen bg-gradient-to-b from-gray-900 to-indigo-900 py-16 px-4 md:px-10">
      <div className="container mx-auto">
        <div className="mb-12 text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">
              Presidential Election 2024
            </span>
          </h2>
          <div className="h-1 w-20 bg-blue-500 mx-auto rounded-full mb-6"></div>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            Your voice matters in shaping the nation's future through secure digital voting
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="text-gray-300">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl mb-8 border border-gray-700">
              <h3 className="text-2xl font-semibold text-white mb-4">About the Election</h3>
              <p className="mb-4">
                The Presidential Election 2024 represents a critical moment in our democratic process. This election will determine the leadership that will guide national policy on economy, foreign affairs, healthcare, and education for the next term.
              </p>
              <p>
                This year marks our first implementation of a blockchain-based voting system, ensuring transparency, security, and accessibility for all eligible citizens while maintaining the integrity of the electoral process.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 backdrop-blur-sm p-5 rounded-xl border border-gray-800 hover:bg-white/10 transition-all">
                <div className="flex items-center mb-3">
                  <FiUsers className="text-blue-400 mr-2" size={20} />
                  <h4 className="font-semibold text-white">Eligible Voters</h4>
                </div>
                <p className="text-gray-300">Over 16 million registered citizens representing all districts and regions</p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm p-5 rounded-xl border border-gray-800 hover:bg-white/10 transition-all">
                <div className="flex items-center mb-3">
                  <FiFlag className="text-blue-400 mr-2" size={20} />
                  <h4 className="font-semibold text-white">Major Parties</h4>
                </div>
                <p className="text-gray-300">NPP, SJB, SLPP, and 15+ additional parties and independent candidates</p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm p-5 rounded-xl border border-gray-800 hover:bg-white/10 transition-all">
                <div className="flex items-center mb-3">
                  <FiCalendar className="text-blue-400 mr-2" size={20} />
                  <h4 className="font-semibold text-white">Key Dates</h4>
                </div>
                <p className="text-gray-300">
                  <span className="block">Nominations: July 15-30, 2024</span>
                  <span className="block">Election Day: Nov 5, 2024</span>
                </p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm p-5 rounded-xl border border-gray-800 hover:bg-white/10 transition-all">
                <div className="flex items-center mb-3">
                  <FiCheckCircle className="text-blue-400 mr-2" size={20} />
                  <h4 className="font-semibold text-white">Voting Methods</h4>
                </div>
                <p className="text-gray-300">Secure online blockchain voting and traditional in-person voting stations</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 relative z-10">
              <div className="flex items-center mb-4">
                <FiInfo className="text-blue-400 mr-3" size={24} />
                <h3 className="text-2xl font-semibold text-white">Voting Process</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-4">
                    <span className="text-blue-300 font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-white">Identity Verification</h4>
                    <p className="text-gray-300">Secure facial recognition and national ID confirmation</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-4">
                    <span className="text-blue-300 font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-white">Cast Your Vote</h4>
                    <p className="text-gray-300">Select candidates in order of preference</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-4">
                    <span className="text-blue-300 font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-white">Blockchain Security</h4>
                    <p className="text-gray-300">Your vote is encrypted and permanently recorded</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-4">
                    <span className="text-blue-300 font-bold">4</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-white">Results</h4>
                    <p className="text-gray-300">Transparent and tamper-proof counting</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex items-center border-t border-gray-700 pt-5">
                <FiClock className="text-yellow-400 mr-3" size={20} />
                <p className="text-yellow-300">Polling hours: 7:00 AM - 6:00 PM on Election Day</p>
              </div>
            </div>
            
            <div className="absolute inset-0 bg-blue-500 rounded-2xl blur-3xl opacity-10 -z-10"></div>
            
            <div className="text-center mt-6">
              <button
                className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg transition-all"
                onClick={() => window.open("/voter-guide", "_blank")}
              >
                Download Voter Guide
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <div className="inline-flex items-center bg-white/5 px-5 py-3 rounded-full backdrop-blur-sm border border-gray-700">
            <FiMapPin className="text-blue-400 mr-2" />
            <span className="text-gray-300">Need help finding your voting station? Use our <a href="/locate" className="text-blue-400 hover:text-blue-300 underline">Polling Station Locator</a></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
