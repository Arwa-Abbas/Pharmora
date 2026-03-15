// components/dashboard/OrderCard.jsx
import React from 'react';
import { Package, CreditCard, MapPin, Calendar, AlertCircle, CheckCircle, Link as LinkIcon } from 'lucide-react';
import { formatDate, formatCurrency, getStatusColor } from '../../utils/formatters';

function OrderCard({ order, onPay, showPaymentButton = false }) {
  const hasPrescription = order.prescription_id;
  const hasPayment = order.payment;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-lg">
            Order #{order.order_id}
          </h3>
          <div className="mt-2 space-y-1">
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <Calendar size={14} />
              {formatDate(order.order_date)}
            </p>
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <MapPin size={14} />
              {order.delivery_address}
            </p>
          </div>

          {hasPrescription ? (
            <div className="mt-2 flex items-center gap-2">
              <LinkIcon size={14} className="text-green-600" />
              <p className="text-sm text-green-600">
                Linked to Prescription #{order.prescription_id}
              </p>
            </div>
          ) : (
            <div className="mt-2 flex items-center gap-2">
              <AlertCircle size={14} className="text-yellow-600" />
              <p className="text-sm text-yellow-600">
                No prescription linked
              </p>
            </div>
          )}

          {hasPayment ? (
            <div className="mt-1 flex items-center gap-2">
              <CheckCircle size={14} className="text-green-600" />
              <p className="text-sm text-green-600">
                Paid on {formatDate(hasPayment.date)} via {hasPayment.method}
              </p>
            </div>
          ) : (
            <div className="mt-1 flex items-center gap-2">
              <AlertCircle size={14} className="text-orange-600" />
              <p className="text-sm text-orange-600">
                Payment Pending
              </p>
            </div>
          )}
        </div>

        <div className="text-right">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
            {order.status}
          </span>
          <p className="text-lg font-bold text-gray-900 mt-2">
            {formatCurrency(order.total_price)}
          </p>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="font-semibold mb-3">Order Items:</h4>
        <div className="space-y-2">
          {order.items?.map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 p-2 bg-gray-50 rounded">
              {item.image_url && (
                <img
                  src={item.image_url}
                  alt={item.medicine_name}
                  className="w-12 h-12 object-cover rounded"
                />
              )}
              <div className="flex-1">
                <p className="font-medium">{item.medicine_name}</p>
                <p className="text-sm text-gray-600">
                  Quantity: {item.quantity} × {formatCurrency(item.price)}
                </p>
              </div>
              <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>
      </div>

      {showPaymentButton && !hasPayment && hasPrescription && (
        <button
          onClick={() => onPay(order)}
          className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
        >
          <CreditCard size={20} />
          Proceed to Payment
        </button>
      )}
    </div>
  );
}

export default OrderCard;
