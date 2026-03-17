
import React from 'react';
import { FileText, UserCheck, Link as LinkIcon, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import { formatDate, getStatusColor } from '../../utils/formatters';

function PrescriptionCard({ prescription, onVerify, onReject, showActions = false }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-lg">
            Prescription #{prescription.prescription_id}
          </h3>
          <div className="mt-2 space-y-1">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Patient:</span> {prescription.patient_name}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Date:</span> {formatDate(prescription.date_issued)}
            </p>
            {prescription.doctor_name && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Doctor:</span> {prescription.doctor_name}
              </p>
            )}
            {prescription.diagnosis && (
              <p className="text-sm text-gray-700 mt-2">
                <span className="font-medium">Diagnosis:</span> {prescription.diagnosis}
              </p>
            )}
          </div>
        </div>
        
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(prescription.status)}`}>
          {prescription.status}
        </span>
      </div>

      {prescription.notes && (
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Notes:</span> {prescription.notes}
          </p>
        </div>
      )}

      {prescription.prescription_image && (
        <div className="mb-4">
          <p className="text-sm font-medium mb-2">Prescription Image:</p>
          <img
            src={prescription.prescription_image}
            alt="Prescription"
            className="w-full max-h-64 object-contain border rounded"
          />
        </div>
      )}

      {prescription.medicines && prescription.medicines.length > 0 && (
        <div className="border-t pt-4 mt-4">
          <h4 className="font-semibold mb-3">Prescribed Medicines:</h4>
          <div className="space-y-2">
            {prescription.medicines.map((med, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded">
                <p className="font-medium">{med.medicine_name}</p>
                <p className="text-sm text-gray-600">
                  {med.dosage} | {med.frequency} | {med.duration}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {showActions && prescription.status === 'Pending' && (
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => onVerify(prescription.prescription_id)}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
          >
            <CheckCircle size={20} />
            Verify
          </button>
          <button
            onClick={() => onReject(prescription.prescription_id)}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
          >
            <XCircle size={20} />
            Reject
          </button>
        </div>
      )}
    </div>
  );
}

export default PrescriptionCard;