import React, { useContext, useState, useEffect } from 'react';
import { Web3Context } from '../context/Web3Context';
import Navbar from '../components/Navbar';

const HomePage = () => {
  const { web3, contract } = useContext(Web3Context);
  const [nationalID, setNationalID] = useState('');
  const [area, setArea] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState('');

  const [message, setMessage] = useState('');
  const [votingStarted, setVotingStarted] = useState(false);
  const [votingEnded, setVotingEnded] = useState(false);
  const [areaEntered, setAreaEntered] = useState(false); // Manage visibility of area input
  const [nationalIDValid, setNationalIDValid] = useState(false); // Track National ID validation

  // Effect to check the voting status when the component loads
  useEffect(() => {
    const checkVotingStatus = async () => {
      if (contract) {
        try {
          const votingStatus = await contract.votingStarted();
          const votingEndStatus = await contract.votingEnded();
          setVotingStarted(votingStatus);
          setVotingEnded(votingEndStatus);
        } catch (error) {
          console.error('Error fetching voting status:', error);
        }
      }
    };

    checkVotingStatus();
  }, [contract]);

  // Step 1: Validate National ID using smart contract's voter mapping
  const validateNationalID = async () => {
    if (!nationalID) {
      alert('Please enter your National ID.');
      return;
    }

    try {
      const signer = await web3.getSigner(); // Get the signer
      const address = await signer.getAddress(); // Get the address of the current account

      if (!address) {
        alert('No account found. Please connect your wallet.');
        return;
      }

      const voter = await contract.voters(address); // Retrieve the current voter from the contract
      if (voter.nationalID === nationalID) {
        setNationalIDValid(true);
        setMessage('National ID validated successfully. Please enter your area.');
      } else {
        setMessage('Invalid National ID. Please try again.');
      }
    } catch (error) {
      console.error('Error validating National ID:', error);
      setMessage('An error occurred while validating your National ID.');
    }
  };

  // Step 2: Handle Area Submission
  const handleAreaSubmit = () => {
    if (!area) {
      alert('Please enter your area.');
      return;
    }

    setAreaEntered(true); // Set the area entered flag to true and fetch candidates
  };

  // Step 3: Fetch Candidates for the Area
  useEffect(() => {
    const fetchCandidates = async () => {
      if (area && contract) {
        try {
          const [areaCandidates, candidateNames] = await contract.getCandidatesByArea(area);
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

    if (areaEntered) {
      fetchCandidates();
    }
  }, [areaEntered, area, contract]);

  // Step 4: Handle Vote Submission
  const handleVote = async () => {
    if (!selectedCandidate) {
      alert('Please enter a candidate name.');
      return;
    }

    // Check if entered name matches any candidate
    const candidate = candidates.find((candidate) => candidate.candidateName.toLowerCase() === selectedCandidate.toLowerCase());
    if (!candidate) {
      alert('No candidate found with that name. Please enter a valid candidate name.');
      return;
    }

    // Validate if the selected candidate belongs to the same area as the user
   /* const selectedCandidateArea = await contract.getCandidateArea(candidate.candidateID); // Assuming contract has this method
    if (selectedCandidateArea !== area) {
      alert('The selected candidate does not belong to your area. Please select a candidate from your area.');
      return;
    }*/

    try {
      const signer = await web3.getSigner(); // Get the signer
      const address = await signer.getAddress(); // Get the address of the current account
      console.log(address); 
      console.log(nationalID);
      await contract.vote(candidate.candidateName, nationalID, area);
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

        {votingEnded ? (
          <p className="text-red-500 mt-4">The voting session has ended. Thank you for participating.</p>
        ) : !votingStarted ? (
          <p className="text-red-500 mt-4">The voting session has not started. Please visit again when the voting starts.</p>
        ) : (
          <>
            {!nationalIDValid ? (
              <div>
                <h2 className="text-xl font-semibold mt-4">Enter Your National ID</h2>
                <input
                  type="text"
                  placeholder="Enter your National ID"
                  value={nationalID}
                  onChange={(e) => setNationalID(e.target.value)}
                  className="border p-2 rounded mt-2 w-full"
                />
                <button
                  onClick={validateNationalID}
                  className="bg-blue-500 text-white p-2 rounded mt-4"
                >
                  Validate National ID
                </button>
              </div>
            ) : !areaEntered ? (
              <div>
                <h2 className="text-xl font-semibold mt-4">Enter Your Voting Area</h2>
                <input
                  type="text"
                  placeholder="Enter your area"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="border p-2 rounded mt-2 w-full"
                />
                <button
                  onClick={handleAreaSubmit}
                  className="bg-blue-500 text-white p-2 rounded mt-4"
                >
                  Submit Area
                </button>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-semibold mt-4">Candidate List for {area}</h2>
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
                  <h2 className="text-xl font-semibold">Enter the Name of Your Candidate</h2>
                  <input
                    type="text"
                    value={selectedCandidate}
                    onChange={(e) => setSelectedCandidate(e.target.value)}
                    placeholder="Enter candidate name"
                    className="border p-2 rounded mt-2 w-full"
                  />
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
