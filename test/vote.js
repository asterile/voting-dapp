const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VotingSystem", function () {
  let VotingSystem;
  let votingSystem;
  let admin, voter1, voter2, candidate1, candidate2;
  const areaName = "Area1";
  const maxVoters = 5;
  const nationalID1 = "123456";
  const nationalID2 = "654321";

  beforeEach(async function () {
    [admin, voter1, voter2, candidate1, candidate2] = await ethers.getSigners();
    const VotingSystemFactory = await ethers.getContractFactory("VotingSystem");
    votingSystem = await VotingSystemFactory.deploy();
    // No need to await votingSystem.deployed() in ethers v6
  });

  it("Should add an area", async function () {
    await votingSystem.addArea(areaName, maxVoters);
    const area = await votingSystem.areas(areaName);
    expect(area.maxVoters).to.equal(maxVoters);
  });

  it("Should register a voter", async function () {
    await votingSystem.addArea(areaName, maxVoters);
    await votingSystem.registerVoter(voter1.address, nationalID1, areaName);
    const voter = await votingSystem.voters(voter1.address);
    expect(voter.isRegistered).to.equal(true);
    expect(voter.nationalID).to.equal(nationalID1);
  });

  it("Should register a candidate", async function () {
    await votingSystem.addArea(areaName, maxVoters);
    await votingSystem.registerCandidate(candidate1.address, "Candidate1", nationalID1, areaName);
    const candidate = await votingSystem.candidates(candidate1.address);
    expect(candidate.name).to.equal("Candidate1");
  });

  it("Should start voting", async function () {
    await votingSystem.addArea(areaName, maxVoters);
    await votingSystem.registerCandidate(candidate1.address, "Candidate1", nationalID1, areaName);
    await votingSystem.registerCandidate(candidate2.address, "Candidate2", nationalID2, areaName);
    await votingSystem.startVoting();
    expect(await votingSystem.votingStarted()).to.equal(true);
  });

  it("Should allow a voter to cast a vote", async function () {
    await votingSystem.addArea(areaName, maxVoters);
    await votingSystem.registerVoter(voter1.address, nationalID1, areaName);
    await votingSystem.registerCandidate(candidate1.address, "Candidate1", nationalID1, areaName);
    await votingSystem.registerCandidate(candidate2.address, "Candidate2", nationalID2, areaName); // Add this line
    await votingSystem.startVoting();
    await votingSystem.connect(voter1).vote(candidate1.address, nationalID1, areaName);
    const voter = await votingSystem.voters(voter1.address);
    expect(voter.hasVoted).to.equal(true);
  });
  it("Should end voting and declare a winner", async function () {
    await votingSystem.addArea(areaName, maxVoters);
    await votingSystem.registerVoter(voter1.address, nationalID1, areaName); // Add this line
    await votingSystem.registerCandidate(candidate1.address, "Candidate1", nationalID1, areaName);
    await votingSystem.registerCandidate(candidate2.address, "Candidate2", nationalID2, areaName);
    await votingSystem.startVoting();
    await votingSystem.connect(voter1).vote(candidate1.address, nationalID1, areaName);
    await votingSystem.connect(admin).endVoting();
    const [winner, , voteCount] = await votingSystem.getWinnerByArea(areaName);
    expect(winner).to.equal(candidate1.address);
    expect(voteCount).to.equal(1);
  });


  it("Should return total valid voters by all areas", async function () {
    // Adding areas
    await votingSystem.addArea(areaName, maxVoters);
    const areaName2 = "Area2";
    const maxVoters2 = 10;
    await votingSystem.addArea(areaName2, maxVoters2);

    // Registering voters with unique national IDs
    const nationalID1 = "123456"; // Unique ID for voter1
    const nationalID2 = "654321"; // Unique ID for voter2
    await votingSystem.registerVoter(voter1.address, nationalID1, areaName);
    await votingSystem.registerVoter(voter2.address, nationalID2, areaName);

    // Registering candidates with unique national IDs
    await votingSystem.registerCandidate(candidate1.address, "Candidate1", "789012", areaName);
    await votingSystem.registerCandidate(candidate2.address, "Candidate2", "345678", areaName2);

    // Start voting and have voter1 vote
    await votingSystem.startVoting();
    await votingSystem.connect(voter1).vote(candidate1.address, nationalID1, areaName);

    // Call the getTotalValidVotersByAllAreas function
    const [areasResult, validVotersCountResult] = await votingSystem.getTotalValidVotersByAllAreas();

    // Convert Result to plain arrays
    const areas = Array.from(areasResult);
    const validVotersCount = Array.from(validVotersCountResult);

    // Log the result for debugging
    console.log("Areas:", areas);
    console.log("Valid voters count:", validVotersCount);

    // Check if the result is correct
    expect(areas).to.have.members([areaName, areaName2]); // Ensure the areas are correct
    expect(validVotersCount[0]).to.equal(2n); // Area1 should have 2 registered voters (voter1 and voter2)
    expect(validVotersCount[1]).to.equal(0n); // Area2 should have 0 valid voters (no one registered in Area2)
});


  

  it("Should return candidates by area", async function () {
    await votingSystem.addArea(areaName, maxVoters);
    await votingSystem.registerCandidate(candidate1.address, "Candidate1", nationalID1, areaName);
    const [addresses, names] = await votingSystem.getCandidatesByArea(areaName);
    expect(addresses).to.include(candidate1.address);
    expect(names).to.include("Candidate1");
  });
});
