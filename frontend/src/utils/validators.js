
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^[0-9+\-\s()]{10,15}$/;
  return re.test(phone);
};

export const validatePassword = (password) => {
  return password.length >= 8;
};

export const validateSignupForm = (role, formData) => {
  const errors = {};

  if (!formData.firstName?.trim()) errors.firstName = 'First name is required';
  if (!formData.lastName?.trim()) errors.lastName = 'Last name is required';
  if (!formData.email?.trim()) errors.email = 'Email is required';
  else if (!validateEmail(formData.email)) errors.email = 'Invalid email format';
  
  if (!formData.password) errors.password = 'Password is required';
  else if (!validatePassword(formData.password)) {
    errors.password = 'Password must be at least 8 characters';
  }
  
  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  switch (role) {
    case 'Doctor':
      if (!formData.specialty) errors.specialty = 'Specialty is required';
      if (!formData.medicalLicense) errors.medicalLicense = 'Medical license is required';
      break;
    case 'Pharmacist':
      if (!formData.pharmacyName) errors.pharmacyName = 'Pharmacy name is required';
      if (!formData.pharmacyLicense) errors.pharmacyLicense = 'Pharmacy license is required';
      break;
    case 'Supplier':
      if (!formData.companyName) errors.companyName = 'Company name is required';
      if (!formData.supplierId) errors.supplierId = 'Supplier ID is required';
      break;
  }

  return errors;
};