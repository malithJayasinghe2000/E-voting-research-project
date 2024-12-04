import React from "react";

const About = () => {
  return (
    <div className="flex flex-col justify-center items-left min-h-screen bg-gray-900 ml-10 rounded-t-[24px] bg-opacity-40 ">
      <div className="ml-10 mr-10">
        <h1 className="text-[70px]  mb-4">About the Presidential Election</h1>
        <p className="text-lg mb-4">
          The Presidential Election 2024 is set to be one of the most pivotal moments in
          the nation’s history. With candidates from across the political spectrum,
          the election aims to reflect the voice of the people and shape the country's
          future.

        </p>
        <p className="text-lg mb-4">
        The election features a wide spectrum of candidates, representing various ideologies and 
        political visions, ensuring robust debates on economic policies,
         climate change, healthcare, and international relations. 
         This year also marks a technological milestone with the integration of online 
         voting systems alongside traditional in-person ballots,
         aimed at enhancing accessibility for millions of voters.
        </p>
        <div className="space-y-2 text-lg">
          <h3 className="font-semibold">Key Details:</h3>
          <ul className="list-disc list-inside">
            <li>Election Date: November 5, 2024</li>
            <li>Eligible Voters: 20,000,000+</li>
            <li>Major Parties: NPP, SJB, SLPP</li>
            <li>Voting Method: Online and In-person</li>
          </ul>
        </div>
        <div className="mt-4 text-center">
          <button
            className="px-4 py-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-all"
            onClick={() => alert("Learn More button clicked!")}
          >
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
};

export default About;
