import { useRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import Navbar from "./navbar";
import { useRef, useEffect, useState } from "react";

// Data for Candidates (this should match the candidate data in CandidateSelection)
const candidates = [
  { id: 23, name: { en: "Anura Kumara Dissanayake", si: "අනුර කුමාර දිසානායක", ta: "அனுர குமார திசாநாயக்க" }, party: "NPP", symbol: "🌱" },
  { id: 17, name: { en: "Sajith Premadasa", si: "සජිත් ප්‍රේමදාස", ta: "சஜித் பிரேமதாச" }, party: "SJB", symbol: "🌟" },
  { id: 34, name: { en: "Ranil Wickremesinghe", si: "රනිල් වික්‍රමසිංහ", ta: "ரணில் விக்ரமசிங்க" }, party: "UNP", symbol: "⚖️" },
  { id: 14, name: { en: "Namal Rajapaksa", si: "නාමල් රාජපක්ෂ", ta: "நாமல் ராஜபக்ச" }, party: "SLPP", symbol: "🦁" },
  { id: 66, name: { en: "P. Ariyanethiran", si: "පී. අරියනේතිරන්", ta: "பி. அரியநேதிரன்" }, party: "DHH", symbol: "🏠" },
  { id: 36, name: { en: "Dilith Jayaweera", si: "දිලිත් ජයවීර", ta: "திலித் ஜயவீர" }, party: "FHH", symbol: "🏡" },
  { id: 67, name: { en: "K. K. Piyadasa", si: "කේ. කේ. පියදාස", ta: "கே. கே. பியதாச" }, party: "YUU", symbol: "📚" },
  { id: 8, name: { en: "D. M. Bandaranayake", si: "ඩී. එම්. බණ්ඩාරනායක", ta: "டி. எம். பண்டாரநாயக்க" }, party: "UII", symbol: "🌳" },
  { id: 9, name: { en: "Sarath Fonseka", si: "සරත් ෆොන්සේකා", ta: "சரத் பொன்சேகா" }, party: "RTT", symbol: "⚔️" },
  { id: 10, name: { en: "Wijeyadasa Rajapakshe", si: "විජයදාස රාජපක්ෂ", ta: "விஜயதாச ராஜபக்ச" }, party: "KNN", symbol: "🌊" },
];

const ConfirmVote = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isSpeakerEnabled, setSpeakerEnabled] = useState<boolean>(false);

  const { candidates: selectedCandidateIds } = router.query;
  const selectedCandidates = selectedCandidateIds
    ? JSON.parse(selectedCandidateIds as string)
    : [];
  const displayedCandidates = candidates.filter((candidate) =>
    selectedCandidates.includes(candidate.id)
  );

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
    }else{
      router.push("/polingbooth/CandidateSelection");
    }
    
  };

  const handleConfirm = () => {
    if (isSpeakerEnabled) {
      playAudio("confirmSuccess", () => {
        router.push("/polingbooth/Thankyou");
      });
    }else{
      router.push("/polingbooth/Thankyou");
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
  

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#F1F1F1] to-[#B0D0E6]">
      <Navbar />

      <main className="flex flex-col items-center justify-center flex-grow px-0">
        <div className="w-full max-w-full overflow-x-auto bg-gradient-to-b from-[#F1F1F1] to-[#B0D0E6] border-4 border-gray-300 shadow-lg rounded-lg">
          <table className="table-auto w-full border-collapse text-left text-lg">
            <thead className="bg-[#003366] text-white font-semibold text-xl">
              <tr>
                <th className="px-8 py-6 border">{t("candidateNo")}</th>
                <th className="px-8 py-6 border">{t("candidateName")}</th>
                <th className="px-8 py-6 border">{t("partyName")}</th>
                <th className="px-8 py-6 border">{t("symbol")}</th>
              </tr>
            </thead>
            <tbody>
              {displayedCandidates.map((candidate, index) => (
                <tr key={candidate.id} className="hover:bg-gray-100 bg-white">
                  <td className="px-8 py-6 border text-center text-5xl">{index + 1}</td>
                  <td className="px-8 py-6 border">
                    <div className="text-2xl font-bold">{candidate.name.en}</div>
                    <div className="text-2xl font-bold">{candidate.name.si}</div>
                    <div className="text-2xl font-bold">{candidate.name.ta}</div>
                  </td>
                  <td className="px-8 py-6 border text-2xl font-bold">{candidate.party}</td>
                  <td className="px-8 py-6 border text-center text-7xl">{candidate.symbol}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex gap-4">
          <button
            onClick={handleBack}
            onMouseEnter={() => handleHoverButton("backHover")}
            className="w-80 bg-[#800000] text-white py-6 rounded-full shadow-lg text-2xl font-bold hover:bg-[#660000] hover:scale-105 transition-transform duration-300"
          >
            {t("backButton")}
          </button>
          <button
            onClick={handleConfirm}
            onMouseEnter={() => handleHoverButton("confirmHover")}
            className="w-80 bg-[#006400] text-white py-6 rounded-full shadow-lg text-2xl font-bold hover:bg-[#228B22] hover:scale-105 transition-transform duration-300"
          >
            {t("confirmButton")}
          </button>
        </div>

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