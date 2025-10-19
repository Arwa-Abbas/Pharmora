import React from "react";
import { ShoppingCart, Heart } from "lucide-react";

function Products() {
  const items = [
    {
      id: 1,
      name: "Paracetamol 500mg",
      desc: "Pain reliever and fever reducer.",
      price: "Rs. 250",
      img: "/images/paracetamol.jpg"
    },
    {
      id: 2,
      name: "Amoxicillin 250mg",
      desc: "Antibiotic for bacterial infections.",
      price: "Rs. 600",
      img: "/images/amoxicillin.jpeg"
    },
    {
      id: 3,
      name: "Vitamin C 1000mg",
      desc: "Boosts immunity and energy.",
      price: "Rs. 350",
      img: "/images/vitamin-c.jpeg"
    }
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-8 text-center text-[#2b0d0d]">
        Our Products
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-2xl transition transform hover:-translate-y-2 duration-300"
          >
            <img src={item.img} alt={item.name} className="w-full h-48 object-cover" />
            <div className="p-6">
              <h3 className="text-xl font-semibold text-[#2b0d0d] mb-2">{item.name}</h3>
              <p className="text-gray-600 mb-4">{item.desc}</p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-green-700">{item.price}</span>
                <div className="flex space-x-3">
                  <button className="p-2 bg-[#2b0d0d] text-white rounded-lg hover:bg-black transition">
                    <ShoppingCart size={20} />
                  </button>
                  <button className="p-2 border border-[#2b0d0d] rounded-lg hover:bg-red-100 transition">
                    <Heart size={20} className="text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Products;
