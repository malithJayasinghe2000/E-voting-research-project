import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import Navbar from "./navbar";
import AutomaticWebcamCapture from "@/components/AutomaticWebcamCapture";
import { FiCheckCircle, FiX, FiAlertCircle, FiUser, FiVideo, FiVolume2, FiVolumeX } from "react-icons/fi";

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

  // State management
  const [currentStep, setCurrentStep] = useState<"initial" | "mask-detection" | "face-recognition">("initial");
  const [isCameraActive, setCameraActive] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [audioInstance, setAudioInstance] = useState<HTMLAudioElement | null>(null);
  const [isSpeakerEnabled, setSpeakerEnabled] = useState<boolean>(false);
  const [maskDetected, setMaskDetected] = useState<boolean | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");

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

  // WebSocket for mask detection
  useEffect(() => {
    if (currentStep !== "mask-detection") return;
    
    setStatusMessage("Please wait while we check for face mask...");
    
    const websocket = new WebSocket("ws://127.0.0.1:8000/ws/detect");
  
    websocket.onopen = () => {
      console.log("WebSocket Connected!");
      setStatusMessage("Scanning for face mask...");
    };
  
    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Mask Detection Response:", data);
  
        if (data.error) {
          console.error("Mask Detection Error:", data.error);
          setStatusMessage("Error detecting mask. Please try again.");
          return;
        }
  
        if (data.mask_detected === null) {
          setMaskDetected(null);
          setStatusMessage("Please remove your mask for verification");
        } else if (data.mask_detected) {
          setMaskDetected(true);
          setStatusMessage("Please remove your mask for verification");
          
          if (audioInstance && isSpeakerEnabled) {
            const audioPath = locale === "si" ? "/audio/remove_mask_si.mp3" : 
                           locale === "ta" ? "/audio/remove_mask_ta.mp3" : 
                           "/audio/remove_mask_en.mp3";
            audioInstance.src = audioPath;
            audioInstance.play();
          }
        } else {
          setMaskDetected(false);
          setStatusMessage("No mask detected. Proceeding to face recognition...");
          websocket.close();
          
          // Automatically proceed to face recognition step after a short delay
          setTimeout(() => {
            setCurrentStep("face-recognition");
          }, 1500);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };
  
    websocket.onerror = (error) => {
      console.error("WebSocket Error:", error);
      setStatusMessage("Connection error. Please try again.");
    };
  
    websocket.onclose = () => {
      console.log("WebSocket Disconnected.");
    };
  
    setWs(websocket);
    
    return () => {
      websocket.close();
      setWs(null);
    };
  }, [currentStep, locale, audioInstance, isSpeakerEnabled]);

  // Function to handle sequential audio playback
  const playSequentialAudio = (audioPaths: string[], onComplete: () => void) => {
    if (!audioInstance || !isSpeakerEnabled) {
      onComplete();
      return;
    }

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

  // Start authentication flow automatically after a short delay when page loads
  useEffect(() => {
    if (currentStep === "initial") {
      // Automatically start the authentication process after the welcome audio or 2 seconds
      const timer = setTimeout(() => startAuthentication(), 2000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, isSpeakerEnabled]);

  // Start Camera Simulation
  const startAuthentication = () => {
    setLoading(true);
    setCameraActive(true);
    setStatusMessage("Starting authentication process...");

    // Play audio for camera initialization
    if (audioInstance && isSpeakerEnabled) {
      let audioPaths: string[] = [];

      // Add audio paths based on language
      switch (locale) {
        case "si":
          audioPaths = ["/audio/auth_start_camera_si.mp3"];
          break;
        case "ta":
          audioPaths = ["/audio/auth_start_camera_ta.mp3"];
          break;
        case "en":
        default:
          audioPaths = ["/audio/auth_start_camera_en.mp3"];
          break;
      }

      // Play the audio sequence
      playSequentialAudio(audioPaths, () => {
        setLoading(false);
        setCurrentStep("mask-detection");
      });
    } else {
      setLoading(false);
      setCurrentStep("mask-detection");
    }
  };

  // Play welcome message when the page loads
  useEffect(() => {
    if (audioInstance && isSpeakerEnabled && currentStep === "initial") {
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

      // Play the welcome message
      playSequentialAudio(welcomeAudioPaths, () => {});
    }
  }, [locale, audioInstance, isSpeakerEnabled, currentStep]);

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

  // Handle successful authentication
  const handleSuccessfulAuth = () => {
    if (audioInstance && isSpeakerEnabled) {
      let successAudioPaths: string[] = [];
      
      switch (locale) {
        case "si":
          successAudioPaths = ["/audio/auth_success_si.mp3"];
          break;
        case "ta":
          successAudioPaths = ["/audio/auth_success_ta.mp3"];
          break;
        case "en":
        default:
          successAudioPaths = ["/audio/auth_success_en.mp3"];
          break;
      }
      
      playSequentialAudio(successAudioPaths, () => {
        router.push("/polingbooth/CandidateSelection");
      });
    } else {
      router.push("/polingbooth/CandidateSelection");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#F1F1F1] to-[#B0D0E6]">
      <Navbar />
      
      <main className="flex flex-col items-center justify-center flex-grow px-6 py-12">
        <div className="w-full max-w-4xl bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="bg-[#003366] text-white p-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center">
              <FiUser className="mr-3" size={24} /> 
              {t("Voter Authentication")}
            </h2>
            <div 
              className="cursor-pointer hover:bg-[#004080] p-2 rounded-full transition-colors"
              onClick={toggleSpeaker}
              title={isSpeakerEnabled ? "Disable Audio" : "Enable Audio"}
            >
              {isSpeakerEnabled ? (
                <FiVolume2 size={24} />
              ) : (
                <FiVolumeX size={24} />
              )}
            </div>
          </div>
          
          <div className="p-8">
            {/* Progress Indicator */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center w-full max-w-lg">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === "initial" ? "bg-blue-500 text-white" : "bg-green-500 text-white"
                }`}>
                  1
                </div>
                <div className={`h-1 flex-1 ${
                  currentStep === "initial" ? "bg-gray-300" : "bg-green-500"
                }`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === "mask-detection" ? "bg-blue-500 text-white" : 
                  currentStep === "face-recognition" ? "bg-green-500 text-white" : 
                  "bg-gray-300 text-gray-700"
                }`}>
                  2
                </div>
                <div className={`h-1 flex-1 ${
                  currentStep === "face-recognition" ? "bg-green-500" : "bg-gray-300"
                }`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === "face-recognition" ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-700"
                }`}>
                  3
                </div>
              </div>
            </div>
            
            {/* Step Labels */}
            <div className="flex justify-center mb-8">
              <div className="grid grid-cols-3 w-full max-w-lg text-center text-sm">
                <div className={`${currentStep === "initial" ? "text-blue-500 font-bold" : "text-gray-700"}`}>
                  {t("Start")}
                </div>
                <div className={`${currentStep === "mask-detection" ? "text-blue-500 font-bold" : "text-gray-700"}`}>
                  {t("Mask Check")}
                </div>
                <div className={`${currentStep === "face-recognition" ? "text-blue-500 font-bold" : "text-gray-700"}`}>
                  {t("Face Recognition")}
                </div>
              </div>
            </div>
            
            {/* Status Message */}
            <div className="text-center mb-6">
              <p className={`text-lg ${
                maskDetected === true ? "text-red-600 font-bold" :
                maskDetected === false ? "text-green-600 font-bold" :
                "text-gray-700"
              }`}>
                {statusMessage || t("Please wait, starting authentication...")}
              </p>
            </div>
            
            {/* Main Content Area */}
            <div className="flex flex-col items-center justify-center">
              {currentStep === "initial" && (
                <div className="flex flex-col items-center">
                  <div className="w-64 h-64 bg-gray-100 rounded-full mb-8 flex items-center justify-center animate-pulse">
                    <FiVideo size={64} className="text-gray-400" />
                  </div>
                  
                  <div className="text-center text-gray-600">
                    <p>Authentication will start...</p>
                    <div className="mt-4 flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  </div>
                </div>
              )}
              
              {currentStep === "mask-detection" && (
                <div className="relative flex flex-col items-center">
                  <div className="relative w-80 h-80 md:w-96 md:h-96">
                    <div className="absolute inset-0 rounded-full border-4 border-dashed border-blue-500 animate-pulse"></div>
                    <div className="absolute inset-4 rounded-full border-4 border-[#003366]"></div>
                    
                    {maskDetected === true && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-red-100 p-4 rounded-lg shadow-lg text-center">
                          <FiX className="mx-auto mb-2 text-red-500" size={40} />
                          <p className="text-red-700 font-bold">{t("Mask Detected")}</p>
                          <p className="text-red-600">{t("Please remove your mask")}</p>
                        </div>
                      </div>
                    )}
                    
                    {maskDetected === false && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-green-100 p-4 rounded-lg shadow-lg text-center">
                          <FiCheckCircle className="mx-auto mb-2 text-green-500" size={40} />
                          <p className="text-green-700 font-bold">{t("No Mask Detected")}</p>
                          <p className="text-green-600">{t("Proceeding to face recognition...")}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 flex items-center justify-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-ping"></div>
                    <p className="text-gray-700">{t("Camera Active")}</p>
                  </div>
                </div>
              )}
              
              {currentStep === "face-recognition" && (
                <div className="w-full max-w-lg">
                  <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 mb-4">
                    <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                      <FiAlertCircle className="mr-2 text-blue-500" />
                      {t("Face Recognition")}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {t("Please look directly at the camera for verification")}
                    </p>
                  </div>
                  
                  <div className="bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden">
                    <AutomaticWebcamCapture onSuccess={handleSuccessfulAuth} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
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
