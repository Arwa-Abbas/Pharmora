
import React from 'react';
import { getFullName } from '../../utils/formatters';

function DoctorCard({ doctor }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition duration-300 text-center">
      <img
        src="https://cdn-icons-png.flaticon.com/512/387/387561.png"
        alt="Doctor Avatar"
        className="w-24 h-24 rounded-full mx-auto mb-4"
      />
      <h3 className="text-xl font-semibold text-[#2b0d0d] mb-1">
        {getFullName(doctor)}
      </h3>
      <p className="text-gray-600 text-sm mb-2">{doctor.email}</p>
      <p className="text-gray-500 text-sm">{doctor.phone}</p>
      <p className="text-gray-500 text-sm mt-1">{doctor.address}</p>
      {doctor.specialty && (
        <p className="text-blue-600 text-sm mt-2 font-medium">
          Specialty: {doctor.specialty}
        </p>
      )}
    </div>
  );
}

export default DoctorCard;