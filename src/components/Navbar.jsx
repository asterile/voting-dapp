import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { logo_vote, more, close } from '../assets'; // Assuming you have logo and icons for dots and close

const navLinks = [
  { id: "home", title: "Home", path: "/" },
  { id: "admin", title: "Admin Dashboard", path: "/admin" },
  { id: "vote", title: "Voter Page", path: "/vote" },
];

const Navbar = () => {
  const [toggle, setToggle] = useState(false);

  return (
    <nav className="w-full flex justify-between items-center bg-[#FFDBD0]">
      <Link to="/">
        <img src={logo_vote} alt="Logo" className="w-[195px] h-[90px] ml-3" /> {/* Adjusted logo size */}
      </Link>

      {/* Desktop Menu */}
      <ul className="list-none sm:flex hidden justify-end items-center flex-1 mr-3">
        {navLinks.map((nav, index) => (
          <li key={nav.id} className={`font-poppins font-normal cursor-pointer text-[16px] ${index === navLinks.length - 1 ? 'mr-0' : 'mr-10'} text-black`}>
            <Link to={nav.path} className="hover:text-red-100">
              {nav.title}
            </Link>
          </li>
        ))}
      </ul>

      {/* Mobile Menu Toggle */}
      <div className="sm:hidden flex flex-1 justify-end items-center">
        <img
          src={toggle ? close : more}
          alt="menu"
          className="w-[30px] h-[30px] object-contain" 
          onClick={() => setToggle((prev) => !prev)}
        />

        {/* Mobile Dropdown Menu */}
        <div className={`${toggle ? 'flex' : 'hidden'} p-6 bg-gradient-to-r from-gray-700 via-black to-gray-700 absolute top-20 right-0 mx-4 my-2 min-w-[140px] rounded-xl sidebar`}>
          <ul className="list-none flex flex-col justify-end items-center flex-1">
            {navLinks.map((nav, index) => (
              <li key={nav.id} className={`font-poppins font-normal cursor-pointer text-[16px] ${index === navLinks.length - 1 ? 'mr-0' : 'mb-4'} text-white`}>
                <Link to={nav.path} className="hover:text-gray-300">
                  {nav.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
