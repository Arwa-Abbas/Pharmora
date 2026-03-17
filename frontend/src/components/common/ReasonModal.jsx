
import React, { useState } from "react";
import { X } from "lucide-react";

function ReasonModal({ title, placeholder, confirmLabel, confirmColor = "red", onConfirm, onCancel }) {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
              <X size={22} />
            </button>
          </div>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder={placeholder || "Enter reason (optional)"}
            className="w-full p-3 border rounded-lg text-sm"
            rows={3}
          />
          <div className="flex gap-3 mt-4">
            <button
              onClick={onCancel}
              className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              Go Back
            </button>
            <button
              onClick={() => onConfirm(reason.trim())}
              className={`flex-1 py-2 text-white rounded-lg text-sm font-medium ${
                confirmColor === "red" ? "bg-red-600 hover:bg-red-700" : "bg-teal-600 hover:bg-teal-700"
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReasonModal;
