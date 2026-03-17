
export const ROLES = {
  PATIENT: 'Patient',
  DOCTOR: 'Doctor',
  PHARMACIST: 'Pharmacist',
  SUPPLIER: 'Supplier',
  ADMIN: 'Admin'
};

export const REQUEST_STATUS = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  PROCESSED: 'Processed',
  COMPLETED: 'Completed'
};

export const DELIVERY_STATUS = {
  NOT_SHIPPED: 'NotShipped',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered'
};

export const PRESCRIPTION_STATUS = {
  PENDING: 'Pending',
  VERIFIED: 'Verified',
  REJECTED: 'Rejected'
};

export const ORDER_STATUS = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled'
};

export const PAYMENT_METHODS = {
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  BANK_TRANSFER: 'bank_transfer'
};

export const API_BASE_URL = 'http://localhost:5000';