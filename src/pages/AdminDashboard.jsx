import React from 'react';
import Navbar from '../components/Navbar';
const AdminDashboard = () => {
    return (
        <div>
            <div
                className={`fixed top-0 left-0 w-full z-10 shadow-md transition-all duration-300`}
            >
                <Navbar />
            </div>
            <div className="p-4 mt-24"> {/* Adjust the margin-top */}
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                {/* Additional content for the Admin Dashboard goes here */}
            </div>

        </div>
    );
};

export default AdminDashboard;
