import { useRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import Navbar from "./navbar";
import { useRef, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useSession } from "next-auth/react";
import { getSocket } from "../../components/SocketSingleton"; // Import the singleton socket instance
import { detectTimeSpentOnTask , detectInactivity , trackNavigation } from "../../components/InteractionMonitor"; // Import the interaction monitor
import GuideOverlay from "./GuideOverlay"; // Import GuideOverlay component
import { motion } from "framer-motion"; // Import framer-motion for animations
import { useHelp } from "../../context/HelpContext"; // Import useHelp hook

// Fetch candidates from API
const fetchCandidates = async () => {
  const response = await fetch("/api/Candidates/getCandidates");
  const data = await response.json();
  return data.candidates;
};

// Fetch parties from API
const fetchParties = async () => {
  const response = await fetch("/api/Parties/getParties");
  const data = await response.json();
  return data.parties;
};

const ConfirmVote = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isSpeakerEnabled, setSpeakerEnabled] = useState<boolean>(false);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [parties, setParties] = useState<any[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [realTimeCandidates, setRealTimeCandidates] = useState<any[]>([]);
  const { data: session } = useSession();
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const backButtonRef = useRef<HTMLButtonElement>(null);
  const [buttonStyles, setButtonStyles] = useState({});
  const [showGuide, setShowGuide] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [currentScreen, setCurrentScreen] = useState(4); // Set the current screen number for guidance
  const { showHelpButton, setShowHelpButton } = useHelp(); // Use useHelp hook
  const [needHelpInactive, setneedHelpInactive] = useState(false); 

  const { candidates: selectedCandidateIds } = router.query;
  const selectedCandidates = selectedCandidateIds
    ? JSON.parse(selectedCandidateIds as string)
    : [];
  const displayedCandidates = selectedCandidates.map((id: string) =>
    candidates.find((candidate) => candidate._id === id)
  ).filter(Boolean);

  // Fetch candidates and parties data on component mount
  useEffect(() => {
    const fetchData = async () => {
      const candidatesData = await fetchCandidates();
      setCandidates(candidatesData);

      const partiesData = await fetchParties();
      setParties(partiesData);
    };
    fetchData();
  }, []);

  // Create the audio element once and reuse it
  useEffect(() => {
    audioRef.current = new Audio();
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, []);

  const playAudio = (action: string, onEndCallback?: () => void) => {
    if (!isSpeakerEnabled || !audioRef.current) return; // Respect speaker state

    audioRef.current.src = `/audio/${action}_${router.locale}.mp3`;
    audioRef.current.currentTime = 0;

    if (onEndCallback) {
      audioRef.current.onended = onEndCallback;
    } else {
      audioRef.current.onended = null;
    }

    audioRef.current.play().catch((err) =>
      console.error("Audio playback failed:", err)
    );
  };

  const toggleSpeaker = () => {
    setSpeakerEnabled((prev) => {
      const newState = !prev;
  
      if (!newState && audioRef.current) {
        // Pause and reset the audio if the speaker is toggled off
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
  
      localStorage.setItem("isSpeakerEnabled", JSON.stringify(newState));
      return newState;
    });
  };

  const handleBack = () => {
    if (isSpeakerEnabled) {
      playAudio("backHover");
      router.push("/polingbooth/CandidateSelection");
      trackNavigation("CandidateSelection");
    }else{
      router.push("/polingbooth/CandidateSelection");
      trackNavigation("CandidateSelection");
    }
    
  };

  const handleConfirm = async () => {
    try {
      // Combine selectedCandidates and realTimeCandidates
      const allCandidates = [...selectedCandidates, ...realTimeCandidates.map(candidate => candidate._id)];
  
      // Create the 'votes' array with candidate IDs and priority (index + 1)
      const votes = allCandidates.map((candidate, index) => ({
        candidate_id: candidate, // This is just the candidate's ID (you might need to replace this with the candidate object if you need more details)
        priority: index + 1, // Assign priority based on selection order
      }));
  
      // Check if votes array is not empty
      if (votes.length === 0) {
        throw new Error("'votes' must be a non-empty list");
      }
  
      // Log the selected candidates with priority
      console.log("Selected Candidates with Priority: ", votes);
  
      const poll_manager_id = session?.user?._id; // Ensure this is properly set
  
      // Log the selected candidates with priority and polling manager ID
      console.log("Polling Manager ID: ", poll_manager_id);
  
      const response = await fetch("http://127.0.0.1:5000/api/vote/encrypt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          votes, // Send votes array
          poll_manager_id, // Send polling manager ID separately
        }),
      });
  
      if (response.ok) {
        router.push("/polingbooth/Thankyou"); // Redirect after successful encryption
      } else {
        const errorText = await response.text();
        console.error("Error encrypting votes:", errorText);
        alert(`Error encrypting votes: ${errorText}`);
      }
    } catch (error) {
      console.error("Error sending votes:", error);
      if (error instanceof Error) {
        alert(`Error sending votes: ${error.message}`);
      } else {
        alert('An unknown error occurred');
      }
    }
  };
  

  const handleHoverButton = (buttonAction: string) => {
    playAudio(buttonAction);
  };

  useEffect(() => {
    const storedSpeakerState = localStorage.getItem("isSpeakerEnabled");
    if (storedSpeakerState) {
      setSpeakerEnabled(JSON.parse(storedSpeakerState));
    }
  }, []);

  // Play "confirm_message" only if the speaker is enabled
  useEffect(() => {
    if (isSpeakerEnabled) {
      playAudio("confirm_message");
    } else if (audioRef.current) {
      // Stop any ongoing playback if speaker is disabled
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [isSpeakerEnabled, router.locale]);
  
  // Get party logo by party ID
  const getPartyLogo = (partyId: string) => {
    const party = parties.find((p) => p._id === partyId);
    return party ? party.logo : "";
  };

  useEffect(() => {
    if (selectedCandidates.length > 0) {
      const candidate = candidates.find((candidate) => candidate._id === selectedCandidates[0]);
      setSelectedCandidate(candidate);
    }
  }, [candidates, selectedCandidates]);

  useEffect(() => {
    const socket = io("http://localhost:5000"); // Connect to the WebSocket server

    socket.on("prediction", (data) => {
      console.log("Received prediction:", data);
      const candidate = candidates.find((candidate) => candidate._id === data.condidateId);
      if (candidate) {
        setRealTimeCandidates((prev) => [...prev, candidate]);
        console.log("Updated realTimeCandidates:", [...realTimeCandidates, candidate]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [candidates]);

  useEffect(() => {
    setIsMounted(true);
    const socket = getSocket(); // Use the singleton socket instance

    socket.on('connect', () => {});

    socket.on('help_response', (response : any) => {
      console.log("Received help_response:", response); // Add this line for debugging
      if (response.highlightButton) {
        setButtonStyles(response.buttonStyles || {}); // Update button styles
      }
      if (response.startGuide) {
        console.log("Setting showHelpButton to true"); // Add this line for debugging
        setneedHelpInactive(true); // Show "Need Help?" text
      }
      if (response.startGuide && response.navigation) {
        console.log("Setting showHelpButton to true"); 
        setShowHelpButton(true); 
      }
    });

    socket.on('disconnect', () => {});

    return () => {
      socket.off('help_response'); // Clean up the event listener
    };
  }, []);

  useEffect(() => {
    detectInactivity(10000, () => {
      console.log("User is inactive")
    });  

    if (confirmButtonRef.current) {
      detectTimeSpentOnTask(confirmButtonRef, 5000, (data : any) => {}, "confirm");
    }
    if (backButtonRef.current) {
      detectTimeSpentOnTask(backButtonRef, 5000, (data : any) => {}, "back");
    }
  }, []);

  useEffect(() => {
    console.log("showHelpButton state updated:", showHelpButton); // Add this line for debugging
  }, [showHelpButton]);

  const handleGuideComplete = () => {
    setShowGuide(false);
     // Hide the text after the guide is completed

    setneedHelpInactive(false);
  };

  const startGuide = () => {
    setShowGuide(true); // Trigger guide display when the user clicks the "Need Help?" button
     // Hide the text when the guide starts

    setneedHelpInactive(false);//this is for guidance
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#F1F1F1] to-[#B0D0E6]">
      <Navbar />

      <main className="flex flex-col items-center justify-center flex-grow px-0">
        <div className="w-full max-w-full overflow-x-auto bg-gradient-to-b from-[#F1F1F1] to-[#B0D0E6] border-4 border-gray-300 shadow-lg rounded-lg">
          <table className="table-auto w-full border-collapse text-left text-lg">
            <thead className="bg-[#003366] text-white font-semibold text-xl">
              <tr>
                <th className="px-8 py-6 border">{}</th>
                <th className="px-8 py-6 border">{t("candidateName")}</th>
                <th className="px-8 py-6 border">{t("partyName")}</th>
                <th className="px-8 py-6 border text-center">{t("candidateNo")}</th>
                <th className="px-8 py-6 border">{t("symbol")}</th>
              </tr>
            </thead>
            <tbody>
              {displayedCandidates.map((candidate:any) => (
                <tr key={candidate._id} className="hover:bg-gray-100 bg-white">
                  <td className="px-8 py-6 border text-center">
                    <img src={candidate.image} alt={candidate.name} className="w-20 h-20 object-cover rounded-full mx-auto" />
                  </td>
                  <td className="px-8 py-6 border">
                    <div className="text-2xl font-bold">{candidate.name}</div>
                  </td>
                  <td className="px-8 py-6 border text-2xl font-bold">
                    {parties.find((party) => party._id === candidate.party)?.short_name || candidate.party}
                  </td>
                  <td className="px-8 py-6 border text-center text-5xl">{candidate.no}</td>
                  <td className="px-8 py-6 border text-center">
                    <img src={getPartyLogo(candidate.party)} alt={candidate.party} className="w-20 h-20 object-cover rounded-full mx-auto" />
                  </td>
                </tr>
              ))}
              {realTimeCandidates.map((candidate) => (
                <tr key={candidate._id} className="hover:bg-gray-100 bg-white">
                  <td className="px-8 py-6 border text-center">
                    <img src={candidate.image} alt={candidate.name} className="w-20 h-20 object-cover rounded-full mx-auto" />
                  </td>
                  <td className="px-8 py-6 border">
                    <div className="text-2xl font-bold">{candidate.name}</div>
                  </td>
                  <td className="px-8 py-6 border text-2xl font-bold">
                    {parties.find((party) => party._id === candidate.party)?.short_name || candidate.party}
                  </td>
                  <td className="px-8 py-6 border text-center text-5xl">{candidate.no}</td>
                  <td className="px-8 py-6 border text-center">
                    <img src={getPartyLogo(candidate.party)} alt={candidate.party} className="w-20 h-20 object-cover rounded-full mx-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-[60px] flex gap-[110px]">
          <button
            ref={backButtonRef}
            onClick={handleBack}
            onMouseEnter={() => handleHoverButton("backHover")}
            className={`w-80 bg-[#800000] text-white py-6 rounded-full shadow-lg text-2xl font-bold transition-transform duration-300 back`}
          >
            {t("backButton")}
          </button>
          <button
            ref={confirmButtonRef}
            onClick={handleConfirm}
            onMouseEnter={() => handleHoverButton("confirmHover")}
            className={`w-80 bg-[#006400] text-white py-6 rounded-full shadow-lg text-2xl font-bold transition-transform duration-300 confirm`}
          >
            {t("confirmButton")}
          </button>
        </div>

        <div
          onClick={toggleSpeaker}
          className="fixed bottom-40 right-14 w-24 h-24 border-4 rounded-full flex items-center justify-center cursor-pointer hover:shadow-xl bg-transparent volume-control"
          title={isSpeakerEnabled ? "Disable Audio" : "Enable Audio"}
        >
          <img
            src={isSpeakerEnabled ? "/assets/images/volume.png" : "/assets/images/mute.png"}
            alt={isSpeakerEnabled ? "Speaker On" : "Speaker Off"}
            className="w-20 h-20"
          />
        </div>

        {/* Always show robot icon, but only show the text when startGuide is true */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="fixed bottom-12 right-14 flex items-center space-x-4 cursor-pointer"
          onClick={startGuide}
        >
          {needHelpInactive && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white text-gray-700 px-10 py-6 rounded-lg shadow-lg text-xl font-semibold"
            >
              Need help? Click me!
            </motion.div>
          )}
          
          <motion.div
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            className="w-24 h-24 bg-blue-600 text-white flex items-center justify-center rounded-full shadow-lg"
          >
            🤖
          </motion.div>
        </motion.div>

        {/* Only render GuideOverlay when mounted */}
        {isMounted && <GuideOverlay isActive={showGuide} onComplete={handleGuideComplete} currentScreen={currentScreen} />}
      </main>
    </div>
  );
};

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ["common"])),
  },
});

export default ConfirmVote;