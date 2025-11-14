import React, { useEffect, useState } from "react";

function Doctors() {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/doctors")
      .then((res) => res.json())
      .then((data) => setDoctors(data))
      .catch((err) => console.error("Error fetching doctors:", err));
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Top Banner */}
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
          <p className="text-center text-gray-500 text-lg">Loading doctors...</p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            {doctors.map((doctor) => (
              <div
                key={doctor.user_id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition duration-300 text-center"
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/387/387561.png"
                  alt="Doctor Avatar"
                  className="w-24 h-24 rounded-full mx-auto mb-4"
                />
                <h3 className="text-xl font-semibold text-[#2b0d0d] mb-1">
                  {doctor.name}
                </h3>
                <p className="text-gray-600 text-sm mb-2">{doctor.email}</p>
                <p className="text-gray-500 text-sm">{doctor.phone}</p>
                <p className="text-gray-500 text-sm mt-1">{doctor.address}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Doctors;
