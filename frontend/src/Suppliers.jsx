import React, { useEffect, useState } from "react";

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/suppliers")
      .then((res) => res.json())
      .then((data) => setSuppliers(data))
      .catch((err) => console.error("Error fetching suppliers:", err));
  }, []);

  // Function to join first and last name
  const getFullName = (supplier) => {
    if (supplier.first_name && supplier.last_name) {
      return `${supplier.first_name} ${supplier.last_name}`;
    } else if (supplier.first_name) {
      return supplier.first_name;
    } else if (supplier.last_name) {
      return supplier.last_name;
    } else {
      return "Contact Person";
    }
  };

  const supplierIcon = "https://cdn-icons-png.flaticon.com/512/3142/3142788.png";

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Top Banner */}
      <div className="w-full h-64 overflow-hidden bg-gradient-to-r from-teal-500 to-blue-600 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-5xl font-bold mb-4">Our Suppliers</h1>
          <p className="text-xl">Quality Partners in Healthcare</p>
        </div>
      </div>

      <h2 className="text-3xl font-bold text-center text-gray-800 mt-8 mb-4">
        Trusted Healthcare Suppliers
      </h2>

      <div className="max-w-6xl mx-auto px-6 pb-12">
        {suppliers.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">Loading suppliers...</p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            {suppliers.map((supplier) => (
              <div
                key={supplier.supplier_id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition duration-300 text-center border border-teal-100"
              >
                <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-teal-50 flex items-center justify-center border-4 border-teal-200">
                  <img
                    src={supplierIcon}
                    alt="Supplier Icon"
                    className="w-16 h-16 object-contain"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-1">
                  {supplier.company_name || "Supplier Company"}
                </h3>
                <p className="text-gray-600 text-sm mb-2">
                  <span className="font-semibold text-teal-600">Contact Person:</span> {getFullName(supplier)}
                </p>
                <p className="text-gray-500 text-sm break-words">
                  <span className="font-semibold text-blue-600">Email:</span> {supplier.email}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  <span className="font-semibold text-blue-600">Phone:</span> {supplier.phone}
                </p>
                {supplier.address && (
                  <p className="text-gray-500 text-sm mt-1">
                    <span className="font-semibold text-teal-600">Address:</span> {supplier.address}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Suppliers;