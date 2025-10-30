import React from "react";

const StudentWelcomeBanner = () => {
  return (
    <div className="bg-blue-50 w-full py-8 px-6 flex items-center rounded-lg shadow-sm">
      <img
        src="https://via.placeholder.com/64"
        alt="User Avatar"
        className="w-16 h-16 rounded-full object-cover mr-6"
      />
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-1">Welcome back, John Doe!</h2>
        <p className="text-gray-600 text-lg">CS • CGPA: 8.5 • Class of 2024</p>
      </div>
    </div>
  );
};

export default StudentWelcomeBanner;


