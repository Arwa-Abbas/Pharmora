// components/products/ProductCard.jsx
import React from 'react';
import { ShoppingCart, CheckCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

function ProductCard({ product, onAddToCart, isAdded }) {
  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-2xl transition transform hover:-translate-y-2 duration-300">
      <img
        src={product.image_url || "https://zplcialirnvkdbmwslyc.supabase.co/storage/v1/object/public/products/default-medicine.jpg"}
        alt={product.name}
        className="w-full h-48 object-cover"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "https://zplcialirnvkdbmwslyc.supabase.co/storage/v1/object/public/products/default-medicine.jpg";
        }}
      />
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-1">{product.name}</h3>
        <p className="text-sm text-gray-500 mb-3">Category: {product.category || "General"}</p>
        <p className="text-gray-700 mb-4 line-clamp-2">{product.description || "No description available."}</p>

        <div className="flex justify-between items-center mb-2">
          <span className="text-lg font-bold text-green-700">{formatCurrency(product.price)}</span>
          <span className={`text-sm ${product.stock > 0 ? "text-blue-600" : "text-red-600"}`}>
            Stock: {product.stock}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Expiry: <span className="font-medium">{new Date(product.expiry_date).toLocaleDateString()}</span>
        </p>

        <button
          onClick={() => onAddToCart(product)}
          disabled={product.stock === 0}
          className={`w-full p-2 ${
            product.stock === 0
              ? "bg-gray-400 cursor-not-allowed"
              : isAdded
              ? "bg-green-600"
              : "bg-cyan-600 hover:bg-cyan-700"
          } text-white rounded-lg transition flex items-center justify-center gap-2`}
        >
          {isAdded ? (
            <>
              <CheckCircle size={20} />
              Added to Cart
            </>
          ) : (
            <>
              <ShoppingCart size={20} />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default ProductCard;