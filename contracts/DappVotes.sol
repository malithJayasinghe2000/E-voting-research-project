// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;
import '@openzeppelin/contracts/utils/Counters.sol';

contract DappVotes {
    using Counters for Counters.Counter;
    Counters.Counter private totalPolls;
    Counters.Counter private totalContestants;

    struct PollStruct {
        uint id;
        string image;
        string title;
        string description;
        uint votes;
        uint contestants;
        bool deleted;
        address director;
        uint startsAt;
        uint endsAt;
        uint timestamp;
        address[] voters;
        string[] avatars;
    }

    struct ContestantStruct {
        uint id;
        string image;
        string name;
        address voter;
        uint votes;
        address[] voters;
    }

    mapping(uint => bool) public pollExists;
    mapping(uint => PollStruct) public polls;
    mapping(uint => mapping(address => bool)) voted;
    mapping(uint => mapping(address => bool)) contested;
    mapping(uint => mapping(uint => ContestantStruct)) contestants;

    event Voted(address indexed voter,uint timestamp);

    function createPoll(
        string memory image,
        string memory title,
        string memory description,
        uint startsAt,
        uint endsAt
    ) public {
        require(bytes(title).length > 0, "Title is required");
        require(bytes(description).length > 0, "Description is required");
        require(bytes(image).length > 0, "Image is required");
        require(startsAt > 0, "Start date is required");
        require(endsAt > startsAt, 'End date must be greater than start date');

        totalPolls.increment();

        PollStruct memory poll;
        poll.id = totalPolls.current();
        poll.title = title;
        poll.description = description;
        poll.image = image;
        poll.startsAt = startsAt;
        poll.endsAt = endsAt;
        poll.director = msg.sender;
        poll.timestamp = currentTime();

        polls[poll.id] = poll;
        pollExists[poll.id] = true;

    }

    function updatePoll(
        uint id,
        string memory image,
        string memory title,
        string memory description,
        uint startsAt,
        uint endsAt
    ) public {
        require(pollExists[id], "Poll does not exist");
        require(polls[id].director == msg.sender, "You are not the director of this poll");
        require(bytes(title).length > 0, "Title is required");
        require(bytes(description).length > 0, "Description is required");
        require(bytes(image).length > 0, "Image is required");
        require(!polls[id].deleted, "Poll has been deleted");
        require(polls[id].votes < 1, "Poll has votes, cannot be updated");
        require(endsAt > startsAt, 'End date must be greater than start date');

        polls[id].title = title;
        polls[id].description = description;
        polls[id].image = image;
        polls[id].startsAt = startsAt;
        polls[id].endsAt = endsAt;
    }

    
    
    function deletePoll(uint id) public {
        require(pollExists[id], "Poll does not exist");
        require(polls[id].director == msg.sender, "You are not the director of this poll");
        require(polls[id].votes < 1, "Poll has votes, cannot be deleted");

        polls[id].deleted = true;
    }

    function getPoll(uint id) public view returns (PollStruct memory) {
        return polls[id];
    }

    function getPolls() public view returns (PollStruct[] memory Polls) {
        uint available;
        for (uint i = 1; i <= totalPolls.current(); i++) {
            if (!polls[i].deleted) {
                available++;
            }
        }
        Polls = new PollStruct[](available);
        uint index;

        for (uint i = 1; i <= totalPolls.current(); i++) {
            if (!polls[i].deleted) {
                Polls[index++] = polls[i];
            }
        }
    }

    function contest(uint id,string memory name, string memory image) public {
        require(pollExists[id], "Poll does not exist");
        require(bytes(name).length > 0, "Name is required");
        require(bytes(image).length > 0, "Image is required");
        require(polls[id].votes < 1 , "Poll has votes, cannot be contested");
        require(!contested[id][msg.sender], "You have already contested in this poll");

        totalContestants.increment();

        ContestantStruct memory contestant;
        contestant.name = name;
        contestant.image = image;
        contestant.voter = msg.sender;
        contestant.id = totalContestants.current();

        contestants[id][contestant.id] = contestant;
        contested[id][msg.sender] = true;
        polls[id].avatars.push(image);
        polls[id].contestants++;
    }

    function getContestant(uint id,uint cid) public view returns (ContestantStruct memory) {
        return contestants[id][cid];
    }

    function getContestants(uint id) public view returns (ContestantStruct[] memory Contestants) {
        uint available;
        for (uint i = 1; i <= totalContestants.current(); i++) {
            if (contestants[id][i].id == i) {
                available++;
            }
        }
        Contestants = new ContestantStruct[](available);
        uint index;

         for (uint i = 1; i <= totalContestants.current(); i++) {
            if (contestants[id][i].id == i) {
                Contestants[index++] = contestants[id][i];
            }
        }
    }

    function vote(uint id,uint cid) public {
        require(pollExists[id], "Poll does not exist");
        require(!voted[id][msg.sender], "You have already voted in this poll");
        require(!polls[id].deleted, "Poll has been deleted");
        require(polls[id].contestants > 1, "Not enough contestants to vote");
        require(
            currentTime() > polls[id].startsAt && currentTime() < polls[id].endsAt,
            "Voting is not allowed at this time"
        );

        polls[id].votes++;
        polls[id].voters.push(msg.sender);

        contestants[id][cid].votes++;
        contestants[id][cid].voters.push(msg.sender);
        voted[id][msg.sender] = true;

        emit Voted(msg.sender,currentTime());
    }

    function currentTime() internal view returns (uint256) {
        return (block.timestamp * 1000) + 1000;
    }

}