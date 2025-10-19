import React, { useEffect, useState } from "react";
import { ShoppingCart, Heart } from "lucide-react";

function Products() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/products")
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-8 text-center text-[#2b0d0d]">
        Our Products
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {items.map((item) => (
          <div
            key={item.product_id || item.medicine_id}
            className="bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-2xl transition transform hover:-translate-y-2 duration-300"
          >
            <img
              src={item.image_url || "https://zplcialirnvkdbmwslyc.supabase.co/storage/v1/object/public/products/default-medicine.jpg"}
              alt={item.product_name || item.name}
              className="w-full h-48 object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://zplcialirnvkdbmwslyc.supabase.co/storage/v1/object/public/products/default-medicine.jpg";
              }}
            />
            <div className="p-6">
              <h3 className="text-xl font-semibold text-[#2b0d0d] mb-2">
                {item.product_name || item.name}
              </h3>
              <p className="text-gray-600 mb-4">{item.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-green-700">
                  Rs. {item.price}
                </span>
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
