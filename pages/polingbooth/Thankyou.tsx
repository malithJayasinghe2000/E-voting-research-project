import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Navbar from "./navbar";

const ThankYou = () => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { locale } = router;
  const audioRef = useRef<HTMLAudioElement | null>(null); // Ref for audio element
  const [isSpeakerEnabled, setSpeakerEnabled] = useState<boolean>(false);

  useEffect(() => {
    // Load speaker state from localStorage on component mount
    const storedSpeakerState = localStorage.getItem("isSpeakerEnabled");
    if (storedSpeakerState) {
      setSpeakerEnabled(JSON.parse(storedSpeakerState));
    }

    const audioFile = `/audio/thankyou_${locale}.mp3`;

    if (audioRef.current) {
      audioRef.current.src = audioFile;
      if (isSpeakerEnabled) {
        // Play audio if speaker is enabled
        audioRef.current.play().catch((error) =>
          console.error("Audio playback failed:", error)
        );
      } else {
        // Pause audio if speaker is disabled
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }

    // Redirect to language selection page after 10 seconds
    const timer = setTimeout(() => {
      router.push("/polingbooth/languageSelection");
    }, 10000);

    // Cleanup the timeout on component unmount
    return () => clearTimeout(timer);
  }, [router, locale, isSpeakerEnabled]); // Dependencies include isSpeakerEnabled to handle toggle

  const toggleSpeaker = () => {
    setSpeakerEnabled((prev) => {
      const newState = !prev;

      if (!newState && audioRef.current) {
        // Pause and reset the audio if the speaker is toggled off
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } else if (newState && audioRef.current) {
        // Play the audio if the speaker is toggled on
        audioRef.current.play().catch((error) =>
          console.error("Audio playback failed:", error)
        );
      }

      localStorage.setItem("isSpeakerEnabled", JSON.stringify(newState));
      return newState;
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#E3F2FD] to-[#90CAF9] text-center">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center p-6">
        <h1 className="text-6xl font-extrabold text-[#003366] leading-tight">
          {t("thankYouTitle")}
        </h1>
      </main>

      {/* Audio element to play the thank you message */}
      <audio ref={audioRef} />

      <div
  onClick={toggleSpeaker}
  className="fixed bottom-20 right-14 cursor-pointer"
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

export default ThankYou;
