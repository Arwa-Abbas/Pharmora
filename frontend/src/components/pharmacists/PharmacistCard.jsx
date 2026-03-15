// components/pharmacists/PharmacistCard.jsx
import React from 'react';
import { FaPills, FaClinicMedical, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { getFullName } from '../../utils/formatters';

function PharmacistCard({ pharmacist }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition duration-300 text-center">
      <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-blue-50 flex items-center justify-center border-4 border-blue-200">
        <FaPills className="w-12 h-12 text-blue-600" />
      </div>
      
      <h3 className="text-xl font-semibold text-[#2b0d0d] mb-1">
        {getFullName(pharmacist)}
      </h3>
      
      <div className="flex items-center justify-center gap-2 text-blue-600 font-medium text-sm mb-3">
        <FaClinicMedical className="w-4 h-4" />
        <span>{pharmacist.pharmacy_name || "Pharmacy"}</span>
      </div>
      
      <div className="space-y-2 text-sm">
        {pharmacist.email && (
          <div className="flex items-center gap-2 text-gray-600">
            <FaEnvelope className="w-4 h-4 text-blue-500" />
            <span className="break-words">{pharmacist.email}</span>
          </div>
        )}
        
        {pharmacist.phone && (
          <div className="flex items-center gap-2 text-gray-500">
            <FaPhone className="w-4 h-4 text-green-500" />
            <span>{pharmacist.phone}</span>
          </div>
        )}
        
        {pharmacist.address && (
          <div className="flex items-start gap-2 text-gray-500">
            <FaMapMarkerAlt className="w-4 h-4 text-red-500 mt-0.5" />
            <span className="text-left">{pharmacist.address}</span>
          </div>
        )}
      </div>

      {(pharmacist.city || pharmacist.country) && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-gray-400 text-xs">
            {pharmacist.city}{pharmacist.city && pharmacist.country ? ', ' : ''}
            {pharmacist.country}
          </p>
        </div>
      )}
    </div>
  );
}

export default PharmacistCard;