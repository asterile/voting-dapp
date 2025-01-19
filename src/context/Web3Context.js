import React, { createContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import VotingSystem from '../artifacts/contracts/VotingSystem.sol/VotingSystem.json';

export const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [currentAddress, setCurrentAddress] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const initWeb3 = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          // Use the proper provider for v6
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner(); // Await here for the signer
          const contractAddress = '0xc69Ba33F7f8963b174f4A1B2F43De72AeD950daa'; // Replace with your contract address
          const contract = new ethers.Contract(contractAddress, VotingSystem.abi, signer);

          setWeb3(provider);
          setContract(contract);

          // Get the current account address
          const address = await signer.getAddress(); // Await here for the address
          setCurrentAddress(address);

          // Check if the user is an admin
          const adminAddress = '0x2803D1148522097352772680eb23196e62e372f7'; // Replace with actual admin address
          if (address.toLowerCase() === adminAddress.toLowerCase()) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error('Error initializing web3:', error);
        }
      } else {
        console.error('Ethereum object not found! Make sure MetaMask is installed.');
      }
    };

    initWeb3();
  }, []);

  return (
    <Web3Context.Provider value={{ web3, contract, currentAddress, isAdmin }}>
      {children}
    </Web3Context.Provider>
  );
};
