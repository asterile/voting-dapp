async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const Voting = await ethers.getContractFactory("VotingSystem");
    const voting = await Voting.deploy();

    // Wait for the deployment to complete
    //await voting.deployed();

    console.log("Voting contract deployed to:", voting.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
