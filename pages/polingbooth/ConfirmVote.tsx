import { useRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import Navbar from "./navbar";
import { useRef, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

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
  const { data: session } = useSession();

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
    }else{
      router.push("/polingbooth/CandidateSelection");
    }
    
  };

  const handleConfirm = async () => {
    try {
      // Create the 'votes' array with candidate IDs and priority (index + 1)
      const votes = selectedCandidates.map((candidate:any, index:any) => ({
        candidate_id: candidate, // Candidate ID
        priority: index + 1, // Assign priority based on selection order
      }));

      const poll_manager_id = session?.user?._id; // Ensure this is properly set

      // Log the selected candidates with priority and polling manager ID
      console.log("Selected Candidates with Priority: ", votes);
      console.log("Polling Manager ID: ", poll_manager_id);

      const response = await fetch("http://localhost:5000/api/vote/encrypt", {
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
        console.error("Error encrypting votes:", await response.text());
      }
    } catch (error) {
      console.error("Error sending votes:", error);
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