import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  ShoppingCart,
  Truck,
  Bell,
  User,
  LogOut,
  Home,
  Plus,
  Search,
  Send,
  CheckCircle,
  AlertCircle,
  ClipboardList,
  BarChart3,
  Download,
} from "lucide-react";

function PharmacistDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);

  // State for data
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

  // Request state
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
    if (!user || user.role !== "Pharmacist") {
      navigate("/login");
      return;
    }
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load pharmacist details
      const pharmacistRes = await fetch(`http://localhost:5000/api/pharmacist/user/${user.id}`);
      if (pharmacistRes.ok) {
        const pharmacistData = await pharmacistRes.json();
        setPharmacistDetails(pharmacistData);
      }

      // Load medicines from medicines table with supplier info
      const medicinesRes = await fetch(`http://localhost:5000/api/pharmacist/medicines`);
      if (medicinesRes.ok) {
        const medicinesData = await medicinesRes.json();
        setMedicines(medicinesData);
      } else {
        console.error("Failed to fetch medicines");
        setMedicines([]);
      }

      // Load suppliers
      const suppliersRes = await fetch(`http://localhost:5000/api/suppliers`);
      if (suppliersRes.ok) {
        const suppliersData = await suppliersRes.json();
        setSuppliers(suppliersData);
      } else {
        console.error("Failed to fetch suppliers");
        setSuppliers([]);
      }

      // Load pharmacist's stock requests
      const requestsRes = await fetch(`http://localhost:5000/api/pharmacist/${user.id}/stock-requests`);
      if (requestsRes.ok) {
        const requestsData = await requestsRes.json();
        setStockRequests(requestsData);
      } else {
        console.error("Failed to fetch stock requests");
        setStockRequests([]);
      }

      // Load stats
      const statsRes = await fetch(`http://localhost:5000/api/pharmacist/${user.id}/stats`);
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

    } catch (err) {
      console.error("Error loading data:", err);
      alert("Failed to load dashboard data: " + err.message);
    }
    setLoading(false);
  };

  const handleSignOut = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleSendRequest = async () => {
    if (!requestData.supplier_id || !requestData.medicine_id || !requestData.quantity_requested) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/stock-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pharmacist_id: user.id,
          supplier_id: requestData.supplier_id,
          medicine_id: requestData.medicine_id,
          quantity_requested: parseInt(requestData.quantity_requested),
          notes: requestData.notes || '',
          pharmacy_name: pharmacistDetails?.pharmacy_name || "My Pharmacy"
        }),
      });

      if (response.ok) {
        alert("Stock request sent successfully!");
        setShowRequestForm(false);
        setRequestData({
          supplier_id: "",
          medicine_id: "",
          quantity_requested: "",
          notes: "",
          pharmacy_name: pharmacistDetails?.pharmacy_name || "My Pharmacy"
        });
        setSelectedMedicine(null);
        loadData();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to send request");
      }
    } catch (err) {
      console.error("Error sending request:", err);
      alert("Failed to send request");
    }
  };

  const handleAddToInventory = async (request) => {
    if (!window.confirm(`Add ${request.quantity_requested} units of ${request.medicine_name} to your inventory?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/pharmacist/add-to-inventory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicine_id: request.medicine_id,
          quantity: request.quantity_requested,
          supplier_id: request.supplier_id
        }),
      });

      if (response.ok) {
        alert("Medicine added to inventory successfully!");
        loadData();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to add to inventory");
      }
    } catch (err) {
      console.error("Error adding to inventory:", err);
      alert("Failed to add to inventory");
    }
  };

  const getSupplierMedicines = (supplierId) => {
    return medicines.filter(med => med.supplier_id === parseInt(supplierId));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'Accepted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDeliveryStatusColor = (deliveryStatus) => {
    switch (deliveryStatus) {
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Shipped': return 'bg-purple-100 text-purple-800';
      case 'Processing': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-teal-600 to-cyan-600 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-teal-500">
          Pharmora
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
              activeTab === "dashboard"
                ? "bg-white text-teal-600 shadow-md"
                : "hover:bg-teal-500 hover:shadow-sm"
            }`}
          >
            <BarChart3 size={20} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab("medicines")}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
              activeTab === "medicines"
                ? "bg-white text-teal-600 shadow-md"
                : "hover:bg-teal-500 hover:shadow-sm"
            }`}
          >
            <Package size={20} />
            <span>Available Medicines</span>
          </button>

          <button
            onClick={() => setActiveTab("requests")}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
              activeTab === "requests"
                ? "bg-white text-teal-600 shadow-md"
                : "hover:bg-teal-500 hover:shadow-sm"
            }`}
          >
            <ShoppingCart size={20} />
            <span>My Requests</span>
            {stockRequests.filter(req => req.status === "Pending").length > 0 && (
              <span className="ml-auto bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {stockRequests.filter(req => req.status === "Pending").length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("deliveries")}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
              activeTab === "deliveries"
                ? "bg-white text-teal-600 shadow-md"
                : "hover:bg-teal-500 hover:shadow-sm"
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

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome, {pharmacistDetails?.pharmacy_name || user?.name}!
              </h1>
              <p className="text-gray-600">Pharmacy Inventory Management</p>
            </div>
            <button
              onClick={() => setShowRequestForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:from-teal-600 hover:to-cyan-600 flex items-center gap-2 shadow-md transition-all"
            >
              <Plus size={20} />
              Request Stock
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading...</p>
            </div>
          ) : (
            <>
              {/* Dashboard Tab */}
              {activeTab === "dashboard" && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-gray-800">Dashboard Overview</h2>
                  
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-teal-500">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Available Medicines</p>
                          <p className="text-2xl font-bold text-gray-900">{stats.total_medicines}</p>
                        </div>
                        <Package className="h-8 w-8 text-teal-500" />
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                          <p className="text-2xl font-bold text-gray-900">{stats.pending_requests}</p>
                        </div>
                        <ShoppingCart className="h-8 w-8 text-yellow-500" />
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Completed Deliveries</p>
                          <p className="text-2xl font-bold text-gray-900">{stats.completed_deliveries}</p>
                        </div>
                        <Truck className="h-8 w-8 text-green-500" />
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Low Stock Alerts</p>
                          <p className="text-2xl font-bold text-gray-900">{stats.low_stock_medicines}</p>
                        </div>
                        <AlertCircle className="h-8 w-8 text-red-500" />
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white rounded-xl shadow-md p-6">
                      <h3 className="text-lg font-semibold mb-4 text-gray-800">Recent Requests</h3>
                      <div className="space-y-3">
                        {stockRequests.slice(0, 5).map((request) => (
                          <div key={request.request_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{request.medicine_name}</p>
                              <p className="text-sm text-gray-600">Qty: {request.quantity_requested}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                              {request.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                      <h3 className="text-lg font-semibold mb-4 text-gray-800">Quick Actions</h3>
                      <div className="space-y-3">
                        <button 
                          onClick={() => setActiveTab("medicines")}
                          className="w-full text-left p-4 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
                        >
                          <Package className="h-5 w-5 text-teal-600 inline mr-2" />
                          <span className="font-medium text-teal-800">Browse Medicines</span>
                        </button>
                        <button 
                          onClick={() => setShowRequestForm(true)}
                          className="w-full text-left p-4 bg-cyan-50 rounded-lg hover:bg-cyan-100 transition-colors"
                        >
                          <Plus className="h-5 w-5 text-cyan-600 inline mr-2" />
                          <span className="font-medium text-cyan-800">New Stock Request</span>
                        </button>
                        <button 
                          onClick={() => setActiveTab("deliveries")}
                          className="w-full text-left p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <Truck className="h-5 w-5 text-blue-600 inline mr-2" />
                          <span className="font-medium text-blue-800">Track Deliveries</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Available Medicines Tab */}
              {activeTab === "medicines" && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-gray-800">Available Medicines from Suppliers</h2>
                  
                  {medicines.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow">
                      <Package size={64} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">No medicines available from suppliers</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {medicines.map((medicine) => (
                        <div
                          key={medicine.medicine_id}
                          className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:border-teal-300 transition-all hover:shadow-lg"
                        >
                          <h3 className="font-semibold text-lg text-gray-900 mb-2">
                            {medicine.name}
                          </h3>
                          
                          {medicine.category && (
                            <p className="text-sm text-teal-600 mb-2 font-medium">{medicine.category}</p>
                          )}
                          
                          {medicine.description && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{medicine.description}</p>
                          )}
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Price:</span>
                              <span className="font-semibold text-green-600">
                                Rs. {parseFloat(medicine.price).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Stock:</span>
                              <span className={`font-semibold ${
                                medicine.stock === 0 ? 'text-red-600' : 
                                medicine.stock < 10 ? 'text-yellow-600' : 'text-green-600'
                              }`}>
                                {medicine.stock} units
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Supplier:</span>
                              <span className="font-semibold text-blue-600">
                                {medicine.supplier_name}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Contact:</span>
                              <span className="font-medium">
                                {medicine.supplier_phone}
                              </span>
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
                              setShowRequestForm(true);
                            }}
                            className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:from-teal-600 hover:to-cyan-600 flex items-center justify-center gap-2 transition-all"
                            disabled={medicine.stock === 0}
                          >
                            <ShoppingCart size={16} />
                            {medicine.stock === 0 ? 'Out of Stock' : 'Request Stock'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* My Requests Tab */}
              {activeTab === "requests" && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-gray-800">My Stock Requests</h2>

                  {stockRequests.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow">
                      <ShoppingCart size={64} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">No stock requests yet</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Request stock from suppliers to get started
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {stockRequests.map((request) => (
                        <div
                          key={request.request_id}
                          className="bg-white rounded-xl shadow-md p-6 border-l-4 border-teal-500"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-semibold text-lg">
                                Request #{request.request_id}
                              </h3>
                              <p className="text-sm text-gray-600">
                                Medicine: {request.medicine_name}
                              </p>
                              <p className="text-sm text-gray-600">
                                Supplier: {request.supplier_name}
                              </p>
                              <p className="text-sm text-gray-600">
                                Date: {new Date(request.request_date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right space-y-2">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                                {request.status}
                              </span>
                            </div>
                          </div>

                          <div className="bg-teal-50 rounded-lg p-4 mb-4 border border-teal-200">
                            <p className="text-teal-900">
                              Quantity Requested: <span className="font-semibold">{request.quantity_requested} units</span>
                            </p>
                            {request.notes && (
                              <p className="text-sm text-teal-700 mt-2">
                                <span className="font-semibold">Notes:</span> {request.notes}
                              </p>
                            )}
                          </div>

                          {request.status === "Completed" && (
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg flex-1">
                                <CheckCircle size={20} />
                                <span className="font-medium">Ready to add to your inventory</span>
                              </div>
                              <button
                                onClick={() => handleAddToInventory(request)}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
                              >
                                <Download size={20} />
                                Add to Inventory
                              </button>
                            </div>
                          )}

                          {request.status === "Accepted" && (
                            <div className="flex items-center gap-2 text-blue-600 bg-blue-50 p-3 rounded-lg">
                              <Truck size={20} />
                              <span className="font-medium">Supplier has accepted your request</span>
                            </div>
                          )}

                          {request.status === "Pending" && (
                            <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 p-3 rounded-lg">
                              <AlertCircle size={20} />
                              <span className="font-medium">Waiting for supplier response</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Deliveries Tab */}
              {activeTab === "deliveries" && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-gray-800">Completed Deliveries</h2>

                  {stockRequests.filter(req => req.status === "Completed").length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow">
                      <Truck size={64} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">No completed deliveries yet</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Completed stock requests will appear here
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {stockRequests
                        .filter(req => req.status === "Completed")
                        .map((request) => (
                          <div
                            key={request.request_id}
                            className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="font-semibold text-lg text-gray-900">
                                  {request.medicine_name}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  Request #{request.request_id} • {request.supplier_name}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Ordered: {new Date(request.request_date).toLocaleDateString()}
                                </p>
                                {request.delivery_date && (
                                  <p className="text-sm text-gray-600">
                                    Delivered: {new Date(request.delivery_date).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                              <div className="text-right space-y-2">
                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                                  Completed
                                </span>
                              </div>
                            </div>

                            <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-4 border border-green-200">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-medium text-green-900">Quantity: {request.quantity_requested} units</p>
                                  <p className="text-sm text-green-700 mt-1">
                                    Ready to be added to your pharmacy inventory
                                  </p>
                                </div>
                                <CheckCircle size={32} className="text-green-500" />
                              </div>
                            </div>

                            <button
                              onClick={() => handleAddToInventory(request)}
                              className="w-full mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center gap-2"
                            >
                              <Download size={20} />
                              Add to Pharmacy Inventory
                            </button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Request Stock Modal */}
          {showRequestForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
                <h3 className="text-xl font-semibold mb-4 text-teal-800">
                  {selectedMedicine ? `Request ${selectedMedicine.name}` : 'Request Stock'}
                </h3>
                
                <div className="space-y-4">
                  {!selectedMedicine && (
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        Supplier
                      </label>
                      <select
                        value={requestData.supplier_id}
                        onChange={(e) => setRequestData({ ...requestData, supplier_id: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
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
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        Medicine
                      </label>
                      <select
                        value={requestData.medicine_id}
                        onChange={(e) => setRequestData({ ...requestData, medicine_id: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      >
                        <option value="">Select Medicine</option>
                        {getSupplierMedicines(requestData.supplier_id).map(medicine => (
                          <option key={medicine.medicine_id} value={medicine.medicine_id}>
                            {medicine.name} - Rs. {medicine.price} (Stock: {medicine.stock})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {selectedMedicine && (
                    <div className="bg-teal-50 p-3 rounded-lg">
                      <p className="text-teal-800">
                        <strong>Medicine:</strong> {selectedMedicine.name}
                      </p>
                      <p className="text-teal-800">
                        <strong>Supplier:</strong> {selectedMedicine.supplier_name}
                      </p>
                      <p className="text-teal-800">
                        <strong>Available Stock:</strong> {selectedMedicine.stock} units
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Quantity Needed <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={requestData.quantity_requested}
                      onChange={(e) => setRequestData({ ...requestData, quantity_requested: e.target.value })}
                      placeholder="Enter quantity"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      min="1"
                      max={selectedMedicine ? selectedMedicine.stock : undefined}
                    />
                    {selectedMedicine && (
                      <p className="text-sm text-gray-600 mt-1">
                        Maximum available: {selectedMedicine.stock} units
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={requestData.notes}
                      onChange={(e) => setRequestData({ ...requestData, notes: e.target.value })}
                      placeholder="Any special instructions..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
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
                        pharmacy_name: pharmacistDetails?.pharmacy_name || "My Pharmacy"
                      });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendRequest}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:from-teal-600 hover:to-cyan-600 flex items-center justify-center gap-2 transition-all"
                  >
                    <Send size={20} />
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