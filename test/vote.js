const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VotingSystem", function () {
    let VotingSystem;
    let votingSystem;
    let admin;
    let voter1;
    let voter2;
    let candidate1;
    let candidate2;
    let area1 = "Area 1";
    let area2 = "Area 2";
    let candidateName1 = "Candidate 1";
    let candidateName2 = "Candidate 2";
    let nationalID1 = "ID-12345";
    let nationalID2 = "ID-67890";

    beforeEach(async function () {
        // Get contract factory and deploy
        VotingSystem = await ethers.getContractFactory("VotingSystem");
        [admin, voter1, voter2, candidate1, candidate2] = await ethers.getSigners();
        votingSystem = await VotingSystem.deploy();

        // Add areas to the system
        await votingSystem.addArea(area1, 100);
        await votingSystem.addArea(area2, 100);

        // Register candidates
        await votingSystem.registerCandidate(candidate1.address, candidateName1, nationalID1, area1);
        await votingSystem.registerCandidate(candidate2.address, candidateName2, nationalID2, area2);

        // Register voters
        await votingSystem.registerVoter(voter1.address, nationalID1, area1);
        await votingSystem.registerVoter(voter2.address, nationalID2, area2);

        // Start voting
        await votingSystem.startVoting();
    });

    it("Should allow a voter to cast a vote", async function () {
        // Voter 1 casts vote for Candidate 1
        await votingSystem.connect(voter1).vote(candidateName1, nationalID1, area1);
        
        // Check vote count
        const candidate = await votingSystem.candidates(candidate1.address);
        expect(candidate.voteCount).to.equal(1);
    });

    it("Should end voting and declare a winner", async function () {
        // Voters cast their votes
        await votingSystem.connect(voter1).vote(candidateName1, nationalID1, area1);
        await votingSystem.connect(voter2).vote(candidateName2, nationalID2, area2);

        // End voting
        await votingSystem.endVoting();

        // Check voting ended and declare winner
        const result = await votingSystem.getWinnerByArea(area1);
        expect(result[0]).to.equal(candidate1.address);
    });

    it("Should return total valid voters by all areas", async function () {
        // Get valid voters by area
        const [areas, counts] = await votingSystem.getTotalValidVotersByAllAreas();

        expect(areas.length).to.equal(2);
        expect(counts[0]).to.equal(1); // Area 1 has 1 valid voter
        expect(counts[1]).to.equal(1); // Area 2 has 1 valid voter
    });

    it("Should reject voting if voting has ended", async function () {
        // End voting
        await votingSystem.endVoting();

        // Try voting after voting ends
        await expect(votingSystem.connect(voter1).vote(candidateName1, nationalID1, area1))
            .to.be.revertedWith("Voting is not active.");
    });

    it("Should only allow registered voters to vote", async function () {
      // Non-registered voter (voter2) attempts to vote with a wrong National ID
      const incorrectNationalID = "ID-99999"; // Make sure this doesn't match any registered voter
  
      // Attempting to vote with an incorrect National ID should revert with the correct reason
      await expect(
          votingSystem.connect(voter2).vote(candidateName1, incorrectNationalID, area1)
      ).to.be.revertedWith("National ID does not match.");
  });
  

    it("Should allow only admin to end voting", async function () {
        // Only admin should be able to end voting
        await expect(votingSystem.connect(voter1).endVoting())
            .to.be.revertedWith("Only admin can perform this action.");
    });
});
