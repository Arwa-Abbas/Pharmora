// pages/Doctors.jsx
import React, { useEffect, useState } from "react";
import userService from "../services/userService";
import DoctorCard from "../components/doctors/DoctorCard";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorMessage from "../components/common/ErrorMessage";

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const data = await userService.getAllDoctors();
        setDoctors(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching doctors:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" color="blue" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="w-full h-64 overflow-hidden">
        <img
          src="/images/doctors.jpg"
          alt="Doctors Banner"
          className="w-full h-full object-cover"
        />
      </div>

      <h2 className="text-3xl font-bold text-center text-[#2b0d0d] mt-8 mb-4">
        Our Certified Doctors
      </h2>

      <div className="max-w-6xl mx-auto px-6 pb-12">
        {doctors.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">No doctors found</p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            {doctors.map((doctor) => (
              <DoctorCard key={doctor.user_id} doctor={doctor} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Doctors;