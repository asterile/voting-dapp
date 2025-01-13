import React from 'react'
import Navbar from '../components/Navbar';
const VoterPage = () => {
  return (
    <div>
        <div
          className={`fixed top-0 left-0 w-full z-10 shadow-md transition-all duration-300`} 
        >
          <Navbar />
        </div>
        <div>Voter Page</div>
  
    </div>
  )
}

export default VoterPage