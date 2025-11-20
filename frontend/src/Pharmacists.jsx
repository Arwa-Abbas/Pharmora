import React, { useEffect, useState } from "react";
import { FaPills, FaClinicMedical, FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

function Pharmacists() {
  const [pharmacists, setPharmacists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPharmacists = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5000/api/pharmacists");
        
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }
        
        const data = await response.json();
        setPharmacists(data);
      } catch (err) {
        console.error("Error fetching pharmacists:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPharmacists();
  }, []);

  // Function to get full name with fallbacks
  const getFullName = (pharmacist) => {
    if (pharmacist.first_name && pharmacist.last_name) {
      return `${pharmacist.first_name} ${pharmacist.last_name}`;
    } else if (pharmacist.full_name) {
      return pharmacist.full_name;
    } else if (pharmacist.name) {
      return pharmacist.name;
    } else {
      return "Pharmacist Name";
    }
  };

  // Function to get pharmacy name with fallback
  const getPharmacyName = (pharmacist) => {
    return pharmacist.pharmacy_name || pharmacist.pharmacyName || "Pharmacy";
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="text-gray-600 mt-4 text-lg">Loading pharmacists...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-lg">Error loading pharmacists</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* ✅ Original Banner - Kept the same */}
      <div className="w-full h-64 overflow-hidden">
        <img
          src="/images/pharmacists.jpg"
          alt="Pharmacists Banner"
          className="w-full h-full object-cover"
        />
      </div>

      <h2 className="text-3xl font-bold text-center text-[#2b0d0d] mt-8 mb-4">
        Our Certified Pharmacists
      </h2>

      <div className="max-w-6xl mx-auto px-6 pb-12">
        {pharmacists.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No pharmacists found.</p>
            <p className="text-gray-400 text-sm mt-2">
              There are currently no pharmacists registered in the system.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            {pharmacists.map((pharmacist) => (
              <div
                key={pharmacist.user_id || pharmacist.pharmacist_id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition duration-300 text-center"
              >
                {/* Pharmacist Icon - Using FaPills which is more relevant */}
                <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-blue-50 flex items-center justify-center border-4 border-blue-200">
                  <FaPills className="w-12 h-12 text-blue-600" />
                </div>
                
                {/* Pharmacist Name */}
                <h3 className="text-xl font-semibold text-[#2b0d0d] mb-1">
                  {getFullName(pharmacist)}
                </h3>
                
                {/* Pharmacy Name */}
                <div className="flex items-center justify-center gap-2 text-blue-600 font-medium text-sm mb-3">
                  <FaClinicMedical className="w-4 h-4" />
                  <span>{getPharmacyName(pharmacist)}</span>
                </div>
                
                {/* Contact Information */}
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

                {/* Additional Information */}
                {(pharmacist.city || pharmacist.country) && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-gray-400 text-xs">
                      {pharmacist.city}{pharmacist.city && pharmacist.country ? ', ' : ''}
                      {pharmacist.country}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Pharmacists;