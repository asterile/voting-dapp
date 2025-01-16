import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { ethers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import VotingSystem from '../artifacts/contracts/VotingSystem.sol/VotingSystem.json';

const AdminDashboard = () => {
    const [contract, setContract] = useState(null);
    const [voterCountByArea, setVoterCountByArea] = useState([]);
    const [currentAddress, setCurrentAddress] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [isVotingStarted, setIsVotingStarted] = useState(false);
    const [isVotingEnded, setIsVotingEnded] = useState(false);

    const adminAddress = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266';

    useEffect(() => {
        const loadBlockchainData = async () => {
            if (typeof window.ethereum !== 'undefined') {
                const provider = new Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const contractAddress = '0xc6e7df5e7b4f2a278906862b61205850344d4e7d'; // Replace with your contract address
                const contract = new ethers.Contract(contractAddress, VotingSystem.abi, signer);

                const address = await signer.getAddress();
                setCurrentAddress(address);

                if (address.toLowerCase() === adminAddress.toLowerCase()) {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                }

                setContract(contract);

                // Fetch voting status on component mount
                const votingStatus = await contract.votingStarted();
                const votingEndStatus = await contract.votingEnded();
                setIsVotingStarted(votingStatus);
                setIsVotingEnded(votingEndStatus);
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
            const errorMessage = error.data?.message || error.message;
            alert(`Error registering candidate: ${errorMessage}`);
            console.error('Error registering candidate:', error);
        }
    };

    const registerVoter = async (address, nationalID, area) => {
        try {
            await contract.registerVoter(address, nationalID, area);
            alert('Voter registered successfully!');
        } catch (error) {
            const errorMessage = error.data?.message || error.message;
            alert(`Error registering voter: ${errorMessage}`);
            console.error('Error registering voter:', error);
        }
    };

    const addArea = async (areaName, maxVoters) => {
        try {
            await contract.addArea(areaName, maxVoters);
            alert('Area added successfully!');
        } catch (error) {
            const errorMessage = error.data?.message || error.message;
            alert(`Error adding area: ${errorMessage}`);
            console.error('Error adding area:', error);
        }
    };

    const getTotalValidVotersByAllAreas = async () => {
        try {
            const [areas, validVotersCount] = await contract.getTotalValidVotersByAllAreas();
            if (areas && validVotersCount) {
                const areaData = areas.map((area, index) => ({
                    area,
                    count: validVotersCount[index].toString(),
                }));
                setVoterCountByArea(areaData);
            }
        } catch (error) {
            console.error('Error fetching total valid voters by areas:', error);
        }
    };

    const startVotingSession = async () => {
        try {
            await contract.startVoting();
            alert('Voting session started successfully!');
            setIsVotingStarted(true);
        } catch (error) {
            const errorMessage = error.data?.message || error.message;
            alert(`Error starting voting session: ${errorMessage}`);
            console.error('Error starting voting session:', error);
        }
    };

    const endVotingSession = async () => {
        try {
            await contract.endVoting();
            alert('Voting session ended successfully!');
            setIsVotingStarted(false);
            setIsVotingEnded(true);
        } catch (error) {
            console.error('Error:', error);
            const errorMessage = error.data?.message || error.message;
            alert(`Error ending voting session: ${errorMessage}`);
        }
    };

    // New function to reset the voting system
    const resetVotingSystem = async () => {
        try {
            await contract.resetVotingSystem();
            alert('Voting system reset successfully!');
            setIsVotingStarted(false);
            setIsVotingEnded(false);
            setVoterCountByArea([]); // Clear voter count data
        } catch (error) {
            const errorMessage = error.data?.message || error.message;
            alert(`Error resetting voting system: ${errorMessage}`);
            console.error('Error resetting voting system:', error);
        }
    };

    return (
        <div className="bg-[#FFE6D3] min-h-screen flex flex-col">
            <div className="fixed top-0 left-0 w-full z-10 shadow-md">
                <Navbar />
            </div>
            <div className="flex-grow pt-40 flex items-center justify-center">
                {isAdmin ? (
                    <div className="flex flex-col justify-center items-start gap-8 p-8">
                        {/* Start Voting Session */}
                        <div>
                            <h2 className="text-xl font-semibold mb-4 text-black">Manage Voting Session</h2>
                            <div className="flex justify-between gap-4">
                                <button
                                    onClick={startVotingSession}
                                    className={`p-2 w-48 ${isVotingStarted ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-500'} text-white`}
                                    disabled={isVotingStarted}
                                >
                                    Start Voting Session
                                </button>
                                <button
                                    onClick={endVotingSession}
                                    className={`p-2 w-48 ${!isVotingStarted ? 'bg-gray-500 cursor-not-allowed' : 'bg-red-500'} text-white`}
                                    disabled={!isVotingStarted}
                                >
                                    End Voting Session
                                </button>
                            </div>
                        </div>

                        {/* Reset Voting System */}
                        <div className="mt-4">
                            <button
                                onClick={resetVotingSystem}
                                className="p-2 w-48 bg-blue-500 text-white"
                            >
                                Reset Voting System
                            </button>
                        </div>

                        {/* Other Admin Functionalities */}
                        <div className="w-[800px] h-[360px] p-4 bg-white shadow-md rounded">
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

                        {/* Register Voter */}
                        <div className="w-[800px] h-[360px] p-4 bg-white shadow-md rounded">
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

                        {/* Add Area */}
                        <div className="w-[800px] h-[360px] p-4 bg-white shadow-md rounded">
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

                        {/* View Valid Voter Count by Area */}
                        <div className="w-[800px] h-[360px] p-4 bg-white shadow-md rounded">
                            <h2 className="text-xl font-semibold mb-4">View Valid Voter Count by Area</h2>
                            <button onClick={getTotalValidVotersByAllAreas} className="bg-[#F49B60] text-white p-2 w-full mt-4">Get Voter Count</button>

                            {voterCountByArea.length > 0 && (
                                <table className="w-full mt-4 border-collapse">
                                    <thead>
                                        <tr>
                                            <th className="border p-2">Area Name</th>
                                            <th className="border p-2">Valid Voter</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {voterCountByArea.map((areaData, index) => (
                                            <tr key={index}>
                                                <td className="border p-2">{areaData.area}</td>
                                                <td className="border p-2">{areaData.count}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-[#6B4E39] text-center text text-5xl">
                        <h1>You do not have access to this page.</h1>
                        <p>Only the admin can view this content.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
