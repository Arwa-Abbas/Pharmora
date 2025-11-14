import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Truck,
  Bell,
  User,
  LogOut,
  Home,
  CheckCircle,
  XCircle,
  Plus,
  AlertCircle,
  Edit,
  Save,
  X,
  Search,
} from "lucide-react";

function SupplierDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [activeTab, setActiveTab] = useState("requests");
  const [loading, setLoading] = useState(false);

  // State for stock requests
  const [stockRequests, setStockRequests] = useState([]);
  const [supplierInventory, setSupplierInventory] = useState([]);
  const [supplierDetails, setSupplierDetails] = useState(null);
  const [availableMedicines, setAvailableMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Edit supplier details state
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editedDetails, setEditedDetails] = useState({
    company_name: "",
    contact_number: "",
    address: "",
  });

  // Add new medicine to supplier inventory
  const [newInventoryItem, setNewInventoryItem] = useState({
    medicine_id: "",
    quantity_available: "",
    reorder_level: "20",
    purchase_price: "",
    selling_price: "",
    expiry_date: ""
  });
  const [showAddMedicine, setShowAddMedicine] = useState(false);

  // Edit inventory state
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    if (!user || user.role !== "Supplier") {
      navigate("/login");
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // First get supplier_id from user_id
      const supplierRes = await fetch(`http://localhost:5000/api/supplier/user/${user.id}`);
      const supplierData = await supplierRes.json();
      setSupplierDetails(supplierData);
      setEditedDetails({
        company_name: supplierData.company_name || "",
        contact_number: supplierData.contact_number || "",
        address: supplierData.address || "",
      });

      const supplierId = supplierData.supplier_id;

      // Load stock requests from pharmacists
      const requestsRes = await fetch(`http://localhost:5000/api/supplier/${supplierId}/stock-requests`);
      const requestsData = await requestsRes.json();
      setStockRequests(requestsData);

      // Load supplier's inventory
      const inventoryRes = await fetch(`http://localhost:5000/api/supplier/${supplierId}/inventory`);
      const inventoryData = await inventoryRes.json();
      setSupplierInventory(inventoryData);

      // Load available medicines for dropdown
      const medicinesRes = await fetch(`http://localhost:5000/api/medicines/available`);
      const medicinesData = await medicinesRes.json();
      setAvailableMedicines(medicinesData);

    } catch (err) {
      console.error("Error loading data:", err);
    }
    setLoading(false);
  };

  const handleSignOut = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleAcceptRequest = async (requestId) => {
    if (!window.confirm("Are you sure you want to accept this request?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/stock-requests/${requestId}/accept`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supplier_id: supplierDetails.supplier_id }),
      });

      if (response.ok) {
        alert("Request accepted successfully!");
        loadData();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to accept request");
      }
    } catch (err) {
      console.error("Error accepting request:", err);
      alert("Failed to accept request");
    }
  };

  const handleRejectRequest = async (requestId) => {
    if (!window.confirm("Are you sure you want to reject this request?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/stock-requests/${requestId}/reject`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        alert("Request rejected!");
        loadData();
      } else {
        alert("Failed to reject request");
      }
    } catch (err) {
      console.error("Error rejecting request:", err);
      alert("Failed to reject request");
    }
  };

  const handleCompleteDelivery = async (requestId) => {
    if (!window.confirm("Confirm that this delivery has been completed?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/stock-requests/${requestId}/complete`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        alert("Delivery completed successfully!");
        loadData();
      } else {
        alert("Failed to complete delivery");
      }
    } catch (err) {
      console.error("Error completing delivery:", err);
      alert("Failed to complete delivery");
    }
  };

  const handleUpdateSupplierDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/supplier/${supplierDetails.supplier_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedDetails),
      });

      if (response.ok) {
        alert("Details updated successfully!");
        setIsEditingDetails(false);
        loadData();
      } else {
        alert("Failed to update details");
      }
    } catch (err) {
      console.error("Error updating details:", err);
      alert("Failed to update details");
    }
  };

  const handleAddInventoryItem = async () => {
    if (!newInventoryItem.medicine_id || !newInventoryItem.quantity_available || !newInventoryItem.selling_price) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/supplier/${supplierDetails.supplier_id}/inventory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newInventoryItem),
      });

      if (response.ok) {
        alert("Medicine added to inventory successfully!");
        setNewInventoryItem({
          medicine_id: "",

          quantity_available: "",
          reorder_level: "20",
          purchase_price: "",
          selling_price: "",
          expiry_date: ""
        });
        setShowAddMedicine(false);
        loadData();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to add medicine to inventory");
      }
    } catch (err) {
      console.error("Error adding medicine to inventory:", err);
      alert("Failed to add medicine to inventory");
    }
  };

  const handleUpdateInventory = async (inventoryId, updates) => {
    try {
      const response = await fetch(`http://localhost:5000/api/supplier/inventory/${inventoryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        alert("Inventory updated successfully!");
        setEditingItem(null);
        loadData();
      } else {
        alert("Failed to update inventory");
      }
    } catch (err) {
      console.error("Error updating inventory:", err);
      alert("Failed to update inventory");
    }
  };

  const handleDeleteInventoryItem = async (inventoryId) => {
    if (!window.confirm("Are you sure you want to remove this medicine from inventory?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/supplier/inventory/${inventoryId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Medicine removed from inventory!");
        loadData();
      } else {
        alert("Failed to remove medicine");
      }
    } catch (err) {
      console.error("Error removing medicine:", err);
      alert("Failed to remove medicine");
    }
  };

  const getPendingRequestsCount = () => {
    return stockRequests.filter(req => req.status === "Pending").length;
  };

  const getTotalInventoryValue = () => {
    return supplierInventory.reduce((total, item) => {
      return total + (item.quantity_available * item.selling_price);
    }, 0);
  };

  const getLowStockItems = () => {
    return supplierInventory.filter(item => item.quantity_available <= item.reorder_level);
  };

  // Filter inventory based on search
  const filteredInventory = supplierInventory.filter(item =>
    item.medicine_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase()) 
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-teal-600 to-blue-600 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-teal-500">
          Pharmora Supply
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab("requests")}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
              activeTab === "requests"
                ? "bg-white text-teal-600"
                : "hover:bg-teal-500"
            }`}
          >
            <Bell size={20} />
            <span>Stock Requests</span>
            {getPendingRequestsCount() > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {getPendingRequestsCount()}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("inventory")}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
              activeTab === "inventory"
                ? "bg-white text-teal-600"
                : "hover:bg-teal-500"
            }`}
          >
            <Package size={20} />
            <span>Medicine Inventory</span>
          </button>

          <button
            onClick={() => setActiveTab("deliveries")}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
              activeTab === "deliveries"
                ? "bg-white text-teal-600"
                : "hover:bg-teal-500"
            }`}
          >
            <Truck size={20} />
            <span>Delivery History</span>
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
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome, {supplierDetails?.company_name || user?.name}!
              </h1>
              <p className="text-gray-600">Manage your medicine supply operations</p>
            </div>
            <button
              onClick={() => setIsEditingDetails(true)}
              className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 flex items-center gap-2"
            >
              <User size={20} />
              Edit Company Details
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading...</p>
            </div>
          ) : (
            <>
              {/* Stock Requests Tab */}
              {activeTab === "requests" && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Medicine Restocking Requests</h2>

                  {stockRequests.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                      <Bell size={64} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">No stock requests at the moment</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {stockRequests.map((request) => (
                        <div
                          key={request.request_id}
                          className="bg-white rounded-lg shadow p-6 border-l-4 border-teal-500"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-semibold text-lg">
                                Request #{request.request_id}
                              </h3>
                              <p className="text-sm text-gray-600">
                                From: {request.pharmacist_name} • Pharmacy: {request.pharmacy_name}
                              </p>
                              <p className="text-sm text-gray-600">
                                Date: {new Date(request.request_date).toLocaleDateString()}
                              </p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                request.status === "Completed"
                                  ? "bg-green-100 text-green-700"
                                  : request.status === "Accepted"
                                  ? "bg-blue-100 text-blue-700"
                                  : request.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {request.status}
                            </span>
                          </div>

                          <div className="bg-teal-50 rounded p-4 mb-4">
                            <h4 className="font-semibold mb-2 text-teal-800">Requested Medicine:</h4>
                            <p className="text-lg font-medium text-teal-900">{request.medicine_name}</p>
                            <p className="text-teal-700">Quantity: {request.quantity_requested} units</p>
                            {request.notes && (
                              <p className="text-sm text-teal-700 mt-2">
                                <span className="font-semibold">Notes:</span> {request.notes}
                              </p>
                            )}
                          </div>

                          {request.status === "Pending" && (
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleAcceptRequest(request.request_id)}
                                className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 flex items-center justify-center gap-2"
                              >
                                <CheckCircle size={20} />
                                Accept Request
                              </button>
                              <button
                                onClick={() => handleRejectRequest(request.request_id)}
                                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center gap-2"
                              >
                                <XCircle size={20} />
                                Reject Request
                              </button>
                            </div>
                          )}

                          {request.status === "Accepted" && (
                            <button
                              onClick={() => handleCompleteDelivery(request.request_id)}
                              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"
                            >
                              <Truck size={20} />
                              Mark as Delivered
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Inventory Tab */}
              {activeTab === "inventory" && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-2xl font-bold">Medicine Inventory</h2>
                      <p className="text-gray-600 mt-1">
                        Total Value: Rs. {getTotalInventoryValue().toFixed(2)} | 
                        Total Items: {supplierInventory.length} | 
                        Low Stock: {getLowStockItems().length}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowAddMedicine(!showAddMedicine)}
                      className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 flex items-center gap-2"
                    >
                      <Plus size={20} />
                      Add to Inventory
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className="mb-6">
                    <div className="relative max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        placeholder="Search by medicine name or category"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                  </div>

                  {/* Add Medicine Form */}
                  {showAddMedicine && (
                    <div className="bg-white rounded-lg shadow p-6 mb-6 border border-teal-200">
                      <h3 className="text-xl font-semibold mb-4 text-teal-800">Add Medicine to Inventory</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700">
                            Medicine <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={newInventoryItem.medicine_id}
                            onChange={(e) =>
                              setNewInventoryItem({ ...newInventoryItem, medicine_id: e.target.value })
                            }
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          >
                            <option value="">Select Medicine</option>
                            {availableMedicines.map(medicine => (
                              <option key={medicine.medicine_id} value={medicine.medicine_id}>
                                {medicine.name} - {medicine.category}
                              </option>
                            ))}
                          </select>
                        </div>


                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700">
                            Quantity Available <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            value={newInventoryItem.quantity_available}
                            onChange={(e) =>
                              setNewInventoryItem({ ...newInventoryItem, quantity_available: e.target.value })
                            }
                            placeholder="Enter quantity"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            min="0"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700">
                            Reorder Level
                          </label>
                          <input
                            type="number"
                            value={newInventoryItem.reorder_level}
                            onChange={(e) =>
                              setNewInventoryItem({ ...newInventoryItem, reorder_level: e.target.value })
                            }
                            placeholder="Reorder level"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            min="0"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700">
                            Purchase Price (Rs.)
                          </label>
                          <input
                            type="number"
                            value={newInventoryItem.purchase_price}
                            onChange={(e) =>
                              setNewInventoryItem({ ...newInventoryItem, purchase_price: e.target.value })
                            }
                            placeholder="Purchase price"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            min="0"
                            step="0.01"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700">
                            Selling Price (Rs.) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            value={newInventoryItem.selling_price}
                            onChange={(e) =>
                              setNewInventoryItem({ ...newInventoryItem, selling_price: e.target.value })
                            }
                            placeholder="Selling price"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            min="0"
                            step="0.01"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700">
                            Expiry Date
                          </label>
                          <input
                            type="date"
                            value={newInventoryItem.expiry_date}
                            onChange={(e) =>
                              setNewInventoryItem({ ...newInventoryItem, expiry_date: e.target.value })
                            }
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => setShowAddMedicine(false)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAddInventoryItem}
                          className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 flex items-center justify-center gap-2"
                        >
                          <Save size={20} />
                          Add to Inventory
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Inventory List */}
                  {supplierInventory.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                      <Package size={64} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">No medicines in inventory</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Add medicines to start managing your inventory
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredInventory.map((item) => (
                        <div
                          key={item.inventory_id}
                          className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:border-teal-300 transition-colors"
                        >
                          {editingItem === item.inventory_id ? (
                            <EditInventoryForm
                              item={item}
                              onSave={(updates) => handleUpdateInventory(item.inventory_id, updates)}
                              onCancel={() => setEditingItem(null)}
                            />
                          ) : (
                            <>
                              <div className="flex justify-between items-start mb-3">
                                <h3 className="font-semibold text-lg text-gray-900">{item.medicine_name}</h3>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => setEditingItem(item.inventory_id)}
                                    className="p-1 text-blue-600 hover:text-blue-800"
                                  >
                                    <Edit size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteInventoryItem(item.inventory_id)}
                                    className="p-1 text-red-600 hover:text-red-800"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              </div>
                              
                              {item.category && (
                                <p className="text-sm text-teal-600 mb-2 font-medium">{item.category}</p>
                              )}
                              
                              {item.description && (
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                              )}
                              
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Stock:</span>
                                  <span className={`font-semibold ${
                                    item.quantity_available <= item.reorder_level ? 'text-red-600' : 
                                    item.quantity_available < 50 ? 'text-yellow-600' : 'text-green-600'
                                  }`}>
                                    {item.quantity_available} units
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Reorder Level:</span>
                                  <span className="font-semibold">{item.reorder_level} units</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Purchase Price:</span>
                                  <span className="font-semibold">Rs. {parseFloat(item.purchase_price || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Selling Price:</span>
                                  <span className="font-semibold">Rs. {parseFloat(item.selling_price).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Total Value:</span>
                                  <span className="font-semibold text-teal-600">
                                    Rs. {(item.quantity_available * item.selling_price).toFixed(2)}
                                  </span>
                                </div>
                                {item.expiry_date && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Expiry:</span>
                                    <span className="font-semibold">
                                      {new Date(item.expiry_date).toLocaleDateString()}
                                    </span>
                                  </div>
                                )}
                              </div>
                              
                              {item.quantity_available <= item.reorder_level && (
                                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded flex items-center gap-2">
                                  <AlertCircle size={16} className="text-red-600" />
                                  <span className="text-xs text-red-700 font-medium">Low stock - Reorder needed</span>
                                </div>
                              )}
                            </>
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
                  <h2 className="text-2xl font-bold mb-6">Delivery History</h2>

                  {stockRequests.filter(req => req.status === "Accepted" || req.status === "Completed").length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                      <Truck size={64} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">No delivery history yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {stockRequests
                        .filter(req => req.status === "Accepted" || req.status === "Completed")
                        .map((request) => (
                          <div
                            key={request.request_id}
                            className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="font-semibold text-lg">
                                  Delivery #{request.request_id}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  To: {request.pharmacist_name} • {request.pharmacy_name}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Date: {new Date(request.request_date).toLocaleDateString()}
                                </p>
                              </div>
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  request.status === "Completed"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-blue-100 text-blue-700"
                                }`}
                              >
                                {request.status}
                              </span>
                            </div>

                            <div className="bg-blue-50 rounded p-4 mb-4">
                              <p className="font-medium text-blue-900">{request.medicine_name}</p>
                              <p className="text-blue-700">Quantity Delivered: {request.quantity_requested} units</p>
                            </div>

                            {request.status === "Accepted" && (
                              <button
                                onClick={() => handleCompleteDelivery(request.request_id)}
                                className="w-full px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 flex items-center justify-center gap-2"
                              >
                                <CheckCircle size={20} />
                                Mark as Delivered
                              </button>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Edit Company Details Modal */}
          {isEditingDetails && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
                <h3 className="text-xl font-semibold mb-4 text-teal-800">Edit Company Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={editedDetails.company_name}
                      onChange={(e) =>
                        setEditedDetails({ ...editedDetails, company_name: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Contact Number
                    </label>
                    <input
                      type="text"
                      value={editedDetails.contact_number}
                      onChange={(e) =>
                        setEditedDetails({ ...editedDetails, contact_number: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Address
                    </label>
                    <textarea
                      value={editedDetails.address}
                      onChange={(e) =>
                        setEditedDetails({ ...editedDetails, address: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      rows="3"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setIsEditingDetails(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateSupplierDetails}
                    className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 flex items-center justify-center gap-2"
                  >
                    <Save size={20} />
                    Save Changes
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

// Edit Inventory Form Component
function EditInventoryForm({ item, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    quantity_available: item.quantity_available || "",
    reorder_level: item.reorder_level || "",
    purchase_price: item.purchase_price || "",
    selling_price: item.selling_price || "",
    expiry_date: item.expiry_date || ""
  });

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-gray-900">{item.medicine_name}</h4>
      
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-700">Stock</label>
          <input
            type="number"
            value={formData.quantity_available}
            onChange={(e) => setFormData({ ...formData, quantity_available: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded text-sm"
            min="0"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-700">Reorder Level</label>
          <input
            type="number"
            value={formData.reorder_level}
            onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded text-sm"
            min="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-700">Purchase Price</label>
          <input
            type="number"
            value={formData.purchase_price}
            onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded text-sm"
            step="0.01"
            min="0"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-700">Selling Price</label>
          <input
            type="number"
            value={formData.selling_price}
            onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded text-sm"
            step="0.01"
            min="0"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium mb-1 text-gray-700">Expiry Date</label>
        <input
          type="date"
          value={formData.expiry_date}
          onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded text-sm"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={handleSave}
          className="flex-1 px-3 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 text-sm"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="flex-1 px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default SupplierDashboard;