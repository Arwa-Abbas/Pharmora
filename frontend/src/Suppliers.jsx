import React, { useEffect, useState } from "react";

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/suppliers")
      .then((res) => res.json())
      .then((data) => setSuppliers(data))
      .catch((err) => console.error("Error fetching suppliers:", err));
  }, []);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-8 text-center text-[#2b0d0d]">
        Our Suppliers
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {suppliers.map((supplier) => (
          <div
            key={supplier.supplier_id}
            className="bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-2xl transition transform hover:-translate-y-2 duration-300"
          >
            <div className="p-6">
              <h3 className="text-xl font-semibold text-[#2b0d0d] mb-2">
                {supplier.name}
              </h3>
              <p className="text-gray-700 mb-2">
                <span className="font-semibold">Contact Person:</span>{" "}
                {supplier.contact_person}
              </p>
              <p className="text-gray-700 mb-2">
                <span className="font-semibold">Email:</span> {supplier.email}
              </p>
              <p className="text-gray-700 mb-2">
                <span className="font-semibold">Phone:</span> {supplier.phone}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Address:</span>{" "}
                {supplier.address}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Suppliers;
