
import React, { useState } from 'react';
import { CheckCircle, XCircle, Truck, Clock, Package } from 'lucide-react';
import { formatDate, getStatusColor } from '../../utils/formatters';

function RequestCard({
  request,
  type = 'supplier',
  onAccept,
  onReject,
  onShip,
  onDeliver,
  onAddToInventory,
  onCheckInventory,
  processingRequest
}) {
  const [inventoryStatus, setInventoryStatus] = useState(null);
  const [checkingInventory, setCheckingInventory] = useState(false);

  const handleCheckInventory = async () => {
    if (!onCheckInventory) return;
    setCheckingInventory(true);
    try {
      const status = await onCheckInventory(
        request.supplier_id,
        request.medicine_id,
        request.quantity_requested
      );
      setInventoryStatus(status);
    } catch (error) {
      console.error("Error checking inventory:", error);
    } finally {
      setCheckingInventory(false);
    }
  };

  const getBorderColor = () => {
    if (request.delivery_status === 'Delivered') return 'border-green-500';
    if (request.delivery_status === 'Shipped') return 'border-purple-500';
    if (request.status === 'Accepted') return 'border-blue-500';
    if (request.status === 'Rejected') return 'border-red-500';
    if (request.status === 'Processed') return 'border-gray-400';
    return 'border-teal-500';
  };

  return (
    <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${getBorderColor()}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg">
            Request #{request.request_id}
          </h3>
          {type === 'supplier' && (
            <p className="text-sm text-gray-600">
              From: <span className="font-medium">{request.pharmacist_name || request.pharmacy_name}</span>
            </p>
          )}
          {type === 'pharmacist' && (
            <p className="text-sm text-gray-600">
              Supplier: <span className="font-medium">{request.supplier_name}</span>
            </p>
          )}
          <p className="text-sm text-gray-600">
            Medicine: <span className="font-medium">{request.medicine_name}</span>
          </p>
          <p className="text-sm text-gray-600">
            Date: {formatDate(request.request_date)}
          </p>

          {request.delivery_status && request.delivery_status !== 'NotShipped' && (
            <div className="mt-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                request.delivery_status === 'Shipped'   ? 'bg-purple-100 text-purple-700' :
                request.delivery_status === 'Delivered' ? 'bg-green-100 text-green-700'   :
                'bg-gray-100 text-gray-700'
              }`}>
                Delivery: {request.delivery_status}
              </span>
            </div>
          )}
        </div>

        <div className="text-right">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
            {request.status}
          </span>
        </div>
      </div>

      <div className="bg-teal-50 rounded p-4 mb-4">
        <p className="text-teal-900">
          Quantity Requested: <span className="font-semibold">{request.quantity_requested} units</span>
        </p>
        {request.notes && (
          <p className="text-sm text-teal-700 mt-2">
            <span className="font-semibold">Notes:</span> {request.notes}
          </p>
        )}
        {request.tracking_info && (
          <p className="text-sm text-teal-700 mt-2">
            <span className="font-semibold">Tracking:</span> {request.tracking_info}
          </p>
        )}
        {request.shipped_date && (
          <p className="text-sm text-teal-700 mt-2">
            <span className="font-semibold">Shipped:</span> {formatDate(request.shipped_date)}
          </p>
        )}
        {request.delivery_date && (
          <p className="text-sm text-teal-700 mt-2">
            <span className="font-semibold">Delivered:</span> {formatDate(request.delivery_date)}
          </p>
        )}
      </div>

      {type === 'supplier' && (
        <>
          {request.status === 'Pending' && (
            <div className="space-y-3">
              {onCheckInventory && (
                <button
                  onClick={handleCheckInventory}
                  disabled={checkingInventory}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
                >
                  {checkingInventory ? 'Checking...' : 'Check Inventory'}
                </button>
              )}

              {inventoryStatus && (
                <div className={`p-3 rounded-lg ${inventoryStatus.hasEnough ? 'bg-green-100' : 'bg-red-100'}`}>
                  <p className={`text-sm font-medium ${inventoryStatus.hasEnough ? 'text-green-700' : 'text-red-700'}`}>
                    {inventoryStatus.message}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => onAccept(request.request_id)}
                  disabled={
                    processingRequest === request.request_id ||
                    (inventoryStatus && !inventoryStatus.hasEnough)
                  }
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed"
                >
                  {processingRequest === request.request_id ? 'Processing...' : 'Accept'}
                </button>
                <button
                  onClick={() => onReject(request.request_id)}
                  disabled={processingRequest === request.request_id}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-red-300"
                >
                  Reject
                </button>
              </div>
            </div>
          )}

          {request.status === 'Accepted' && request.delivery_status === 'NotShipped' && (
            <button
              onClick={() => onShip(request.request_id)}
              disabled={processingRequest === request.request_id}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 flex items-center justify-center gap-2"
            >
              <Truck size={16} />
              {processingRequest === request.request_id ? 'Processing...' : 'Mark as Shipped'}
            </button>
          )}

          {request.delivery_status === 'Shipped' && (
            <button
              onClick={() => onDeliver(request.request_id)}
              disabled={processingRequest === request.request_id}
              className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-green-300 flex items-center justify-center gap-2"
            >
              <CheckCircle size={16} />
              {processingRequest === request.request_id ? 'Processing...' : 'Mark as Delivered'}
            </button>
          )}

          {request.delivery_status === 'Delivered' && (
            <div className="text-center text-green-600 font-medium py-2 bg-green-50 rounded-lg flex items-center justify-center gap-2">
              <CheckCircle size={16} />
              Delivery Completed
            </div>
          )}

          {request.status === 'Rejected' && (
            <div className="text-center text-red-600 font-medium py-2 bg-red-50 rounded-lg flex items-center justify-center gap-2">
              <XCircle size={16} />
              Request Rejected
            </div>
          )}
        </>
      )}

      {type === 'pharmacist' && (
        <>
          {request.status === 'Pending' && (
            <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 p-3 rounded-lg">
              <Clock size={20} />
              <span className="font-medium">Waiting for supplier response</span>
            </div>
          )}

          {request.status === 'Rejected' && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <XCircle size={20} />
              <span className="font-medium">Request was rejected by supplier</span>
            </div>
          )}

          {request.status === 'Accepted' && request.delivery_status === 'NotShipped' && (
            <div className="flex items-center gap-2 text-blue-600 bg-blue-50 p-3 rounded-lg">
              <CheckCircle size={20} />
              <span className="font-medium">Supplier accepted</span>
            </div>
          )}

          {request.delivery_status === 'Shipped' && (
            <div className="flex items-center gap-2 text-purple-600 bg-purple-50 p-3 rounded-lg">
              <Truck size={20} />
              <span className="font-medium">Order is in transit</span>
            </div>
          )}

          {request.status === 'Completed' && request.delivery_status === 'Delivered' && (
            <button
              onClick={() => onAddToInventory(request)}
              className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center gap-2"
            >
              <Package size={16} />
              Add to Pharmacy Inventory
            </button>
          )}

          {request.status === 'Processed' && (
            <div className="text-center text-gray-600 font-medium py-2 bg-gray-50 rounded-lg flex items-center justify-center gap-2">
              <CheckCircle size={16} className="text-green-500" />
              Added to Inventory
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default RequestCard;
