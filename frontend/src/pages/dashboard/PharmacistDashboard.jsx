// pages/dashboard/PharmacistDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../contexts/NotificationContext";
import { useAuth } from "../../hooks/useAuth";
import userService from "../../services/userService";
import pharmacistService from "../../services/pharmacistService";
import StatsCard from "../../components/dashboard/StatsCard";
import RequestCard from "../../components/dashboard/RequestCard";
import DeliveryCard from "../../components/dashboard/DeliveryCard";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
  Package,
  ShoppingCart,
  Truck,
  User,
  LogOut,
  Home,
  Plus,
  BarChart3,
  AlertCircle,
  Send,
  X
} from "lucide-react";

function PharmacistDashboard() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const [medicines, setMedicines] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [stockRequests, setStockRequests] = useState([]);
  const [pharmacistDetails, setPharmacistDetails] = useState(null);
  const [stats, setStats] = useState({
    total_medicines: 0,
    pending_requests: 0,
    completed_deliveries: 0,
    low_stock_medicines: 0
  });

  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [requestData, setRequestData] = useState({
    supplier_id: "",
    medicine_id: "",
    quantity_requested: "",
    notes: "",
    pharmacy_name: ""
  });

  useEffect(() => {
    if (user === undefined || user === null) {
      return;
    }

    if (user.role !== "Pharmacist") {
      showNotification('Unauthorized access', 'error');
      navigate("/login");
      return;
    }

    if (!initialLoadDone) {
      loadData();
      setInitialLoadDone(true);
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      try {
        const pharmacistData = await userService.getPharmacistByUserId(user.id);
        setPharmacistDetails(pharmacistData);
      } catch (err) {
        console.error("Error fetching pharmacist details:", err);
      }

      try {
        const medicinesData = await userService.getPharmacistMedicines();
        setMedicines(medicinesData);
      } catch (err) {
        console.error("Error fetching medicines:", err);
      }

      try {
        const suppliersData = await userService.getAllSuppliers();
        setSuppliers(suppliersData);
      } catch (err) {
        console.error("Error fetching suppliers:", err);
      }

      try {
        const requestsData = await pharmacistService.getStockRequests(user.id);
        setStockRequests(requestsData);
      } catch (err) {
        console.error("Error fetching stock requests:", err);
        setStockRequests([]);
      }

      try {
        const statsData = await userService.getPharmacistStats(user.id);
        setStats(statsData);
      } catch (err) {
        console.error("Error fetching stats:", err);
      }

      showNotification("Dashboard loaded successfully", "success");
    } catch (err) {
      console.error("Error loading data:", err);
      showNotification("Some features may be limited", "warning");
    }
    setLoading(false);
  };

  const refreshStockRequests = async () => {
    try {
      const requestsData = await pharmacistService.getStockRequests(user.id);
      setStockRequests(requestsData);
    } catch (err) {
      console.error("Error refreshing stock requests:", err);
    }
  };

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  const handleSendRequest = async () => {
    if (!requestData.supplier_id || !requestData.medicine_id || !requestData.quantity_requested) {
      showNotification("Please fill in all required fields", "warning");
      return;
    }

    setLoading(true);
    try {
      await pharmacistService.createStockRequest({
        pharmacist_id: user.id,
        supplier_id: requestData.supplier_id,
        medicine_id: requestData.medicine_id,
        quantity_requested: parseInt(requestData.quantity_requested),
        notes: requestData.notes || '',
        pharmacy_name: pharmacistDetails?.pharmacy_name || "My Pharmacy"
      });

      showNotification("Stock request sent successfully!", "success");
      setShowRequestForm(false);
      setSelectedMedicine(null);
      setRequestData({
        supplier_id: "",
        medicine_id: "",
        quantity_requested: "",
        notes: "",
        pharmacy_name: ""
      });

      await refreshStockRequests();

    } catch (err) {
      showNotification(err.message || "Failed to send request", "error");
    }
    setLoading(false);
  };

  const handleAddToInventory = async (request) => {
    if (!window.confirm(`Add ${request.quantity_requested} units of ${request.medicine_name} to your pharmacy inventory?`)) {
      return;
    }

    setLoading(true);
    try {
      await pharmacistService.addToInventory({
        medicine_id: request.medicine_id,
        quantity: request.quantity_requested,
        supplier_id: request.supplier_id,
        request_id: request.request_id
      });

      showNotification("Medicine added to inventory successfully!", "success");
      await refreshStockRequests();

      const medicinesData = await userService.getPharmacistMedicines();
      setMedicines(medicinesData);

    } catch (err) {
      showNotification(err.message || "Failed to add to inventory", "error");
    }
    setLoading(false);
  };

  const getSupplierMedicines = (supplierId) => {
    if (!supplierId) return [];
    const supplierIdNum = parseInt(supplierId);
    return medicines.filter(med => parseInt(med.supplier_id) === supplierIdNum);
  };

  const getWelcomeName = () => {
    if (pharmacistDetails?.pharmacy_name) {
      return pharmacistDetails.pharmacy_name;
    } else if (user?.name) {
      return user.name;
    } else {
      return "Pharmacist";
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <LoadingSpinner size="large" color="teal" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 bg-gradient-to-b from-teal-600 to-cyan-600 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-teal-500">
          Pharmora
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
              activeTab === "dashboard" ? "bg-white text-teal-600" : "hover:bg-teal-500"
            }`}
          >
            <BarChart3 size={20} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab("medicines")}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
              activeTab === "medicines" ? "bg-white text-teal-600" : "hover:bg-teal-500"
            }`}
          >
            <Package size={20} />
            <span>Medicines</span>
          </button>

          <button
            onClick={() => setActiveTab("requests")}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
              activeTab === "requests" ? "bg-white text-teal-600" : "hover:bg-teal-500"
            }`}
          >
            <ShoppingCart size={20} />
            <span>My Requests</span>
            {stockRequests.filter(r => r.status === 'Pending').length > 0 && (
              <span className="ml-auto bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                {stockRequests.filter(r => r.status === 'Pending').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("deliveries")}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
              activeTab === "deliveries" ? "bg-white text-teal-600" : "hover:bg-teal-500"
            }`}
          >
            <Truck size={20} />
            <span>Deliveries</span>
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-teal-500 transition"
          >
            <Home size={20} />
            <span>Home</span>
          </button>
        </nav>

        <div className="p-4 border-t border-teal-500">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-500 transition"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome, {getWelcomeName()}!
              </h1>
              <p className="text-gray-600">Pharmacy Inventory Management</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setActiveTab("requests");
                  setShowRequestForm(true);
                }}
                className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:from-teal-600 hover:to-cyan-600 flex items-center gap-2"
              >
                <Plus size={20} />
                Request Stock
              </button>
            </div>
          </div>

          {activeTab === "dashboard" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                  title="Available Medicines"
                  value={medicines.length}
                  icon={Package}
                  color="teal"
                />
                <StatsCard
                  title="Pending Requests"
                  value={stockRequests.filter(r => r.status === 'Pending').length}
                  icon={ShoppingCart}
                  color="yellow"
                />
                <StatsCard
                  title="Completed Deliveries"
                  value={stockRequests.filter(r => r.status === 'Completed').length}
                  icon={Truck}
                  color="green"
                />
                <StatsCard
                  title="Low Stock Alerts"
                  value={medicines.filter(m => m.stock < 10).length}
                  icon={AlertCircle}
                  color="red"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Recent Requests</h3>
                  <div className="space-y-3">
                    {stockRequests.slice(0, 5).map((request) => (
                      <div key={request.request_id} className="flex justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{request.medicine_name}</p>
                          <p className="text-sm text-gray-600">Qty: {request.quantity_requested}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          request.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                          request.status === 'Accepted' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                    ))}
                    {stockRequests.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No recent requests</p>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => setActiveTab("medicines")}
                      className="w-full text-left p-4 bg-teal-50 rounded-lg hover:bg-teal-100"
                    >
                      <Package className="inline mr-2 text-teal-600" />
                      <span className="font-medium text-teal-800">Browse Medicines</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab("requests");
                        setShowRequestForm(true);
                      }}
                      className="w-full text-left p-4 bg-cyan-50 rounded-lg hover:bg-cyan-100"
                    >
                      <Plus className="inline mr-2 text-cyan-600" />
                      <span className="font-medium text-cyan-800">New Stock Request</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "medicines" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Available Medicines</h2>

              {medicines.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <Package size={64} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No medicines available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {medicines.map((medicine) => (
                    <div key={medicine.medicine_id} className="bg-white rounded-lg shadow p-6 border border-gray-200">
                      <h3 className="font-semibold text-lg mb-2">{medicine.name}</h3>
                      <p className="text-sm text-teal-600 mb-2">{medicine.category}</p>
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Price:</span>
                          <span className="font-semibold">Rs. {medicine.price}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Stock:</span>
                          <span className="font-semibold">{medicine.stock} units</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Supplier:</span>
                          <span className="font-semibold">{medicine.supplier_name}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedMedicine(medicine);
                          setRequestData({
                            supplier_id: medicine.supplier_id,
                            medicine_id: medicine.medicine_id,
                            quantity_requested: "",
                            notes: "",
                            pharmacy_name: pharmacistDetails?.pharmacy_name || "My Pharmacy"
                          });
                          setActiveTab("requests");
                          setShowRequestForm(true);
                        }}
                        className="w-full px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:from-teal-600 hover:to-cyan-600"
                      >
                        Request Stock
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "requests" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">My Stock Requests</h2>

              {stockRequests.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <ShoppingCart size={64} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No stock requests yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stockRequests
                    .filter(request => request.status !== 'Completed')
                    .map((request) => (
                      <RequestCard
                        key={request.request_id}
                        request={request}
                        type="pharmacist"
                        onAddToInventory={handleAddToInventory}
                      />
                    ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "deliveries" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Delivery Tracking</h2>

              {stockRequests.filter(req => req.delivery_status === "Shipped" || req.status === "Completed").length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <Truck size={64} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No active deliveries</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {stockRequests.filter(req => req.delivery_status === "Shipped").length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-blue-700">
                        In Transit ({stockRequests.filter(req => req.delivery_status === "Shipped").length})
                      </h3>
                      {stockRequests
                        .filter(req => req.delivery_status === "Shipped")
                        .map((request) => (
                          <DeliveryCard key={request.request_id} delivery={request} />
                        ))}
                    </div>
                  )}

                  {stockRequests.filter(req => req.status === "Completed").length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-green-700">
                        Ready to Add ({stockRequests.filter(req => req.status === "Completed").length})
                      </h3>
                      {stockRequests
                        .filter(req => req.status === "Completed")
                        .map((request) => (
                          <RequestCard
                            key={request.request_id}
                            request={request}
                            type="pharmacist"
                            onAddToInventory={handleAddToInventory}
                          />
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {showRequestForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
                <h3 className="text-xl font-semibold mb-4">
                  {selectedMedicine ? `Request ${selectedMedicine.name}` : 'Request Stock'}
                </h3>

                <div className="space-y-4">
                  {!selectedMedicine && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Supplier</label>
                      <select
                        value={requestData.supplier_id}
                        onChange={(e) => setRequestData({ ...requestData, supplier_id: e.target.value })}
                        className="w-full p-3 border rounded-lg"
                      >
                        <option value="">Select Supplier</option>
                        {suppliers.map(supplier => (
                          <option key={supplier.supplier_id} value={supplier.supplier_id}>
                            {supplier.company_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {!selectedMedicine && requestData.supplier_id && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Medicine</label>
                      <select
                        value={requestData.medicine_id}
                        onChange={(e) => setRequestData({ ...requestData, medicine_id: e.target.value })}
                        className="w-full p-3 border rounded-lg"
                      >
                        <option value="">Select Medicine</option>
                        {getSupplierMedicines(requestData.supplier_id).map(medicine => (
                          <option key={medicine.medicine_id} value={medicine.medicine_id}>
                            {medicine.name} - Rs. {medicine.price}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {selectedMedicine && (
                    <div className="bg-teal-50 p-3 rounded-lg">
                      <p><strong>Medicine:</strong> {selectedMedicine.name}</p>
                      <p><strong>Supplier:</strong> {selectedMedicine.supplier_name}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-2">Quantity Needed</label>
                    <input
                      type="number"
                      value={requestData.quantity_requested}
                      onChange={(e) => setRequestData({ ...requestData, quantity_requested: e.target.value })}
                      placeholder="Enter quantity"
                      className="w-full p-3 border rounded-lg"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                    <textarea
                      value={requestData.notes}
                      onChange={(e) => setRequestData({ ...requestData, notes: e.target.value })}
                      placeholder="Any special instructions..."
                      className="w-full p-3 border rounded-lg"
                      rows="3"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowRequestForm(false);
                      setSelectedMedicine(null);
                      setRequestData({
                        supplier_id: "",
                        medicine_id: "",
                        quantity_requested: "",
                        notes: "",
                        pharmacy_name: ""
                      });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendRequest}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:from-teal-600 hover:to-cyan-600 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <LoadingSpinner size="small" /> : <Send size={20} />}
                    Send Request
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PharmacistDashboard;
