// hooks/useMedicines.js
import { useState, useEffect } from 'react';
import medicineService from '../services/medicineService';

export const useMedicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadMedicines = async () => {
    try {
      setLoading(true);
      const data = await medicineService.getAllMedicines();
      setMedicines(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error loading medicines:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedicines();
  }, []);

  return {
    medicines,
    loading,
    error,
    refreshMedicines: loadMedicines
  };
};
