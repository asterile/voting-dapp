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
  const [areaEntered, setAreaEntered] = useState(false);
  const [nationalIDValid, setNationalIDValid] = useState(false);
  const [winner, setWinner] = useState(null); // To store the winner details

  // Effect to check the voting status when the component loads
  useEffect(() => {
    const checkVotingStatus = async () => {
      if (contract) {
        try {
          const votingStatus = await contract.votingStarted();
          const votingEndStatus = await contract.votingEnded();
          setVotingStarted(votingStatus);
          setVotingEnded(votingEndStatus);
          console.log('Voting status:', votingStatus);
          console.log('Voting end status:', votingEndStatus);
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
      const signer = await web3.getSigner();
      const address = await signer.getAddress();

      if (!address) {
        alert('No account found. Please connect your wallet.');
        return;
      }

      const voter = await contract.voters(address);
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

    const candidate = candidates.find(
      (candidate) => candidate.candidateName.toLowerCase() === selectedCandidate.toLowerCase()
    );
    if (!candidate) {
      alert('No candidate found with that name. Please enter a valid candidate name.');
      return;
    }

    try {
      const signer = await web3.getSigner();
      const address = await signer.getAddress();
      console.log(address);
      console.log(nationalID);
      await contract.vote(candidate.candidateName, nationalID, area);
      setMessage('Vote successfully cast!');
    } catch (error) {
      const errorMessage = error.data?.message || error.message;
      alert(`Error: ${errorMessage}`);
      console.error('Error submitting vote:', error);
      setMessage('An error occurred while casting your vote.');
    }
  };

  // Handle fetching the winner for the entered area
  const getWinnerByArea = async () => {
    if (!area) {
      alert('Please enter your area.');
      return;
    }

    try {
      const winnerData = await contract.getWinnerByArea(area); // Assuming contract returns address, name, and votes
      const [winnerAddress, winnerName, totalVotes] = winnerData;

      setWinner({
        address: winnerAddress,
        name: winnerName,
        votes: totalVotes,
      });
    } catch (error) {
      console.error('Error fetching winner:', error);
      setWinner('An error occurred while fetching the winner.');
    }
  };

  return (
    <div className='bg-[#FFE6D3] min-h-screen flex flex-col items-center'>
      <div className={`fixed top-0 left-0 w-full z-10 shadow-md transition-all duration-300`}>
        <Navbar />
      </div>
      <div className="p-4 mt-44 w-[800px] mx-auto flex flex-col items-center">
        <h1 className="text-5xl text-center text-[#6B4E39] font-bold">Welcome to the Voting System</h1>

        {votingEnded ? (
          <>
            <p className="text-black mt-4 text-center text-3xl">The voting session has ended. Thank you for participating.</p>
            <div className="bg-white p-6 rounded-lg shadow-md mt-6">
              <h2 className="text-xl font-semibold">Enter Your Area to Get the Winner</h2>
              <input
                type="text"
                placeholder="Enter your area"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="border p-2 rounded mt-2 w-full"
              />
              <button
                onClick={getWinnerByArea}
                className="bg-[#F49B60] text-white p-2 rounded mt-4 w-full"
              >
                Get Winner
              </button>
            </div>
          </>
        ) : !votingStarted ? (
          <p className="text-black mt-4 text-center text-3xl">The voting session has not started. Please visit again when the voting starts.</p>
        ) : (
          <>
            {!nationalIDValid ? (
              <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                <h2 className="text-xl font-semibold">Enter Your National ID</h2>
                <input
                  type="text"
                  placeholder="Enter your National ID"
                  value={nationalID}
                  onChange={(e) => setNationalID(e.target.value)}
                  className="border p-2 rounded mt-2 w-full"
                />
                <button
                  onClick={validateNationalID}
                  className="bg-[#F49B60] text-white p-2 rounded mt-4 w-full"
                >
                  Validate National ID
                </button>
              </div>
            ) : !areaEntered ? (
              <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                <h2 className="text-xl font-semibold">Enter Your Voting Area</h2>
                <input
                  type="text"
                  placeholder="Enter your area"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="border p-2 rounded mt-2 w-full"
                />
                <button
                  onClick={handleAreaSubmit}
                  className="bg-[#F49B60] text-white p-2 rounded mt-4 w-full"
                >
                  Submit Area
                </button>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                <h2 className="text-xl font-semibold">Candidate List for {area}</h2>
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
                  <button onClick={handleVote} className="bg-[#F49B60] text-white p-2 rounded mt-4 w-full">
                    Submit Vote
                  </button>
                </div>
              </div>
            )}

            {message && <p className="text-green-500 mt-4">{message}</p>}
          </>
        )}

        {/* Show the winner details in a new div */}
        {winner && (
          <div className="bg-white p-6 rounded-lg shadow-md mt-6">
            <h2 className="text-xl font-semibold">Elected Representative for {area}</h2>
            <p className="mt-2"><strong>Name:</strong> {winner.name}</p>
            <p className="mt-2"><strong>Address:</strong> {winner.address}</p>
            <p className="mt-2"><strong>Total Votes:</strong> {winner.votes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
