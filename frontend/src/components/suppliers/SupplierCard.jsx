// components/suppliers/SupplierCard.jsx
import React from 'react';
import { getFullName } from '../../utils/formatters';

function SupplierCard({ supplier }) {
  const supplierIcon = "https://cdn-icons-png.flaticon.com/512/3142/3142788.png";

  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition duration-300 text-center border border-teal-100">
      <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-teal-50 flex items-center justify-center border-4 border-teal-200">
        <img src={supplierIcon} alt="Supplier Icon" className="w-16 h-16 object-contain" />
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
  );
}

export default SupplierCard;