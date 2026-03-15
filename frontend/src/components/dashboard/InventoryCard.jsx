// components/dashboard/InventoryCard.jsx
import React, { useState } from 'react';
import { Edit, Save, X, AlertCircle, Package } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

function InventoryCard({ item, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    quantity_available: item.quantity_available,
    reorder_level: item.reorder_level,
    purchase_price: item.purchase_price,
    selling_price: item.selling_price,
    expiry_date: item.expiry_date ? item.expiry_date.split('T')[0] : ''
  });

  const handleSave = () => {
    onUpdate(item.inventory_id, formData);
    setIsEditing(false);
  };

  const isLowStock = item.quantity_available <= item.reorder_level;

  if (isEditing) {
    return (
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-4">{item.medicine_name}</h4>
        
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-700">Stock</label>
            <input
              type="number"
              value={formData.quantity_available}
              onChange={(e) => setFormData({ ...formData, quantity_available: parseInt(e.target.value) })}
              className="w-full p-2 border border-gray-300 rounded text-sm"
              min="0"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1 text-gray-700">Reorder Level</label>
            <input
              type="number"
              value={formData.reorder_level}
              onChange={(e) => setFormData({ ...formData, reorder_level: parseInt(e.target.value) })}
              className="w-full p-2 border border-gray-300 rounded text-sm"
              min="0"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700">Purchase Price</label>
              <input
                type="number"
                value={formData.purchase_price}
                onChange={(e) => setFormData({ ...formData, purchase_price: parseFloat(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded text-sm"
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700">Selling Price</label>
              <input
                type="number"
                value={formData.selling_price}
                onChange={(e) => setFormData({ ...formData, selling_price: parseFloat(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded text-sm"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1 text-gray-700">Expiry Date</label>
            <input
              type="date"
              value={formData.expiry_date}
              onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded text-sm"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              className="flex-1 px-3 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 text-sm flex items-center justify-center gap-1"
            >
              <Save size={14} />
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm flex items-center justify-center gap-1"
            >
              <X size={14} />
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:border-teal-300 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-lg text-gray-900">{item.medicine_name}</h3>
          {item.category && (
            <p className="text-sm text-teal-600 font-medium">{item.category}</p>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 text-blue-600 hover:text-blue-800"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(item.inventory_id)}
            className="p-1 text-red-600 hover:text-red-800"
            title="Delete"
          >
            <X size={16} />
          </button>
        </div>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Stock:</span>
          <span className={`font-semibold ${isLowStock ? 'text-red-600' : 'text-green-600'}`}>
            {item.quantity_available} units
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Reorder Level:</span>
          <span className="font-semibold">{item.reorder_level} units</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Purchase Price:</span>
          <span className="font-semibold">{formatCurrency(item.purchase_price)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Selling Price:</span>
          <span className="font-semibold text-green-600">{formatCurrency(item.selling_price)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Total Value:</span>
          <span className="font-semibold text-teal-600">
            {formatCurrency(item.quantity_available * item.selling_price)}
          </span>
        </div>
        {item.expiry_date && (
          <div className="flex justify-between">
            <span className="text-gray-600">Expiry:</span>
            <span className="font-semibold">{formatDate(item.expiry_date)}</span>
          </div>
        )}
      </div>
      
      {isLowStock && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded flex items-center gap-2">
          <AlertCircle size={16} className="text-red-600" />
          <span className="text-xs text-red-700 font-medium">Low stock - Reorder needed</span>
        </div>
      )}
    </div>
  );
}

export default InventoryCard;