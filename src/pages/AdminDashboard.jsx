import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { ethers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import VotingSystem from '../artifacts/contracts/VotingSystem.sol/VotingSystem.json';

const AdminDashboard = () => {
    const [contract, setContract] = useState(null);
    const [voterCountByArea, setVoterCountByArea] = useState(null);
    const [areaName, setAreaName] = useState('');

    useEffect(() => {
        const loadBlockchainData = async () => {
            if (typeof window.ethereum !== 'undefined') {
                const provider = new Web3Provider(window.ethereum);
                const signer = provider.getSigner(0);
                const contractAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'; // Replace with your contract address
                const contract = new ethers.Contract(contractAddress, VotingSystem.abi, signer);
                setContract(contract);
            } else {
                console.error('Ethereum object not found! Make sure MetaMask is installed.');
            }
        };
        loadBlockchainData();
    }, []);

    const registerCandidate = async (name, address, nationalID, area) => {
        try {
            await contract.registerCandidate(address, name, nationalID, area);
            alert('Candidate registered successfully!');
        } catch (error) {
            console.error('Error registering candidate:', error);
        }
    };

    const registerVoter = async (address, nationalID, area) => {
        try {
            await contract.registerVoter(address, nationalID, area);
            alert('Voter registered successfully!');
        } catch (error) {
            console.error('Error registering voter:', error);
        }
    };

    const addArea = async (areaName, maxVoters) => {
        try {
            await contract.addArea(areaName, maxVoters);
            alert('Area added successfully!');
        } catch (error) {
            console.error('Error adding area:', error);
        }
    };

    async function getTotalVotersByArea(areaName) {
        try {
            // Call contract function directly without .methods and .call
            const voterCount = await contract.getTotalVotersByArea(areaName);
            console.log("Voter count:", voterCount);
            setVoterCountByArea(voterCount.toString()); // Update state with the result
        } catch (error) {
            console.error("Error fetching voter count:", error);
        }
    }
    
    
    
    
    return (
        <div className="bg-[#552E43] min-h-screen flex flex-col">
            <div className="fixed top-0 left-0 w-full z-10 shadow-md">
                <Navbar />
            </div>
            <div className="flex-grow flex items-center justify-center">
                <div className="flex flex-row justify-center items-start flex-wrap gap-8 p-8">
                    <div className="w-[300px] h-[360px] p-4 bg-white shadow-md rounded">
                        <h2 className="text-xl font-semibold mb-4">Register Candidate</h2>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const name = e.target.name.value;
                            const address = e.target.address.value;
                            const nationalID = e.target.nationalID.value;
                            const area = e.target.area.value;
                            registerCandidate(name, address, nationalID, area);
                        }}>
                            <input type="text" name="name" placeholder="Name" className="border p-2 mb-2 w-full" required />
                            <input type="text" name="address" placeholder="Address" className="border p-2 mb-2 w-full" required />
                            <input type="text" name="nationalID" placeholder="National ID" className="border p-2 mb-2 w-full" required />
                            <input type="text" name="area" placeholder="Area" className="border p-2 mb-2 w-full" required />
                            <button type="submit" className="bg-[#F49B60] text-white p-2 w-full">Register Candidate</button>
                        </form>
                    </div>

                    <div className="w-[300px] h-[360px] p-4 bg-white shadow-md rounded">
                        <h2 className="text-xl font-semibold mb-4">Register Voter</h2>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const address = e.target.address.value;
                            const nationalID = e.target.nationalID.value;
                            const area = e.target.area.value;
                            registerVoter(address, nationalID, area);
                        }}>
                            <input type="text" name="address" placeholder="Address" className="border p-2 mb-2 w-full" required />
                            <input type="text" name="nationalID" placeholder="National ID" className="border p-2 mb-2 w-full" required />
                            <input type="text" name="area" placeholder="Area" className="border p-2 mb-2 w-full" required />
                            <button type="submit" className="bg-[#F49B60] text-white p-2 w-full mt-12">Register Voter</button>
                        </form>
                    </div>

                    <div className="w-[300px] h-[360px] p-4 bg-white shadow-md rounded">
                        <h2 className="text-xl font-semibold mb-4">Add Area</h2>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const areaName = e.target.areaName.value;
                            const maxVoters = e.target.maxVoters.value;
                            addArea(areaName, maxVoters);
                        }}>
                            <input type="text" name="areaName" placeholder="Area Name" className="border p-2 mb-2 w-full" required />
                            <input type="number" name="maxVoters" placeholder="Max Voters" className="border p-2 mb-2 w-full" required />
                            <button type="submit" className="bg-[#F49B60] text-white p-2 w-full mt-20">Add Area</button>
                        </form>
                    </div>

                    <div className="w-[300px] h-[360px] p-4 bg-white shadow-md rounded">
                        <h2 className="text-xl font-semibold mb-4">View Voter Count by Area</h2>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const areaName = e.target.areaName.value;
                            getTotalVotersByArea(areaName);
                        }}>
                            <input type="text" name="areaName" placeholder="Area Name" className="border p-2 mb-2 w-full" required />
                            <button type="submit" className="bg-[#F49B60] text-white p-2 w-full mt-20">Get Voter Count</button>
                        </form>
                        {voterCountByArea !== null && (
                            <p className="mt-4">Total Voters in {areaName}: {voterCountByArea}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
