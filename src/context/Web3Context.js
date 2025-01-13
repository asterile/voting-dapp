// src/context/Web3Context.js
import React, { createContext, useEffect, useState } from 'react';
import Web3 from 'web3';

export const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
    const [web3, setWeb3] = useState(null);
    const [accounts, setAccounts] = useState([]);

    useEffect(() => {
        const initWeb3 = async () => {
            let web3;

            if (window.ethereum) {
                web3 = new Web3(window.ethereum);
                try {
                    await window.ethereum.request({ method: 'eth_requestAccounts' });
                    const accounts = await web3.eth.getAccounts();
                    setAccounts(accounts);
                } catch (error) {
                    console.error("User denied account access", error);
                }
            } else if (window.web3) {
                web3 = new Web3(window.web3.currentProvider);
            } else {
                const provider = new Web3.providers.HttpProvider('http://localhost:8545');
                web3 = new Web3(provider);
            }

            setWeb3(web3);
        };

        initWeb3();
    }, []);

    return (
        <Web3Context.Provider value={{ web3, accounts }}>
            {children}
        </Web3Context.Provider>
    );
};
