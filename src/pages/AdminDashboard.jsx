import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { ethers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import VotingSystem from '../artifacts/contracts/VotingSystem.sol/VotingSystem.json';

const AdminDashboard = () => {
    const [contract, setContract] = useState(null);
    const [voterCountByArea, setVoterCountByArea] = useState([]);
    const [areaName, setAreaName] = useState('');

    useEffect(() => {
        const loadBlockchainData = async () => {
            if (typeof window.ethereum !== 'undefined') {
                const provider = new Web3Provider(window.ethereum);
                const signer = provider.getSigner(0);
                const contractAddress = '0xdc64a140aa3e981100a9beca4e685f962f0cf6c9'; // Replace with your contract address
                const contract = new ethers.Contract(contractAddress, VotingSystem.abi, signer);
                console.log(VotingSystem.abi);
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

    const getTotalValidVotersByAllAreas = async () => {
        try {
            // Log before calling the contract method
            console.log('Calling getTotalValidVotersByAllAreas...');
            
            // Call the contract method
            const [areas, validVotersCount] = await contract.getTotalValidVotersByAllAreas();
            
            // Log the raw output from the contract
            console.log('Raw areas:', areas);
            console.log('Raw validVotersCount:', validVotersCount);
            
            // Ensure both areas and validVotersCount have values
            if (areas && validVotersCount) {
                // Map the areas and counts to an array of objects
                const areaData = areas.map((area, index) => ({
                    area,
                    count: validVotersCount[index].toString(), // Ensure count is a string
                }));
                
                // Log the mapped data
                console.log('Mapped area data:', areaData);
                
                // Update state with the result
                setVoterCountByArea(areaData);
            } else {
                console.log('No data returned from contract call.');
            }
        } catch (error) {
            // Log the error for debugging
            console.error('Error fetching total valid voters by areas:', error);
        }
    };
    

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

                    <div className="w-[600px] h-[360px] p-4 bg-white shadow-md rounded">
                        <h2 className="text-xl font-semibold mb-4">View Valid Voter Count by Area</h2>
                        <button onClick={getTotalValidVotersByAllAreas} className="bg-[#F49B60] text-white p-2 w-full mt-4">Get Voter Count</button>
                        
                        {voterCountByArea.length > 0 && (
                            <table className="w-full mt-4 border-collapse">
                                <thead>
                                    <tr>
                                        <th className="border p-2">Area Name</th>
                                        <th className="border p-2">Voter Count</th>
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
            </div>
        </div>
    );
};

export default AdminDashboard;
