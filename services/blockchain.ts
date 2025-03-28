import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const CONTRACT_ABI = [
  "function storeMultipleVoteCounts(string pollingManagerId, string[] candidateIds, uint256 priority, uint256[] counts) public",
  "function getVoteCounts(string pollingManagerId, string candidateId) public view returns (uint256, uint256, uint256)",
  "function getAllVoteCounts() public view returns (string[], string[], uint256[], uint256[], uint256[])"
];

export const storeResultsOnBlockchain = async (
  pollingManagerId: string,
  candidateVotes: Record<string, number>,
  priority: number
): Promise<void> => {
  if (!window.ethereum) {
    alert("Please install MetaMask to use blockchain features.");
    return;
  }

  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    const candidateIds = Object.keys(candidateVotes);
    const counts = Object.values(candidateVotes);

    const tx = await contract.storeMultipleVoteCounts(pollingManagerId, candidateIds, priority, counts);
    await tx.wait();
    alert(`Stored votes for priority ${priority} by Polling Manager: ${pollingManagerId}`)
    console.log(`Stored votes for priority ${priority} by Polling Manager: ${pollingManagerId}`);
  } catch (error) {
    console.error("Failed to store multiple votes on blockchain:", error);
  }
};

export const getResultsFromBlockchain = async (
  pollingManagerId: string,
  candidateId: string
): Promise<{ priority1: number; priority2: number; priority3: number } | null> => {
  if (!window.ethereum) {
    alert("Please install MetaMask to use blockchain features.");
    return null;
  }

  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

    const [priority1, priority2, priority3] = await contract.getVoteCounts(pollingManagerId, candidateId);
    return {
      priority1: priority1.toNumber(),
      priority2: priority2.toNumber(),
      priority3: priority3.toNumber(),
    };
  } catch (error) {
    console.error("Failed to retrieve votes from blockchain:", error);
    return null;
  }
};

export const getAllResultsFromBlockchain = async (): Promise<
  { pollingManagerId: string; candidateId: string; priority1: number; priority2: number; priority3: number }[] | null
> => {
  if (!window.ethereum) {
    alert("Please install MetaMask to use blockchain features.");
    return null;
  }

  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

    const [pollingManagerIds, candidateIds, p1Votes, p2Votes, p3Votes] = await contract.getAllVoteCounts();
    
    const results = pollingManagerIds.map((pollingManagerId: string, index: number) => ({
      pollingManagerId: pollingManagerId,
      candidateId: candidateIds[index],
      priority1: p1Votes[index].toNumber(),
      priority2: p2Votes[index].toNumber(),
      priority3: p3Votes[index].toNumber(),
    }));

    return results;
  } catch (error) {
    console.error("Failed to retrieve all votes from blockchain:", error);
    return null;
  }
};
