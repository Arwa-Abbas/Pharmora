import React, { useEffect, useState } from "react";
import { ShoppingCart, Heart, CheckCircle } from "lucide-react";

function Products() {
  const [medicines, setMedicines] = useState([]);
  const [addedToCart, setAddedToCart] = useState({});
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetch("http://localhost:5000/medicines")
      .then((res) => res.json())
      .then((data) => setMedicines(data))
      .catch((err) => console.error("Error fetching medicines:", err));
  }, []);

  const handleAddToCart = async (medicine) => {
    if (!user) {
      alert("Please login to add items to cart");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          medicine_id: medicine.medicine_id,
          quantity: 1,
        }),
      });

      if (response.ok) {
        setAddedToCart({ ...addedToCart, [medicine.medicine_id]: true });
        setTimeout(() => {
          setAddedToCart({ ...addedToCart, [medicine.medicine_id]: false });
        }, 2000);
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert("Failed to add to cart");
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">
        Available Medicines
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {medicines.map((item) => (
          <div
            key={item.medicine_id}
            className="bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-2xl transition transform hover:-translate-y-2 duration-300"
          >
            <img
              src={
                item.image_url ||
                "https://zplcialirnvkdbmwslyc.supabase.co/storage/v1/object/public/products/default-medicine.jpg"
              }
              alt={item.name}
              className="w-full h-48 object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://zplcialirnvkdbmwslyc.supabase.co/storage/v1/object/public/products/default-medicine.jpg";
              }}
            />
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {item.name}
              </h3>
              <p className="text-sm text-gray-500 mb-3">
                Category: {item.category || "General"}
              </p>
              <p className="text-gray-700 mb-4 line-clamp-2">
                {item.description || "No description available."}
              </p>

              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-bold text-green-700">
                  Rs. {item.price}
                </span>
                <span
                  className={`text-sm ${
                    item.stock > 0 ? "text-blue-600" : "text-red-600"
                  }`}
                >
                  Stock: {item.stock}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Expiry:{" "}
                <span className="font-medium">
                  {new Date(item.expiry_date).toLocaleDateString()}
                </span>
              </p>

              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  Supplier ID: {item.supplier_id}
                </span>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={item.stock === 0}
                    className={`p-2 ${
                      item.stock === 0
                        ? "bg-gray-400 cursor-not-allowed"
                        : addedToCart[item.medicine_id]
                        ? "bg-green-600"
                        : "bg-cyan-600 hover:bg-cyan-700"
                    } text-white rounded-lg transition`}
                  >
                    {addedToCart[item.medicine_id] ? (
                      <CheckCircle size={20} />
                    ) : (
                      <ShoppingCart size={20} />
                    )}
                  </button>
                  <button className="p-2 border border-cyan-600 rounded-lg hover:bg-red-100 transition">
                    <Heart size={20} className="text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {medicines.length === 0 && (
        <p className="text-center text-gray-500 mt-10">
          No medicines available at the moment.
        </p>
      )}
    </div>
  );
}

export default Products;