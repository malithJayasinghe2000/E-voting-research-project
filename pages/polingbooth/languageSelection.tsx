import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useEffect, useState , useRef } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Navbar from "./navbar";
import { getSocket } from "../../components/SocketSingleton"; // Import the singleton socket instance
import { detectTimeSpentOnTask } from "../../components/InteractionMonitor";

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
      const socket = getSocket(); // Use the singleton socket instance
  
      socket.on('connect', () => {});
  
      socket.on('help_response', (response : any) => {
        if (response.highlightButton) {
          setButtonStyles(response.buttonStyles || {}); // Update button styles
        }
      });
  
      socket.on('disconnect', () => {});
  
      return () => {
        socket.off('help_response'); // Clean up the event listener
      };
    }, []);
  
    useEffect(() => {
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
            className="w-80 bg-[#800000] text-white py-6 rounded-full shadow-lg text-2xl font-bold "
          >
            සිංහල
          </button>
          <button
          ref={tamilButtonRef}
            onClick={() => handleLanguageChange("ta")}
            onMouseEnter={() => handleHoverAudio("ta")}
            className="w-80 bg-[#006400] text-white py-6 rounded-full shadow-lg text-2xl font-bold "
          >
            தமிழ்
          </button>
          <button
          ref={englishButtonRef}
            onClick={() => handleLanguageChange("en")}
            onMouseEnter={() => handleHoverAudio("en")}
            className="w-80 bg-[#003366] text-white py-6 rounded-full shadow-lg text-2xl font-bold "
          >
            English
          </button>
        </div>
      </main>

      <div
  onClick={toggleSpeaker}
  className="fixed bottom-20 right-14 w-24 h-24 border-4   rounded-full flex items-center justify-center cursor-pointer hover:shadow-xl bg-transparent"
  title={isSpeakerEnabled ? "Disable Audio" : "Enable Audio"}
>
  <img
    src={isSpeakerEnabled ? "/assets/images/volume.png" : "/assets/images/mute.png"}
    alt={isSpeakerEnabled ? "Speaker On" : "Speaker Off"}
    className="w-20 h-20"
  />
</div>

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
