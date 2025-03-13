import { useRouter } from "next/router";
import { useState, useEffect , useRef} from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import Navbar from "./navbar";
import WebcamCapture from "@/components/WebcamCapture";
import { getSocket } from "../../components/SocketSingleton"; // Import the singleton socket instance
import { detectTimeSpentOnTask , detectInactivity } from "../../components/InteractionMonitor";
import GuideOverlay from "./GuideOverlay"; // Import GuideOverlay
import { motion } from "framer-motion"; // Import motion from framer-motion

// Function to play audio and prevent conflicts
const playAudio = (audioPath: string, audioInstance: HTMLAudioElement, onEnded: () => void) => {
  // If audio is already playing, stop it
  if (!audioInstance.paused) {
    audioInstance.pause();
    audioInstance.currentTime = 0; // Reset audio to the beginning
  }

  // Set the audio source and define the onended callback to chain the audio
  audioInstance.src = audioPath;
  audioInstance.play();
  audioInstance.onended = onEnded; // Call onEnded after audio finishes
};

const VoterAuthentication = () => {
  const router = useRouter();
  const { locale } = router;
  const { t } = useTranslation(); // Using the useTranslation hook

  const [isCameraActive, setCameraActive] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(false); // To manage loading state for camera
  const [audioInstance, setAudioInstance] = useState<HTMLAudioElement | null>(null);
  const [isSpeakerEnabled, setSpeakerEnabled] = useState<boolean>(false); // Default speaker state

  const startButtonRef = useRef<HTMLButtonElement>(null);
  const [buttonStyles, setButtonStyles] = useState({});
  const [showGuide, setShowGuide] = useState(false); // State to control guide visibility
  const [isMounted, setIsMounted] = useState(false); // State to check if component is mounted
  const [currentScreen, setCurrentScreen] = useState(2); // Set current screen for guide
  const [needHelpInactive, setneedHelpInactive] = useState(false); 

  // Create audio instance only on client-side
  useEffect(() => {
    if (typeof window !== "undefined") {
      const newAudioInstance = new Audio(); // Create new audio instance
      setAudioInstance(newAudioInstance); // Store it in state

      // Load speaker state from localStorage
      const savedSpeakerState = localStorage.getItem("isSpeakerEnabled");
      if (savedSpeakerState !== null) {
        setSpeakerEnabled(JSON.parse(savedSpeakerState));
      }
    }
  }, []); // Empty dependency array to run once on mount

  // Function to handle sequential audio playback
  const playSequentialAudio = (audioPaths: string[], onComplete: () => void) => {
    if (!audioInstance || !isSpeakerEnabled) return;

    let currentIndex = 0;

    const playNext = () => {
      if (currentIndex < audioPaths.length) {
        playAudio(audioPaths[currentIndex], audioInstance, playNext);
        currentIndex++;
      } else {
        onComplete(); // Once all audio is finished, call onComplete
      }
    };

    // Start the audio sequence
    playNext();
  };

  // Start Camera Simulation
  const startCamera = () => {
    setLoading(true); // Start loading animation
    setCameraActive(true);

    // Play audio for camera initialization and subsequent steps
    if (audioInstance) {
      let audioPaths: string[] = [];

      // Add audio paths based on language
      switch (locale) {
        case "si":
          audioPaths = [
            "/audio/auth_start_camera_si.mp3",
            "/audio/auth_success_si.mp3",
          ];
          break;
        case "ta":
          audioPaths = [
            "/audio/auth_start_camera_ta.mp3",
            "/audio/auth_success_ta.mp3",
          ];
          break;
        case "en":
        default:
          audioPaths = [
            "/audio/auth_start_camera_en.mp3",
            "/audio/auth_success_en.mp3",
          ];
          break;
      }

      // Play the audio sequence only if speaker is enabled
      if (isSpeakerEnabled) {
        playSequentialAudio(audioPaths, () => {
          // Redirect to the next page after the last audio finishes
          router.push("/polingbooth/CandidateSelection");
        });
      } else {
        // Directly navigate if speaker is disabled
        router.push("/polingbooth/CandidateSelection");
      }
    }
  };

  // Play the welcome message when the page loads
  useEffect(() => {
    if (audioInstance && isSpeakerEnabled) {
      let welcomeAudioPaths: string[] = [];

      // Add welcome message based on language
      switch (locale) {
        case "si":
          welcomeAudioPaths = ["/audio/auth_welcome_si.mp3"];
          break;
        case "ta":
          welcomeAudioPaths = ["/audio/auth_welcome_ta.mp3"];
          break;
        case "en":
        default:
          welcomeAudioPaths = ["/audio/auth_welcome_en.mp3"];
          break;
      }

      // Play the welcome message first
      playSequentialAudio(welcomeAudioPaths, () => {
        // Optionally, you can add any callback here after the welcome message finishes.
      });
    }
  }, [locale, audioInstance, isSpeakerEnabled]); // Depend on locale, audioInstance, and speaker state

  const toggleSpeaker = () => {
    setSpeakerEnabled((prev) => {
      const newState = !prev;

      // Save the speaker state to localStorage
      try {
        localStorage.setItem("isSpeakerEnabled", JSON.stringify(newState));
      } catch (error) {
        console.error("Error saving speaker state:", error);
      }

      return newState;
    });
  };

  // Function to handle button hover sound
  const playButtonHoverAudio = () => {
    if (audioInstance && isSpeakerEnabled) {
      let hoverAudioPaths: string[] = [];

      // Add hover audio path based on language
      switch (locale) {
        case "si":
          hoverAudioPaths = ["/audio/auth_hover_start_si.mp3"];
          break;
        case "ta":
          hoverAudioPaths = ["/audio/auth_hover_start_ta.mp3"];
          break;
        case "en":
        default:
          hoverAudioPaths = ["/audio/auth_hover_start_en.mp3"];
          break;
      }

      // Play the hover sound
      playSequentialAudio(hoverAudioPaths, () => {});
    }
  };

  useEffect(() => {
    setIsMounted(true);
      const socket = getSocket(); // Use the singleton socket instance
  
      socket.on('connect', () => {});
  
      socket.on('help_response', (response : any) => {
        if (response.highlightButton) {
          setButtonStyles(response.buttonStyles || {}); // Update button styles
        }
        if (response.startGuide) {
          setneedHelpInactive(true); // Show "Need Help?" text
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


      if (startButtonRef.current) {
        detectTimeSpentOnTask(startButtonRef, 5000, (data : any) => {}, "start");
      }

    }, []);
  
    const handleGuideComplete = () => {
      setShowGuide(false);
      setneedHelpInactive(false);
    };
  
    const startGuide = () => {
      setShowGuide(true); // Trigger guide display when the user clicks the "Need Help?" button
      setneedHelpInactive(false);
    };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#F1F1F1] to-[#B0D0E6]">
      <Navbar />

      <WebcamCapture />

      <main className="flex flex-col items-center justify-center flex-grow px-6 py-12">
        <h2 className="text-center text-[#003366] text-5xl font-semibold mb-6">
          {t("authInstruction")}
        </h2>

        <div className="relative w-[80vw] h-[80vw] max-w-[500px] max-h-[500px] bg-[#e0e0e0] rounded-full mb-6 flex justify-center items-center border-4 border-[#003366] camera-space">
          {isLoading ? (
            <div className="text-center text-2xl text-[#003366]">Initializing Camera...</div>
          ) : (
            <div className="text-center text-xl text-[#003366]">
              <span>Place your face inside the circle</span>
            </div>
          )}
        </div>

        <button
           ref={startButtonRef}
          onClick={startCamera}
          className={`w-80 ${isLoading ? 'bg-gray-400' : 'bg-[#006400]'} text-white py-6 rounded-full shadow-lg text-2xl font-bold start-button`}
          disabled={isLoading}
          onMouseEnter={playButtonHoverAudio} // Play hover audio on button hover
        >
          {isLoading ? "Please Wait..." : t("startButton")}
        </button>

        {/* Speaker Toggle Button */}
        <div
  onClick={toggleSpeaker}
  className="fixed bottom-40 right-14 w-24 h-24 border-4   rounded-full flex items-center justify-center cursor-pointer hover:shadow-xl bg-transparent volume-control"
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

// Preload translations for the page
export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ["common"])),
  },
});

export default VoterAuthentication;
