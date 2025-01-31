import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import Navbar from "./navbar";

// Simulate fetching candidate data from an API
const fetchCandidates = async () => {
  const response = await fetch("http://localhost:3000/api/Candidates/getCandidates");
  const data = await response.json();
  return data.candidates;
};

// Simulate fetching party data from an API
const fetchParties = async () => {
  const response = await fetch("http://localhost:3000/api/Parties/getParties");
  const data = await response.json();
  return data.parties;
};

const CandidateSelection = () => {
  const router = useRouter();
  const { locale } = router;
  const { t } = useTranslation();

  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidates, setSelectedCandidates] = useState<number[]>([]);
  const [isSpeakerEnabled, setSpeakerEnabled] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null); // Ref for audio element to avoid conflicts
  const [parties, setParties] = useState<any[]>([]);

  // Handle audio play function for different actions
  const playAudio = (type: string) => {
    if (typeof window !== "undefined") { // Check if we're in the browser
      if (audioRef.current) {
        audioRef.current.pause(); // Pause any playing audio
        audioRef.current.currentTime = 0; // Reset to start
      }
      const audio = new Audio(`/audio/${type}_${locale}.mp3`);
      audioRef.current = audio; // Assign to ref to control it
      audio.play(); // Play the audio
    }
  };
  useEffect(() => {
    if (typeof window !== "undefined") {
      const newAudioInstance = new Audio(); // Create new audio instance
      // setAudioInstance(newAudioInstance); // Store it in state

      // Load speaker state from localStorage
      const savedSpeakerState = localStorage.getItem("isSpeakerEnabled");
      if (savedSpeakerState !== null) {
        setSpeakerEnabled(JSON.parse(savedSpeakerState));
      }
    }
  }, []); 

  // Fetch candidates and parties data on page load
  useEffect(() => {
    // Fetch candidates data on page load
    const fetchData = async () => {
      const candidatesData = await fetchCandidates();
      setCandidates(candidatesData);

      const partiesData = await fetchParties();
      setParties(partiesData);
    };
    fetchData();

    // Play initial rules audio if the speaker is enabled
    if (isSpeakerEnabled) {
      playAudio("rules");
    }

    // Cleanup: Stop audio when the component is unmounted
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [locale, isSpeakerEnabled]);

  // Handle candidate selection (selection, deselection, max selection)
  const handleCandidateSelection = (candidateId: number) => {
    const index = selectedCandidates.indexOf(candidateId);

    if (index !== -1) {
      const updatedSelection = selectedCandidates.filter((id) => id !== candidateId);
      setSelectedCandidates(updatedSelection);
      if (isSpeakerEnabled) playAudio("deselect");
    } else {
      if (selectedCandidates.length < 3) {
        setSelectedCandidates([...selectedCandidates, candidateId]);
        if (isSpeakerEnabled) playAudio("select");
      }
      if (selectedCandidates.length === 2 && isSpeakerEnabled) {
        playAudio("max");
      }
    }
  };

  // Handle submit
  const handleSubmit = () => {
    if (selectedCandidates.length === 3) {
      if (isSpeakerEnabled) {
        playAudio("submit");
        if (audioRef.current) {
          audioRef.current.onended = () => {
            router.push({
              pathname: "/polingbooth/ConfirmVote",
              query: { candidates: JSON.stringify(selectedCandidates) },
            });
          };
        }
      } else {
        // Navigate immediately if speaker is disabled
        router.push({
          pathname: "/polingbooth/ConfirmVote",
          query: { candidates: JSON.stringify(selectedCandidates) },
        });
      }
    } else {
      alert(t("selectExactly3Alert"));
    }
  };
  

  // Speaker Toggle Handler
  const toggleSpeaker = () => {
    setSpeakerEnabled((prev) => {
      const newState = !prev;
      try {
        localStorage.setItem("isSpeakerEnabled", JSON.stringify(newState));
      } catch (error) {
        console.error("Error saving speaker state:", error);
      }
      return newState;
    });
  };

  // Play hover sound for submit button
  const handleHoverSubmitButton = () => {
    if (isSpeakerEnabled) playAudio("hover");
  };

  // Get party logo by party ID
  const getPartyLogo = (partyId: string) => {
    const party = parties.find((p) => p._id === partyId);
    return party ? party.logo : "";
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#F1F1F1] to-[#B0D0E6]">
      <Navbar />

      <div className="p-6 bg-gradient-to-b from-[#F1F1F1] to-[#B0D0E6] text-[#003366] text-xl font-semibold">
        <h2 className="mb-4 text-4xl">{t("candidateSelectionRulesTitle")}</h2>
        <ul className="list-disc ml-8 text-2xl">
          <li>{t("select3CandidatesRule")}</li>
          <li>{t("clickToSelectCandidate")}</li>
          <li>{t("votePreferenceInstructions")}</li>
        </ul>
      </div>

      <main className="flex flex-col items-center justify-center flex-grow px-0">
        <div className="w-full max-w-full overflow-x-auto bg-gradient-to-b from-[#F1F1F1] to-[#B0D0E6] border-4 border-gray-300 shadow-lg rounded-lg">
          <table className="table-auto w-full border-collapse text-left text-xl">
            <thead className="bg-[#003366] text-white font-semibold text-2xl">
              <tr>
                <th className="px-8 py-6 border">{}</th>
                <th className="px-8 py-6 border">{t("candidateName")}</th>
                <th className="px-8 py-6 border">{t("party")}</th>
                <th className="px-8 py-6 border">{t("symble")}</th>
                <th className="px-8 py-6 border text-center">{t("candidateNo")}</th>
                <th className="px-8 py-6 border text-center">{t("select")}</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((candidate) => (
                <tr key={candidate._id} className="hover:bg-gray-100 bg-white">
                  <td className="px-8 py-6 border text-center">
                    <img src={candidate.image} alt={candidate.name} className="w-20 h-20 object-cover rounded-full mx-auto" />
                  </td>
                  <td className="px-8 py-6 border">
                    <div className="text-2xl font-bold">{candidate.name}</div>
                  </td>
                  <td className="px-8 py-6 border text-2xl font-bold">{candidate.party}</td>
                  <td className="px-8 py-6 border text-center">
                    <img src={getPartyLogo(candidate.party)} alt={candidate.party} className="w-20 h-20 object-cover rounded-full mx-auto" />
                  </td>
                  <td className="px-8 py-6 border text-center text-5xl">{candidate.no}</td>
                  <td className="px-8 py-6 border text-center">
                    <button
                      className={`w-20 h-20 ${selectedCandidates.includes(candidate._id) ? "bg-blue-600 text-white" : "bg-transparent border-4 border-gray-400"} rounded-full text-4xl font-bold`}
                      onClick={() => handleCandidateSelection(candidate._id)}
                    >
                      {selectedCandidates.includes(candidate._id)
                        ? selectedCandidates.indexOf(candidate._id) + 1
                        : ""}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          onClick={handleSubmit}
          onMouseEnter={handleHoverSubmitButton} // Trigger hover audio
          className="w-96 bg-[#003366] text-white py-8 rounded-full shadow-lg text-3xl font-bold hover:bg-[#005B8D] hover:scale-105 transition-transform duration-300 mt-12 mb-12"
        >
          {t("submitVoteButton")}
        </button>
      </main>

      {/* Speaker Toggle Button */}
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


export default CandidateSelection;
