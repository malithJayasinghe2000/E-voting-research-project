// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

contract VoteStorage {
    struct VoteRecord {
        uint256 priority1;
        uint256 priority2;
        uint256 priority3;
        string pollingManagerId; // Store polling manager ID
    }

    mapping(string => VoteRecord) public voteCounts;
    string[] public candidateList;

    event VotesStored(string pollingManagerId, string[] candidateIds, uint256 priority, uint256[] counts);

    function storeMultipleVoteCounts(
        string memory pollingManagerId,
        string[] memory candidateIds,
        uint256 priority,
        uint256[] memory counts
    ) public {
        require(candidateIds.length == counts.length, "Mismatched input lengths");

        for (uint256 i = 0; i < candidateIds.length; i++) {
            if (priority == 1) {
                voteCounts[candidateIds[i]].priority1 = counts[i];
            } else if (priority == 2) {
                voteCounts[candidateIds[i]].priority2 = counts[i];
            } else if (priority == 3) {
                voteCounts[candidateIds[i]].priority3 = counts[i];
            }

            // Store polling manager ID only once
            if (bytes(voteCounts[candidateIds[i]].pollingManagerId).length == 0) {
                voteCounts[candidateIds[i]].pollingManagerId = pollingManagerId;
            }

            // Add candidate if not exists
            bool exists = false;
            for (uint256 j = 0; j < candidateList.length; j++) {
                if (keccak256(bytes(candidateList[j])) == keccak256(bytes(candidateIds[i]))) {
                    exists = true;
                    break;
                }
            }
            if (!exists) {
                candidateList.push(candidateIds[i]);
            }
        }

        emit VotesStored(pollingManagerId, candidateIds, priority, counts);
    }

    function getVoteCounts(string memory candidateId) public view returns (uint256, uint256, uint256) {
        VoteRecord memory record = voteCounts[candidateId];
        return (record.priority1, record.priority2, record.priority3);
    }

    function getAllVoteCounts() public view returns (string[] memory, uint256[] memory, uint256[] memory, uint256[] memory) {
        uint256 length = candidateList.length;
        string[] memory ids = new string[](length);
        uint256[] memory p1 = new uint256[](length);
        uint256[] memory p2 = new uint256[](length);
        uint256[] memory p3 = new uint256[](length);

        for (uint256 i = 0; i < length; i++) {
            ids[i] = candidateList[i];
            VoteRecord memory record = voteCounts[candidateList[i]];
            p1[i] = record.priority1;
            p2[i] = record.priority2;
            p3[i] = record.priority3;
        }

        return (ids, p1, p2, p3);
    }
}
