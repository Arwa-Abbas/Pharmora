// utils/formatters.js
export const getFullName = (user) => {
  if (!user) return '';
  
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`;
  } else if (user.first_name) {
    return user.first_name;
  } else if (user.last_name) {
    return user.last_name;
  } else if (user.name) {
    return user.name;
  }
  return '';
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return 'Rs. 0';
  return `Rs. ${parseFloat(amount).toFixed(2)}`;
};

export const getStatusColor = (status) => {
  const colors = {
    'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Accepted': 'bg-blue-100 text-blue-800 border-blue-200',
    'Rejected': 'bg-red-100 text-red-800 border-red-200',
    'Verified': 'bg-green-100 text-green-800 border-green-200',
    'Completed': 'bg-green-100 text-green-800 border-green-200',
    'Shipped': 'bg-purple-100 text-purple-800 border-purple-200',
    'Delivered': 'bg-green-100 text-green-800 border-green-200',
    'NotShipped': 'bg-gray-100 text-gray-800 border-gray-200',
    'Processed': 'bg-blue-100 text-blue-800 border-blue-200'
  };
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

export const getDeliveryStatusColor = (status) => {
  const colors = {
    'NotShipped': 'bg-gray-100 text-gray-700',
    'Shipped': 'bg-blue-100 text-blue-700',
    'Delivered': 'bg-green-100 text-green-700'
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
};