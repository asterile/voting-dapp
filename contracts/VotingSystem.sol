// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

// Smart contract for a voting system with area-based voting limits and National ID validation
contract VotingSystem {
    address public admin;

    // Structure for a Voter
    struct Voter {
        bool isRegistered; // True if registered
        bool hasVoted; // True if already voted
        address votedCandidate; // Candidate voted for
        string area; // Area the voter belongs to
        string nationalID; // Voter's National ID
    }

    // Structure for a Candidate
    struct Candidate {
        string name;
        address candidateAddress;
        uint256 voteCount;
        string area; // Candidate's area
        string nationalID; // Candidate's National ID
    }

    // Structure for Area
    struct Area {
        uint256 maxVoters; // Total registered voters for this area
        uint256 currentVotes; // Votes already cast in this area
    }

    // Mappings
    mapping(address => Voter) public voters; // Voter registry
    mapping(string => bool) private voterNationalIDExists; // Ensure voter National IDs unique
    mapping(address => Candidate) public candidates; // Candidate registry
    mapping(string => bool) private candidateNationalIDExists; // Prevent duplicate candidate National IDs
    mapping(string => Area) public areas; // Areas with voting limits

    address[] public candidateList; // List of candidate addresses
    string[] public areaList; // List of all areas

    // Voting control
    bool public votingStarted;
    bool public votingEnded;

    // Events
    event VoterRegistered(address voter, string nationalID, string area);
    event CandidateRegistered(address candidate, string name, string nationalID, string area);
    event VoteCasted(address voter, address candidate, string area);
    event VotingEnded(address winner, uint256 voteCount, string area);

    // Modifiers
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action.");
        _;
    }

    modifier duringVoting() {
        require(votingStarted && !votingEnded, "Voting is not active.");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    // Function to add a voting area
    function addArea(string memory _areaName, uint256 _maxVoters) external onlyAdmin {
        require(bytes(_areaName).length > 0, "Area name cannot be empty.");
        require(_maxVoters > 0, "Area must have registered voters.");
        require(areas[_areaName].maxVoters == 0, "Area already exists.");

        areas[_areaName] = Area(_maxVoters, 0);
        areaList.push(_areaName);
    }

    // Function to register a voter with National ID and area
    function registerVoter(address _voter, string memory _nationalID, string memory _areaName) external onlyAdmin {
        require(areas[_areaName].maxVoters > 0, "Area does not exist.");
        require(!voters[_voter].isRegistered, "Voter already registered.");
        require(!voterNationalIDExists[_nationalID], "National ID already registered.");

        // Register voter
        voters[_voter] = Voter(true, false, address(0), _areaName, _nationalID);
        voterNationalIDExists[_nationalID] = true; // Mark National ID as used

        emit VoterRegistered(_voter, _nationalID, _areaName);
    }

    // Function to register a candidate with National ID and area
    function registerCandidate(address _candidate, string memory _name, string memory _nationalID, string memory _areaName) external onlyAdmin {
        require(areas[_areaName].maxVoters > 0, "Area does not exist.");
        require(bytes(_name).length > 0, "Candidate name cannot be empty.");
        require(candidates[_candidate].candidateAddress == address(0), "Candidate already registered.");
        require(!candidateNationalIDExists[_nationalID], "National ID already registered.");

        // Register candidate
        candidates[_candidate] = Candidate(_name, _candidate, 0, _areaName, _nationalID);
        candidateNationalIDExists[_nationalID] = true; // Mark National ID as used
        candidateList.push(_candidate);

        emit CandidateRegistered(_candidate, _name, _nationalID, _areaName);
    }

    // Function to start voting
    function startVoting() external onlyAdmin {
        require(candidateList.length >= 2, "At least two candidates required.");
        votingStarted = true;
        votingEnded = false;
    }

    // Function to cast a vote
    function vote(address _candidate, string memory _nationalID, string memory _area) external duringVoting {
    // Validate voter existence and data
    Voter storage sender = voters[msg.sender];
    require(sender.isRegistered, "You are not registered to vote.");
    require(!sender.hasVoted, "You have already voted.");
    require(
        keccak256(abi.encodePacked(sender.nationalID)) == keccak256(abi.encodePacked(_nationalID)),
        "National ID does not match."
    );
    require(
        keccak256(abi.encodePacked(sender.area)) == keccak256(abi.encodePacked(_area)),
        "Area does not match the voter's registered area."
    );

    // Validate candidate
    require(candidates[_candidate].candidateAddress != address(0), "Invalid candidate.");
    require(
        keccak256(abi.encodePacked(candidates[_candidate].area)) == keccak256(abi.encodePacked(_area)),
        "Candidate and voter must be in the same area."
    );

    // Ensure the votes in this area do not exceed maxVoters
    Area storage area = areas[_area];
    require(area.currentVotes < area.maxVoters, "Voting limit for this area has been reached.");

    // Update voter's status
    sender.hasVoted = true;
    sender.votedCandidate = _candidate;

    // Increment vote counts
    candidates[_candidate].voteCount += 1;
    area.currentVotes += 1;

    emit VoteCasted(msg.sender, _candidate, _area);
}


    // Function to end voting and tally results
    function endVoting() external onlyAdmin duringVoting {
        votingEnded = true;
        votingStarted = false;

        for (uint256 i = 0; i < areaList.length; i++) {
            string memory areaName = areaList[i];
            address winner = address(0);
            uint256 highestVotes = 0;

            for (uint256 j = 0; j < candidateList.length; j++) {
                address candidateAddr = candidateList[j];
                if (
                    keccak256(abi.encodePacked(candidates[candidateAddr].area)) ==
                    keccak256(abi.encodePacked(areaName))
                ) {
                    if (candidates[candidateAddr].voteCount > highestVotes) {
                        highestVotes = candidates[candidateAddr].voteCount;
                        winner = candidateAddr;
                    }
                }
            }

            emit VotingEnded(winner, highestVotes, areaName);
        }
    }

    // Function to get all areas
    function getAreas() external view returns (string[] memory) {
        return areaList;
    }

    // Function to get all candidates
    function getCandidates() external view returns (address[] memory) {
        return candidateList;
    }

    function getCandidatesByArea(string memory _areaName) external view returns (address[] memory, string[] memory) {
    require(areas[_areaName].maxVoters > 0, "Area does not exist.");

    // Count candidates in the area
    uint256 count = 0;
    for (uint256 i = 0; i < candidateList.length; i++) {
        if (
            keccak256(abi.encodePacked(candidates[candidateList[i]].area)) == 
            keccak256(abi.encodePacked(_areaName))
        ) {
            count++;
        }
    }

    // Collect candidate addresses and names
    address[] memory areaCandidates = new address[](count);
    string[] memory candidateNames = new string[](count);
    uint256 index = 0;

    for (uint256 i = 0; i < candidateList.length; i++) {
        if (
            keccak256(abi.encodePacked(candidates[candidateList[i]].area)) == 
            keccak256(abi.encodePacked(_areaName))
        ) {
            areaCandidates[index] = candidateList[i];
            candidateNames[index] = candidates[candidateList[i]].name;
            index++;
        }
    }

    return (areaCandidates, candidateNames);
}

}
