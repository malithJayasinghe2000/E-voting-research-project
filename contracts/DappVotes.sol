// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

contract VoteStorage {
    struct VoteRecord {
        uint256 priority1;
        uint256 priority2;
        uint256 priority3;
    }

    mapping(string => mapping(string => VoteRecord)) public voteCounts; // Mapping pollingManagerId => candidateId => VoteRecord
    mapping(string => string[]) public candidateList; // Mapping pollingManagerId => candidateList
    string[] public pollingManagerIds; // List of all polling manager IDs

    event VotesStored(string pollingManagerId, string[] candidateIds, uint256 priority, uint256[] counts);

    function storeMultipleVoteCounts(
        string memory pollingManagerId,
        string[] memory candidateIds,
        uint256 priority,
        uint256[] memory counts
    ) public {
        require(candidateIds.length == counts.length, "Mismatched input lengths");

        // Add polling manager ID if not exists
        bool managerExists = false;
        for (uint256 i = 0; i < pollingManagerIds.length; i++) {
            if (keccak256(bytes(pollingManagerIds[i])) == keccak256(bytes(pollingManagerId))) {
                managerExists = true;
                break;
            }
        }
        if (!managerExists) {
            pollingManagerIds.push(pollingManagerId);
        }

        for (uint256 i = 0; i < candidateIds.length; i++) {
            if (priority == 1) {
                voteCounts[pollingManagerId][candidateIds[i]].priority1 = counts[i];
            } else if (priority == 2) {
                voteCounts[pollingManagerId][candidateIds[i]].priority2 = counts[i];
            } else if (priority == 3) {
                voteCounts[pollingManagerId][candidateIds[i]].priority3 = counts[i];
            }

            // Add candidate if not exists
            bool exists = false;
            for (uint256 j = 0; j < candidateList[pollingManagerId].length; j++) {
                if (keccak256(bytes(candidateList[pollingManagerId][j])) == keccak256(bytes(candidateIds[i]))) {
                    exists = true;
                    break;
                }
            }
            if (!exists) {
                candidateList[pollingManagerId].push(candidateIds[i]);
            }
        }

        emit VotesStored(pollingManagerId, candidateIds, priority, counts);
    }

    function getVoteCounts(string memory pollingManagerId, string memory candidateId) public view returns (uint256, uint256, uint256) {
        VoteRecord memory record = voteCounts[pollingManagerId][candidateId];
        return (record.priority1, record.priority2, record.priority3);
    }

    function getAllVoteCounts() public view returns (string[] memory, string[] memory, uint256[] memory, uint256[] memory, uint256[] memory) {
        uint256 totalCandidates = 0;
        for (uint256 i = 0; i < pollingManagerIds.length; i++) {
            totalCandidates += candidateList[pollingManagerIds[i]].length;
        }

        string[] memory pollingManagerIdsArray = new string[](totalCandidates);
        string[] memory candidateIds = new string[](totalCandidates);
        uint256[] memory p1 = new uint256[](totalCandidates);
        uint256[] memory p2 = new uint256[](totalCandidates);
        uint256[] memory p3 = new uint256[](totalCandidates);

        uint256 index = 0;
        for (uint256 i = 0; i < pollingManagerIds.length; i++) {
            string memory managerId = pollingManagerIds[i];
            for (uint256 j = 0; j < candidateList[managerId].length; j++) {
                pollingManagerIdsArray[index] = managerId;
                candidateIds[index] = candidateList[managerId][j];
                VoteRecord memory record = voteCounts[managerId][candidateList[managerId][j]];
                p1[index] = record.priority1;
                p2[index] = record.priority2;
                p3[index] = record.priority3;
                index++;
            }
        }

        return (pollingManagerIdsArray, candidateIds, p1, p2, p3);
    }
}
