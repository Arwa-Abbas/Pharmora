// components/dashboard/OrderCard.jsx
import React from 'react';
import { Package, CreditCard, MapPin, Calendar, AlertCircle, CheckCircle, Link as LinkIcon, FileText } from 'lucide-react';
import { formatDate, formatCurrency, getStatusColor } from '../../utils/formatters';

function OrderCard({ order, onPay, onLinkPrescription }) {
  const hasPrescription = order.prescription_id;
  const hasPayment = order.payment;
  const isPending = order.status === 'Pending';

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

      {isPending && !hasPayment && (
        <div className="mt-4 flex gap-3">
          {!hasPrescription && (
            <button
              onClick={() => onLinkPrescription(order)}
              className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 flex items-center justify-center gap-2"
            >
              <FileText size={18} />
              Link Prescription
            </button>
          )}

          <button
            onClick={() => hasPrescription ? onPay(order) : null}
            disabled={!hasPrescription}
            className={`flex-1 px-4 py-2 rounded-lg flex items-center justify-center gap-2 ${
              hasPrescription
                ? 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            title={!hasPrescription ? 'Link a prescription first' : ''}
          >
            <CreditCard size={18} />
            Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  );
}

export default OrderCard;
