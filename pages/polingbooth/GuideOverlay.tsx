"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Joyride, { type CallBackProps, STATUS, type Step } from "react-joyride"
import { FaArrowRight, FaArrowLeft, FaTimes } from "react-icons/fa"; // Import icons

// Interface for the GuideOverlay component
interface GuideOverlayProps {
  isActive: boolean
  onComplete: () => void
  currentScreen: number // To track which screen the user is on
}

const GuideOverlay: React.FC<GuideOverlayProps> = ({ isActive, onComplete, currentScreen }) => {
  const [run, setRun] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    setRun(isActive)
  }, [isActive])

  // Define the steps for each screen
  const stepsForScreen: { [key: number]: Step[] } = {
    1: [
      {
        target: "body",
        content: "Welcome! Let me help you select a language for your experience.",
        placement: "center",
        disableBeacon: true,
      },
      {
        target: ".sinhala-button",
        content: "Click here to select Sinhala (සිංහල) as your preferred language.",
        placement: "bottom",
      },
      {
        target: ".tamil-button",
        content: "Click here to select Tamil (தமிழ்) as your preferred language.",
        placement: "bottom",
      },
      {
        target: ".english-button",
        content: "Click here to select English as your preferred language.",
        placement: "bottom",
      },
    ],
    2: [
      {
        target: ".camera-space2",
        content: "Place your face inside the circle to start the authentication process.",
        placement: "bottom",
      },
      {
        target: ".camera-space",
        content: "Place your face inside the circle to start the authentication process.",
        placement: "bottom",
      },
      {
        target: ".mask-detection",
        content: "We are checking if you are wearing a mask. Please remove it if you are.",
        placement: "bottom",
      },
      {
        target: ".face-recognition",
        content: "Now we will verify your face. Please look directly at the camera.",
        placement: "bottom",
      },
      {
        target: ".progress-indicator",
        content: "This section shows your progress through the authentication steps.",
        placement: "top",
      },
      {
        target: ".circle-indicator",
        content: "This circle indicates the current step you are on.",
        placement: "top",
      },
    ],
    3: [
      {
        target: ".rules4",
        content: "Please review the rules carefully before proceeding with the candidate selection process.",
        placement: "top",
      },
      {
        target: ".rules",
        content: "Here are the rules for selecting candidates. Make sure to read and follow them closely.",
        placement: "top",
      },
      {
        target: "tbody > tr:nth-child(1)",
        content: "This is your list of available candidates. Select your preferred candidate based on priority.",
        placement: "top",
      },      
      {
        target: "tbody > tr:nth-child(1) .selection button",
        content: "Click this button to select your **Priority 1** candidate. This is your most preferred choice.",
        placement: "top",
      },
      {
        target: "tbody > tr:nth-child(2) .selection button",
        content: "Next, select your **Priority 2** candidate. This is your second preferred choice.",
        placement: "top",
      },
      {
        target: "tbody > tr:nth-child(3) .selection button",
        content: "Lastly, select your **Priority 3** candidate. This is your third preferred choice.",
        placement: "top",
      },
      {
        target: ".submit-button",
        content: "Once you've selected your candidates in priority order, click here to submit your vote.",
        placement: "top",
      },
    ],
    
    4: [
      {
        target: "thead5",
        content: "Here are the candidates you have selected. Please review them carefully.",
        placement: "top",
      },
      {
        target: "table",
        content: "Here are the candidates you have selected. Please review them carefully.",
        placement: "top",
      },

      {
        target: ".back",
        content: "Click here to go back and make changes to your selection.",
        placement: "top",
      },
      {
        target: ".confirm",
        content: "Click here to confirm your vote.",
        placement: "top",
      },
    ],
    // Add steps for more screens as needed
  }

  // Add volume control step as the last step for each screen
  Object.keys(stepsForScreen).forEach(screen => {
    stepsForScreen[Number(screen)].push({
      target: ".volume-control",
      content: "Click here to enable or disable the audio.",
      placement: "bottom",
    });
  });

  // Get steps for the current screen
  const steps = stepsForScreen[currentScreen] || []

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data as { status: "finished" | "skipped" | "error" | "waiting" | "running" | "paused" }

    if (["finished", "skipped"].includes(status)) {
      setRun(false)
      onComplete()
    }
  }

  // Only render Joyride on the client side after the component has mounted
  if (!isMounted) {
    return null
  }

  return (
    <>
      {isActive && (
        <Joyride
          steps={steps}
          run={run}
          continuous
          showProgress={false} // Hide step number
          showSkipButton
          disableCloseOnEsc
          disableOverlayClose
          styles={{
            options: {
              zIndex: 10000,
              primaryColor: "#FF4081", // Pink for primary color
              backgroundColor: "#ffffff", // White background
              textColor: "#212121", // Dark text
              arrowColor: "#ffffff",
            },
            tooltip: {
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0px 10px 30px rgba(0,0,0,0.2)",
              maxWidth: "500px",
              fontSize: "20px", // Larger text
              backgroundColor: "#f9f9f9", // Light gray background
              color: "#333333", // Dark text
            },
            buttonNext: {
              backgroundColor: "#FF4081",
              color: "#fff",
              fontWeight: "bold",
              padding: "16px 28px",
              borderRadius: "8px",
              fontSize: "18px", // Larger text
              boxShadow: "0px 4px 12px rgba(0,0,0,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            },
            buttonBack: {
              color: "#757575",
              fontWeight: "bold",
              fontSize: "18px", // Larger text
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            },
            buttonClose: {
              color: "#D32F2F",
              fontSize: "22px", // Larger text
            },
            buttonSkip: {
              color: "#D32F2F", // Red color for skip button
              fontWeight: "bold",
              fontSize: "18px", // Larger text
            },
          }}
          callback={handleJoyrideCallback}
          locale={{
            last: "Finish",
            skip: "Skip",
            next: <><span>Next</span> <FaArrowRight /></>, // Add icon
            // Remove the back button
          }}
        />
      )}
    </>
  );
};

export default GuideOverlay;
