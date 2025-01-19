async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // Fetch the contract factory
    const Voting = await ethers.getContractFactory("VotingSystem", deployer);

    // Deploy the contract
    const voting = await Voting.deploy();

    // Wait for the deployment transaction to be mined
    const receipt = await voting.deploymentTransaction().wait();

    console.log("Voting contract deployed to:", voting.target); // Correctly retrieve contract address
    console.log("Transaction hash:", receipt.transactionHash); // Log the transaction hash for reference
}

main().catch((error) => {
    console.error("Error during deployment:", error);
    process.exitCode = 1;
});
