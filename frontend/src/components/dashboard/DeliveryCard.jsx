// components/dashboard/DeliveryCard.jsx
import React from 'react';
import { Truck, CheckCircle, Clock, MapPin } from 'lucide-react';
import { formatDate, getDeliveryStatusColor } from '../../utils/formatters';

function DeliveryCard({ delivery, onDeliver, onShip }) {
  const isDelivered = delivery.delivery_status === 'Delivered' || delivery.status === 'Completed';
  const isShipped = delivery.delivery_status === 'Shipped';
  const isAccepted = !isDelivered && !isShipped;

  return (
    <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${
      isDelivered ? 'border-green-500' : isShipped ? 'border-blue-500' : 'border-yellow-500'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg">
            {isDelivered ? 'Delivered' : isShipped ? 'In Transit' : 'Accepted'} - Request #{delivery.request_id}
          </h3>

          <div className="mt-2 space-y-1">
            <p className="text-sm text-gray-600">
              <span className="font-medium">To:</span> {delivery.pharmacist_name || delivery.pharmacy_name}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Medicine:</span> {delivery.medicine_name}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Quantity:</span> {delivery.quantity_requested} units
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Ordered:</span> {formatDate(delivery.request_date)}
            </p>
          </div>

          <div className="mt-4 space-y-2">
            {delivery.shipped_date && (
              <div className="flex items-center gap-2 text-sm">
                <Truck size={16} className="text-blue-600" />
                <span className="text-gray-700">Shipped on: {formatDate(delivery.shipped_date)}</span>
              </div>
            )}
            {delivery.delivery_date && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle size={16} className="text-green-600" />
                <span className="text-gray-700">Delivered on: {formatDate(delivery.delivery_date)}</span>
              </div>
            )}
            {delivery.tracking_info && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin size={16} className="text-purple-600" />
                <span className="text-gray-700">Tracking: {delivery.tracking_info}</span>
              </div>
            )}
          </div>
        </div>

        <div className="text-right">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            isDelivered ? 'bg-green-100 text-green-700' :
            isShipped ? 'bg-blue-100 text-blue-700' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            {isDelivered ? 'Delivered' : isShipped ? 'In Transit' : 'Accepted'}
          </span>
        </div>
      </div>

      {isAccepted && onShip && (
        <button
          onClick={() => onShip(delivery.request_id)}
          className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
        >
          <Truck size={20} />
          Mark as Shipped
        </button>
      )}

      {isShipped && onDeliver && (
        <button
          onClick={() => onDeliver(delivery.request_id)}
          className="w-full mt-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center gap-2"
        >
          <CheckCircle size={20} />
          Mark as Delivered
        </button>
      )}
    </div>
  );
}

export default DeliveryCard;
