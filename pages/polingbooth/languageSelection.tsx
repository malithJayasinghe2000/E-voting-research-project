import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useEffect, useState , useRef } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Navbar from "./navbar";
import { getSocket } from "../../components/SocketSingleton"; // Import the singleton socket instance
import { detectTimeSpentOnTask, detectInactivity } from "../../components/InteractionMonitor"
import GuideOverlay from "./GuideOverlay"  
import { motion } from "framer-motion"  

// Audio utility for controlling playback
let currentAudio: HTMLAudioElement | null = null;

const playAudio = (audioFile: string, onEnded: () => void, isSpeakerEnabled: boolean) => {
  // If speaker is disabled, stop current audio immediately
  if (!isSpeakerEnabled) {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null; // Clear the current audio reference
    }
    return; // Prevent further audio playback
  }

  // Stop any ongoing audio playback
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  // Play new audio
  currentAudio = new Audio(audioFile);
  currentAudio.play();
  currentAudio.onended = onEnded;
};

const LanguageSelection = () => {
  const router = useRouter();
  const { i18n } = useTranslation();
  const [audioPlayed, setAudioPlayed] = useState(false);
  const [isSpeakerEnabled, setSpeakerEnabled] = useState(false); // Speaker is initially off
  const sinhalaButtonRef = useRef<HTMLButtonElement>(null);
  const tamilButtonRef = useRef<HTMLButtonElement>(null);
  const englishButtonRef = useRef<HTMLButtonElement>(null);
  const [buttonStyles, setButtonStyles] = useState({});
  const [showGuide, setShowGuide] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [showHelpButton, setShowHelpButton] = useState(false)  // To control visibility of "Need Help?" text
  const [currentScreen, setCurrentScreen] = useState(1)
  const [needHelpInactive, setneedHelpInactive] = useState(false); 

  // Save speaker state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("isSpeakerEnabled", JSON.stringify(isSpeakerEnabled));
      console.log("Speaker state saved to localStorage:", isSpeakerEnabled); // Log the saved value
    } catch (error) {
      console.error("Error saving speaker state to localStorage:", error);
    }
  }, [isSpeakerEnabled]);

  // Stop audio when navigating away from this page
  useEffect(() => {
    const handleRouteChange = () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
      }
    };

    router.events.on("routeChangeStart", handleRouteChange);

    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [router.events]);

  // Play welcome audio on page load (only if speaker is enabled)
  useEffect(() => {
    if (!audioPlayed && isSpeakerEnabled) {
      playAudio(
        "/audio/welcome_en.mp3",
        () => {
          playAudio(
            "/audio/welcome_si.mp3",
            () => {
              playAudio("/audio/welcome_ta.mp3", () => {
                setAudioPlayed(true);
              }, isSpeakerEnabled);
            },
            isSpeakerEnabled
          );
        },
        isSpeakerEnabled
      );
    }
  }, [audioPlayed, isSpeakerEnabled]);

  const handleLanguageChange = (locale: string) => {
    let audioFile = "";
    switch (locale) {
      case "si":
        audioFile = "/audio/selected_si.mp3";
        break;
      case "ta":
        audioFile = "/audio/selected_ta.mp3";
        break;
      case "en":
      default:
        audioFile = "/audio/selected_en.mp3";
        break;
    }

    // If speaker is enabled, play the audio first, then navigate
    if (isSpeakerEnabled) {
      playAudio(audioFile, () => {
        i18n.changeLanguage(locale).then(() => {
          router.push("/polingbooth/voterAuthentication", undefined, { locale });
        });
      }, isSpeakerEnabled);
    } else {
      // If speaker is disabled, skip audio and navigate directly
      i18n.changeLanguage(locale).then(() => {
        router.push("/polingbooth/voterAuthentication", undefined, { locale });
      });
    }
  };

  const handleHoverAudio = (locale: string) => {
    let audioFile = "";
    switch (locale) {
      case "si":
        audioFile = "/audio/button_si.mp3";
        break;
      case "ta":
        audioFile = "/audio/button_ta.mp3";
        break;
      case "en":
      default:
        audioFile = "/audio/button_en.mp3";
        break;
    }
    playAudio(audioFile, () => {}, isSpeakerEnabled);
  };

  const toggleSpeaker = () => {
    setSpeakerEnabled((prev) => {
      const newState = !prev;

      // Stop the audio if the speaker is turned off
      if (!newState && currentAudio) {
        currentAudio.pause();
        currentAudio = null;
      }

      return newState;
    });
  };

  useEffect(() => {
      setIsMounted(true)
      const socket = getSocket(); // Use the singleton socket instance
  
      socket.on('connect', () => {});
  
      socket.on('help_response', (response : any) => {
        console.log('Received response:', response); // Log the response
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

      if (sinhalaButtonRef.current) {
        detectTimeSpentOnTask(sinhalaButtonRef, 5000, (data : any) => {}, "sinhala");
      }
      if (tamilButtonRef.current) {
        detectTimeSpentOnTask(tamilButtonRef, 5000, (data : any) => {}, "tamil");
      }
      if (englishButtonRef.current) {
        detectTimeSpentOnTask(englishButtonRef, 5000, (data : any) => {}, "english");
      }
    }, []);

    const handleGuideComplete = () => {
      setShowGuide(false)
      setShowHelpButton(false)  // Hide the text after the guide is completed

      setneedHelpInactive(false);
    }
  
    const startGuide = () => {
      setShowGuide(true)  // Trigger guide display when the user clicks the "Need Help?" button
      setShowHelpButton(false)  // Hide the text when the guide starts

      setneedHelpInactive(false);
    }
  

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#F1F1F1] to-[#B0D0E6]">
      <Navbar />

      <main className="flex flex-col items-center justify-center flex-grow px-6">
        <h2 className="text-center my-12 text-[#003366]">
          <div className="text-5xl font-semibold mb-6">
            <span>Please select the language</span>
          </div>
          <div className="text-5xl font-semibold mb-6">
            <span>ඔබට අවශ්‍ය භාෂාව තෝරන්න</span>
          </div>
          <div className="text-5xl font-semibold mb-6">
            <span>தயவுசெய்து மொழியைத் தேர்வு  செய்யுங்கள்</span>
          </div>
        </h2>

        <div className="space-y-6 space-x-[100px]">
          <button
          ref={sinhalaButtonRef}
            onClick={() => handleLanguageChange("si")}
            onMouseEnter={() => handleHoverAudio("si")}
            className="w-80 bg-[#800000] text-white py-6 rounded-full shadow-lg text-2xl font-bold sinhala-button"
          >
            සිංහල
          </button>
          <button
          ref={tamilButtonRef}
            onClick={() => handleLanguageChange("ta")}
            onMouseEnter={() => handleHoverAudio("ta")}
            className="w-80 bg-[#006400] text-white py-6 rounded-full shadow-lg text-2xl font-bold tamil-button"
          >
            தமிழ்
          </button>
          <button
          ref={englishButtonRef}
            onClick={() => handleLanguageChange("en")}
            onMouseEnter={() => handleHoverAudio("en")}
            className="w-80 bg-[#003366] text-white py-6 rounded-full shadow-lg text-2xl font-bold english-button"
          >
            English
          </button>
        </div>
      </main>

      <div
  onClick={toggleSpeaker}
  className="fixed bottom-40 right-14 w-24 h-24 border-4   rounded-full flex items-center justify-center cursor-pointer hover:shadow-xl bg-transparent volume-control" // Added class name
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
    


    </div>
  );
};

// Preload translations for the page
export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ["common"])),
  },
});

export default LanguageSelection;
