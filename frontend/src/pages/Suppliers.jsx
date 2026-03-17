
import React, { useEffect, useState } from "react";
import { FiMail, FiPhone, FiMapPin, FiSearch, FiBox } from "react-icons/fi";
import userService from "../services/userService";
import { getFullName } from "../utils/formatters";

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    userService.getAllSuppliers()
      .then(setSuppliers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = suppliers.filter(s =>
    (s.company_name || "").toLowerCase().includes(search.toLowerCase()) ||
    getFullName(s).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Hero */}
      <div className="relative pt-28 pb-16 px-8 bg-gradient-to-r from-cyan-600 to-teal-600 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto text-center relative">
          <span className="inline-block text-sm font-semibold text-cyan-700 bg-white/90 px-4 py-1.5 rounded-full tracking-wide uppercase mb-4">
            Supply Partners
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Our Trusted Suppliers</h1>
          <p className="text-white/80 text-lg max-w-xl mx-auto mb-8">
            Quality-certified suppliers powering our pharmacy network with reliable stock and fast delivery.
          </p>
          <div className="max-w-md mx-auto relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by company or contact name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border-0 rounded-full shadow-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-7xl mx-auto px-8 py-14">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-600" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-400 text-lg py-20">No suppliers found.</p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((supplier) => (
              <div key={supplier.user_id} className="flex">
                <div className="bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 p-8 flex flex-col items-center w-full">
                  <div className="flex flex-col items-center flex-1">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center mb-5 shadow-lg flex-shrink-0">
                      <FiBox className="text-white" size={38} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1 text-center">
                      {supplier.company_name || "Supplier Company"}
                    </h3>
                    <div className="h-8 flex items-center justify-center">
                      <span className="inline-block text-sm font-semibold text-cyan-700 bg-cyan-50 px-3 py-1 rounded-full">
                        {getFullName(supplier)}
                      </span>
                    </div>
                  </div>
                  <div className="w-full space-y-2.5 mt-5 pt-5 border-t border-gray-100 text-left">
                    <div className="flex items-center gap-2.5 text-gray-500 text-sm min-h-[20px]">
                      <FiMail size={15} className="text-cyan-500 flex-shrink-0" />
                      <span className="truncate">{supplier.email || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-gray-500 text-sm min-h-[20px]">
                      <FiPhone size={15} className="text-teal-500 flex-shrink-0" />
                      <span>{supplier.phone || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-gray-500 text-sm min-h-[20px]">
                      <FiMapPin size={15} className="text-teal-400 flex-shrink-0" />
                      <span className="truncate">{supplier.address || "—"}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Suppliers;
