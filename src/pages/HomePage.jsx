// src/pages/HomePage.jsx
import React, { useContext, useState, useEffect } from 'react';
import { Web3Context } from '../context/Web3Context';
import Navbar from '../components/Navbar';

const HomePage = () => {
  const { web3, contract } = useContext(Web3Context);
  const [selectedArea, setSelectedArea] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [voterID, setVoterID] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [message, setMessage] = useState('');
  const [votingStarted, setVotingStarted] = useState(false);

  useEffect(() => {
    const checkVotingStatus = async () => {
      if (contract) {
        try {
          const status = await contract.methods.votingStarted().call();
          setVotingStarted(status);
        } catch (error) {
          console.error('Error fetching voting status:', error);
        }
      }
    };

    checkVotingStatus();
  }, [contract]);

  useEffect(() => {
    const fetchCandidates = async () => {
      if (selectedArea && contract) {
        try {
          const [areaCandidates, candidateNames] = await contract.methods.getCandidatesByArea(selectedArea).call();
          const candidateData = areaCandidates.map((address, index) => ({
            candidateID: address,
            candidateName: candidateNames[index],
          }));
          setCandidates(candidateData);
        } catch (error) {
          console.error('Error fetching candidates:', error);
        }
      }
    };

    fetchCandidates();
  }, [selectedArea, contract]);

  const handleVote = async () => {
    if (!voterID || !selectedCandidate) {
      alert('Please enter your Voter ID and select a candidate.');
      return;
    }

    try {
      const accounts = await web3.eth.getAccounts();
      await contract.methods.vote(selectedCandidate, voterID, selectedArea).send({ from: accounts[0] });
      setMessage('Vote successfully cast!');
    } catch (error) {
      console.error('Error submitting vote:', error);
      setMessage('An error occurred while casting your vote.');
    }
  };

  return (
    <div>
      <div className={`fixed top-0 left-0 w-full z-10 shadow-md transition-all duration-300`}>
        <Navbar />
      </div>
      <div className="p-4 mt-24">
        <h1 className="text-2xl font-bold">Welcome to the Voting System</h1>
        {!votingStarted ? (
          <p className="text-red-500 mt-4">
            The voting session has not started. Please visit again when the voting starts.
          </p>
        ) : (
          <>
            <div>
              <h2 className="text-xl font-semibold mt-4">Enter Your Voting Area</h2>
              <input
                type="text"
                placeholder="Enter your area"
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                required
                className="border p-2 rounded mt-2 w-full"
              />
            </div>

            {selectedArea && (
              <div>
                <h2 className="text-xl font-semibold mt-4">Candidate List for {selectedArea}</h2>
                {candidates.length > 0 ? (
                  <ul className="list-disc pl-6 mt-2">
                    {candidates.map((candidate) => (
                      <li key={candidate.candidateID}>
                        {candidate.candidateName}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No candidates available in this area.</p>
                )}

                <div className="mt-4">
                  <h2 className="text-xl font-semibold">Vote for Your Candidate</h2>
                  <input
                    type="text"
                    placeholder="Enter Your Voter ID"
                    value={voterID}
                    onChange={(e) => setVoterID(e.target.value)}
                    required
                    className="border p-2 rounded mt-2 w-full"
                  />
                  <br />
                  <select
                    value={selectedCandidate}
                    onChange={(e) => setSelectedCandidate(e.target.value)}
                    required
                    className="border p-2 rounded mt-2 w-full"
                  >
                    <option value="">Select a Candidate</option>
                    {candidates.map((candidate) => (
                      <option key={candidate.candidateID} value={candidate.candidateID}>
                        {candidate.candidateName}
                      </option>
                    ))}
                  </select>
                  <br />
                  <button onClick={handleVote} className="bg-yellow-500 text-white p-2 rounded mt-4">
                    Submit Vote
                  </button>
                </div>
              </div>
            )}

            {message && <p className="text-green-500 mt-4">{message}</p>}
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;
