import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "./NotificationContext";
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
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Clock,
  RefreshCw,
} from "lucide-react";

function SupplierDashboard() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const user = JSON.parse(localStorage.getItem("user"));
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);

  // State for data
  const [stockRequests, setStockRequests] = useState([]);
  const [supplierInventory, setSupplierInventory] = useState([]);
  const [supplierDetails, setSupplierDetails] = useState(null);
  const [availableMedicines, setAvailableMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    pending_requests: 0,
    total_inventory_items: 0,
    total_inventory_value: 0,
    low_stock_items: 0,
    completed_deliveries: 0
  });
  
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

  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Loading states for specific actions
  const [processingRequest, setProcessingRequest] = useState(null);

  useEffect(() => {
    if (!user || user.role !== "Supplier") {
      navigate("/login");
      return;
    }
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Get supplier details from user_id
      const supplierRes = await fetch(`http://localhost:5000/api/supplier/user/${user.id}`);
      const supplierData = await supplierRes.json();
      setSupplierDetails(supplierData);
      setEditedDetails({
        company_name: supplierData.company_name || "",
        contact_number: supplierData.phone || "",
        address: supplierData.address || "",
      });

      const supplierId = supplierData.supplier_id;

      // Load all data in parallel for better performance
      const [statsRes, requestsRes, inventoryRes, medicinesRes] = await Promise.all([
        fetch(`http://localhost:5000/api/supplier/${supplierId}/stats`),
        fetch(`http://localhost:5000/api/supplier/${supplierId}/stock-requests`),
        fetch(`http://localhost:5000/api/supplier/${supplierId}/inventory`),
        fetch(`http://localhost:5000/api/medicines/available`)
      ]);

      const statsData = await statsRes.json();
      const requestsData = await requestsRes.json();
      const inventoryData = await inventoryRes.json();
      const medicinesData = await medicinesRes.json();

      setStats(statsData);
      setStockRequests(requestsData);
      setSupplierInventory(inventoryData);
      setAvailableMedicines(medicinesData);

      // Generate notifications
      generateNotifications(requestsData, inventoryData);

    } catch (err) {
      console.error("Error loading data:", err);
      showNotification("Failed to load dashboard data", "error");
    }
    setLoading(false);
  };

  const generateNotifications = (requests, inventory) => {
    const notifs = [];
    
    // Pending requests notifications
    const pendingRequests = requests.filter(r => r.status === 'Pending');
    if (pendingRequests.length > 0) {
      notifs.push({
        id: 'pending-requests',
        type: 'request',
        message: `You have ${pendingRequests.length} pending stock request${pendingRequests.length > 1 ? 's' : ''}`,
        count: pendingRequests.length,
        priority: 'high'
      });
    }

    // Accepted but not shipped notifications
    const acceptedRequests = requests.filter(r => r.status === 'Accepted' && r.delivery_status === 'NotShipped');
    if (acceptedRequests.length > 0) {
      notifs.push({
        id: 'accepted-orders',
        type: 'delivery',
        message: `${acceptedRequests.length} order${acceptedRequests.length > 1 ? 's are' : ' is'} ready to ship`,
        count: acceptedRequests.length,
        priority: 'medium'
      });
    }

    // Shipped but not delivered notifications
    const shippedRequests = requests.filter(r => r.delivery_status === 'Shipped');
    if (shippedRequests.length > 0) {
      notifs.push({
        id: 'shipped-orders',
        type: 'delivery',
        message: `${shippedRequests.length} order${shippedRequests.length > 1 ? 's are' : ' is'} in transit`,
        count: shippedRequests.length,
        priority: 'medium'
      });
    }

    // Low stock notifications
    const lowStockItems = inventory.filter(item => item.quantity_available <= item.reorder_level);
    if (lowStockItems.length > 0) {
      notifs.push({
        id: 'low-stock',
        type: 'warning',
        message: `${lowStockItems.length} medicine${lowStockItems.length > 1 ? 's are' : ' is'} running low on stock`,
        count: lowStockItems.length,
        priority: 'medium'
      });
    }

    setNotifications(notifs);
  };

  const handleSignOut = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const checkInventoryStatus = async (medicineId, quantityRequested) => {
    try {
      // Check both supplier inventory and medicines table for availability
      const inventoryItem = supplierInventory.find(item => item.medicine_id === medicineId);
      
      if (!inventoryItem) {
        return { 
          hasEnough: false, 
          available: 0, 
          message: "Medicine not found in your inventory. Please add it first." 
        };
      }
      
      if (inventoryItem.quantity_available < quantityRequested) {
        return { 
          hasEnough: false, 
          available: inventoryItem.quantity_available, 
          message: `Insufficient stock. Available: ${inventoryItem.quantity_available}, Requested: ${quantityRequested}` 
        };
      }
      
      return { 
        hasEnough: true, 
        available: inventoryItem.quantity_available, 
        message: `Sufficient stock available: ${inventoryItem.quantity_available} units` 
      };
    } catch (err) {
      console.error("Error checking inventory:", err);
      return { hasEnough: false, available: 0, message: "Error checking inventory" };
    }
  };

  const handleAcceptRequest = async (requestId) => {
    setProcessingRequest(requestId);
    
    try {
      const request = stockRequests.find(r => r.request_id === requestId);
      if (!request) {
        showNotification("Request not found", "error");
        return;
      }

      // Check inventory before accepting
      const inventoryStatus = await checkInventoryStatus(request.medicine_id, request.quantity_requested);
      
      if (!inventoryStatus.hasEnough) {
        showNotification(`Cannot accept request: ${inventoryStatus.message}`, "warning");
        return;
      }

      if (!window.confirm(`Accept request for ${request.quantity_requested} units of ${request.medicine_name}?`)) {
        return;
      }

      const response = await fetch(`http://localhost:5000/api/stock-requests/${requestId}/accept`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        showNotification("Request accepted successfully!", "success");
        await loadData(); // Reload to get updated data
      } else {
        const errorData = await response.json();
        showNotification(errorData.error || "Failed to accept request", "error");
      }
    } catch (err) {
      console.error("Error accepting request:", err);
      showNotification("Failed to accept request", "error");
    } finally {
      setProcessingRequest(null);
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
      showNotification("Request rejected!", "success");
      await loadData();
    } else {
      const errorData = await response.json();
      showNotification(errorData.error || "Failed to reject request", "error");
    }
  } catch (err) {
    console.error("Error rejecting request:", err);
    showNotification("Failed to reject request", "error");
  }
};

  const handleShipOrder = async (requestId) => {
    const trackingInfo = window.prompt("Enter tracking information (optional):");
    
    try {
      const response = await fetch(`http://localhost:5000/api/stock-requests/${requestId}/ship`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tracking_info: trackingInfo || "" })
      });

      if (response.ok) {
        showNotification("Order marked as shipped!", "success");
        await loadData();
      } else {
        const errorData = await response.json();
        showNotification(errorData.error || "Failed to ship order", "error");
      }
    } catch (err) {
      console.error("Error shipping order:", err);
      showNotification("Failed to ship order", "error");
    }
  };

  const handleMarkDelivered = async (requestId) => {
    if (!window.confirm("Mark this order as delivered? This will update your inventory stock.")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/stock-requests/${requestId}/deliver`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        showNotification("Order marked as delivered! Inventory updated.", "success");
        await loadData();
      } else {
        const errorData = await response.json();
        showNotification(errorData.error || "Failed to mark as delivered", "error");
      }
    } catch (err) {
      console.error("Error marking as delivered:", err);
      showNotification("Failed to mark as delivered", "error");
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
        showNotification("Details updated successfully!", "success");
        setIsEditingDetails(false);
        await loadData();
      } else {
        showNotification("Failed to update details", "error");
      }
    } catch (err) {
      console.error("Error updating details:", err);
      showNotification("Failed to update details", "error");
    }
  };

  const handleAddInventoryItem = async () => {
    if (!newInventoryItem.medicine_id || !newInventoryItem.quantity_available || !newInventoryItem.selling_price) {
      showNotification("Please fill in all required fields (Medicine, Quantity, Selling Price)", "warning");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/supplier/${supplierDetails.supplier_id}/inventory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newInventoryItem),
      });

      if (response.ok) {
        showNotification("Medicine added to inventory successfully!", "success");
        setNewInventoryItem({
          medicine_id: "",
          quantity_available: "",
          reorder_level: "20",
          purchase_price: "",
          selling_price: "",
          expiry_date: ""
        });
        setShowAddMedicine(false);
        await loadData();
      } else {
        const errorData = await response.json();
        showNotification(errorData.error || "Failed to add medicine to inventory", "error");
      }
    } catch (err) {
      console.error("Error adding medicine to inventory:", err);
      showNotification("Failed to add medicine to inventory", "error");
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
        showNotification("Inventory updated successfully!", "success");
        setEditingItem(null);
        await loadData();
      } else {
        showNotification("Failed to update inventory", "error");
      }
    } catch (err) {
      console.error("Error updating inventory:", err);
      showNotification("Failed to update inventory", "error");
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
        showNotification("Medicine removed from inventory!", "success");
        await loadData();
      } else {
        showNotification("Failed to remove medicine", "error");
      }
    } catch (err) {
      console.error("Error removing medicine:", err);
      showNotification("Failed to remove medicine", "error");
    }
  };

  // Filter inventory based on search
  const filteredInventory = supplierInventory.filter(item =>
    item.medicine_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase()) 
  );

  const getLowStockItems = () => {
    return supplierInventory.filter(item => item.quantity_available <= item.reorder_level);
  };

  const getRequestsByStatus = (status) => {
    return stockRequests.filter(request => request.status === status);
  };

  const getDeliveryHistory = () => {
    return stockRequests.filter(request => 
      request.status === 'Completed' || 
      request.delivery_status === 'Delivered' ||
      request.delivery_status === 'Shipped'
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-teal-600 to-blue-600 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-teal-500">
          Pharmora Supply
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
              activeTab === "dashboard"
                ? "bg-white text-teal-600"
                : "hover:bg-teal-500"
            }`}
          >
            <TrendingUp size={20} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab("requests")}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
              activeTab === "requests"
                ? "bg-white text-teal-600"
                : "hover:bg-teal-500"
            }`}
          >
            <ShoppingCart size={20} />
            <span>Stock Requests</span>
            {stats.pending_requests > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {stats.pending_requests}
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
            <span>Inventory</span>
            {stats.low_stock_items > 0 && (
              <span className="ml-auto bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {stats.low_stock_items}
              </span>
            )}
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
            <span>Deliveries</span>
            {stockRequests.filter(req => req.delivery_status === "Shipped" || req.status === "Accepted").length > 0 && (
              <span className="ml-auto bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {stockRequests.filter(req => req.delivery_status === "Shipped" || req.status === "Accepted").length}
              </span>
            )}
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
                Welcome, {supplierDetails?.company_name || user?.name}!
              </h1>
              <p className="text-gray-600">Manage your medicine supply operations</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {notifications.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => loadData()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
              >
                <RefreshCw size={20} />
                Refresh
              </button>
              <button
                onClick={() => setIsEditingDetails(true)}
                className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 flex items-center gap-2"
              >
                <User size={20} />
                Edit Details
              </button>
            </div>
          </div>

          {/* Notifications Dropdown */}
          {showNotifications && notifications.length > 0 && (
            <div className="mb-6 bg-white rounded-lg shadow-lg p-4 border-l-4 border-yellow-500">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Bell size={20} className="text-yellow-600" />
                Notifications
              </h3>
              <div className="space-y-2">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-lg border ${
                      notif.priority === 'high'
                        ? 'bg-red-50 border-red-200'
                        : 'bg-yellow-50 border-yellow-200'
                    }`}
                  >
                    <p className="text-sm font-medium text-gray-800">{notif.message}</p>
                    <button
                      onClick={() => {
                        if (notif.type === 'request') setActiveTab('requests');
                        if (notif.type === 'delivery') setActiveTab('deliveries');
                        if (notif.type === 'warning') setActiveTab('inventory');
                        setShowNotifications(false);
                      }}
                      className="text-xs text-teal-600 hover:text-teal-800 mt-1"
                    >
                      View Details →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

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
                  <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
                  
                  {/* Statistics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Pending Requests</p>
                          <p className="text-3xl font-bold text-gray-900">{stats.pending_requests}</p>
                        </div>
                        <ShoppingCart size={32} className="text-yellow-500" />
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-teal-500">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Inventory Items</p>
                          <p className="text-3xl font-bold text-gray-900">{stats.total_inventory_items}</p>
                        </div>
                        <Package size={32} className="text-teal-500" />
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Total Value</p>
                          <p className="text-3xl font-bold text-gray-900">
                            Rs. {stats.total_inventory_value.toFixed(0)}
                          </p>
                        </div>
                        <DollarSign size={32} className="text-green-500" />
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Low Stock Items</p>
                          <p className="text-3xl font-bold text-gray-900">{stats.low_stock_items}</p>
                        </div>
                        <AlertCircle size={32} className="text-red-500" />
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-lg font-semibold mb-4 text-teal-800">Quick Actions</h3>
                      <div className="space-y-3">
                        <button
                          onClick={() => setActiveTab("requests")}
                          className="w-full text-left p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <ShoppingCart className="h-5 w-5 text-blue-600 inline mr-2" />
                          <span className="font-medium text-blue-800">View Pending Requests</span>
                        </button>
                        <button
                          onClick={() => setActiveTab("deliveries")}
                          className="w-full text-left p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                        >
                          <Truck className="h-5 w-5 text-green-600 inline mr-2" />
                          <span className="font-medium text-green-800">Track Deliveries</span>
                        </button>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-lg font-semibold mb-4 text-teal-800">Recent Activity</h3>
                      <div className="space-y-3">
                        {stockRequests.slice(0, 5).map(request => (
                          <div key={request.request_id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <div>
                              <p className="font-medium text-sm">{request.medicine_name}</p>
                              <p className="text-xs text-gray-600">{request.pharmacy_name}</p>
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
                          <p className="text-gray-500 text-sm text-center py-4">No recent activity</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Stock Requests Tab */}
              {activeTab === "requests" && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Medicine Restocking Requests</h2>

                  {/* Request Status Tabs */}
                  <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
                    <button
                      onClick={() => setActiveTab("requests")}
                      className="flex-1 py-2 px-4 text-center rounded-md bg-white text-teal-600 font-medium shadow-sm"
                    >
                      All Requests ({stockRequests.length})
                    </button>
                  </div>

                  {stockRequests.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                      <ShoppingCart size={64} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">No stock requests at the moment</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Pending Requests */}
                      {getRequestsByStatus('Pending').length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4 text-yellow-700 flex items-center gap-2">
                            <Clock size={20} />
                            Pending Requests ({getRequestsByStatus('Pending').length})
                          </h3>
                          <div className="space-y-4">
                            {getRequestsByStatus('Pending').map((request) => (
                              <RequestCard 
                                key={request.request_id} 
                                request={request} 
                                onAccept={handleAcceptRequest}
                                onReject={handleRejectRequest}
                                onCheckInventory={checkInventoryStatus}
                                processingRequest={processingRequest}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Accepted Requests */}
                      {getRequestsByStatus('Accepted').length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4 text-blue-700 flex items-center gap-2">
                            <CheckCircle size={20} />
                            Accepted Requests ({getRequestsByStatus('Accepted').length})
                          </h3>
                          <div className="space-y-4">
                            {getRequestsByStatus('Accepted').map((request) => (
                              <RequestCard 
                                key={request.request_id} 
                                request={request} 
                                onAccept={handleAcceptRequest}
                                onReject={handleRejectRequest}
                                onShip={handleShipOrder}
                                processingRequest={processingRequest}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Completed Requests */}
                      {getRequestsByStatus('Completed').length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4 text-green-700 flex items-center gap-2">
                            <CheckCircle size={20} />
                            Completed Requests ({getRequestsByStatus('Completed').length})
                          </h3>
                          <div className="space-y-4">
                            {getRequestsByStatus('Completed').map((request) => (
                              <RequestCard 
                                key={request.request_id} 
                                request={request} 
                                processingRequest={processingRequest}
                              />
                            ))}
                          </div>
                        </div>
                      )}
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
                        Total Value: Rs. {stats.total_inventory_value.toFixed(2)} | 
                        Total Items: {stats.total_inventory_items} | 
                        Low Stock: {stats.low_stock_items}
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
                      <AddMedicineForm
                        newInventoryItem={newInventoryItem}
                        setNewInventoryItem={setNewInventoryItem}
                        availableMedicines={availableMedicines}
                        onSave={handleAddInventoryItem}
                        onCancel={() => setShowAddMedicine(false)}
                      />
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
                        <InventoryCard
                          key={item.inventory_id}
                          item={item}
                          editingItem={editingItem}
                          setEditingItem={setEditingItem}
                          onUpdate={handleUpdateInventory}
                          onDelete={handleDeleteInventoryItem}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Deliveries Tab */}
              {activeTab === "deliveries" && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Delivery Tracking & History</h2>

                  {getDeliveryHistory().length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                      <Truck size={64} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">No delivery history yet</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Accepted stock requests will appear here once processed
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* In Transit */}
                      {getDeliveryHistory().filter(req => req.delivery_status === 'Shipped').length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4 text-blue-700 flex items-center gap-2">
                            <Truck size={20} />
                            In Transit ({getDeliveryHistory().filter(req => req.delivery_status === 'Shipped').length})
                          </h3>
                          <div className="space-y-4">
                            {getDeliveryHistory()
                              .filter(req => req.delivery_status === 'Shipped')
                              .map((request) => (
                                <DeliveryCard 
                                  key={request.request_id} 
                                  request={request} 
                                  onDeliver={handleMarkDelivered}
                                />
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Delivery History */}
                      {getDeliveryHistory().filter(req => req.status === 'Completed' || req.delivery_status === 'Delivered').length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4 text-green-700 flex items-center gap-2">
                            <CheckCircle size={20} />
                            Delivered ({getDeliveryHistory().filter(req => req.status === 'Completed' || req.delivery_status === 'Delivered').length})
                          </h3>
                          <div className="space-y-4">
                            {getDeliveryHistory()
                              .filter(req => req.status === 'Completed' || req.delivery_status === 'Delivered')
                              .map((request) => (
                                <DeliveryCard 
                                  key={request.request_id} 
                                  request={request} 
                                />
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Edit Company Details Modal */}
          {isEditingDetails && (
            <EditDetailsModal
              editedDetails={editedDetails}
              setEditedDetails={setEditedDetails}
              onSave={handleUpdateSupplierDetails}
              onCancel={() => setIsEditingDetails(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Component for Request Card
function RequestCard({ request, onAccept, onReject, onShip, onCheckInventory, processingRequest }) {
  const [inventoryStatus, setInventoryStatus] = useState(null);

  const handleCheckInventory = async () => {
    const status = await onCheckInventory(request.medicine_id, request.quantity_requested);
    setInventoryStatus(status);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-teal-500">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg">
            Request #{request.request_id}
          </h3>
          <p className="text-sm text-gray-600">
            From: <span className="font-medium">{request.pharmacist_name}</span> • Pharmacy: <span className="font-medium">{request.pharmacy_name}</span>
          </p>
          <p className="text-sm text-gray-600">
            Contact: {request.pharmacist_email} • {request.pharmacist_phone}
          </p>
          <p className="text-sm text-gray-600">
            Date: {new Date(request.request_date).toLocaleDateString()}
          </p>
          
          {/* Delivery Status Badge */}
          {request.delivery_status && (
            <div className="mt-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                request.delivery_status === 'NotShipped' ? 'bg-gray-100 text-gray-700' :
                request.delivery_status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                request.delivery_status === 'Delivered' ? 'bg-green-100 text-green-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                Delivery: {request.delivery_status}
              </span>
              {request.tracking_info && (
                <p className="text-xs text-gray-600 mt-1">
                  Tracking: {request.tracking_info}
                </p>
              )}
            </div>
          )}
        </div>
        <div className="text-right">
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
      </div>

      <div className="bg-teal-50 rounded p-4 mb-4">
        <h4 className="font-semibold mb-2 text-teal-800">Requested Medicine:</h4>
        <p className="text-lg font-medium text-teal-900">{request.medicine_name}</p>
        <p className="text-sm text-teal-700">{request.category}</p>
        <p className="text-teal-700 mt-1">Quantity Requested: <span className="font-semibold">{request.quantity_requested} units</span></p>
        {request.notes && (
          <p className="text-sm text-teal-700 mt-2">
            <span className="font-semibold">Notes:</span> {request.notes}
          </p>
        )}
      </div>

      {/* Inventory Check for Pending Requests */}
      {request.status === "Pending" && (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700 font-medium">Inventory Check:</p>
          <p className="text-sm text-blue-600">
            You need {request.quantity_requested} units of {request.medicine_name}
          </p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleCheckInventory}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Check Inventory
            </button>
            {inventoryStatus && (
              <span className={`text-sm font-medium ${
                inventoryStatus.hasEnough ? 'text-green-600' : 'text-red-600'
              }`}>
                {inventoryStatus.message}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 mt-4">
        {request.status === "Pending" && (
          <>
            <button
              onClick={() => onAccept(request.request_id)}
              disabled={processingRequest === request.request_id}
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-green-300 flex items-center justify-center gap-2"
            >
              {processingRequest === request.request_id ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <CheckCircle size={16} />
              )}
              Accept Request
            </button>
            <button
              onClick={() => onReject(request.request_id)}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center gap-2"
            >
              <XCircle size={16} />
              Reject
            </button>
          </>
        )}

        {request.status === "Accepted" && request.delivery_status === "NotShipped" && (
          <button
            onClick={() => onShip(request.request_id)}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"
          >
            <Truck size={16} />
            Mark as Shipped
          </button>
        )}

        {request.status === "Accepted" && request.delivery_status === "Shipped" && (
          <button
            onClick={() => onShip(request.request_id)}
            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center gap-2"
          >
            <CheckCircle size={16} />
            Mark as Delivered
          </button>
        )}
      </div>
    </div>
  );
}

// Component for Inventory Card
function InventoryCard({ item, editingItem, setEditingItem, onUpdate, onDelete }) {
  const [formData, setFormData] = useState({
    quantity_available: item.quantity_available || "",
    reorder_level: item.reorder_level || "",
    purchase_price: item.purchase_price || "",
    selling_price: item.selling_price || "",
    expiry_date: item.expiry_date ? item.expiry_date.split('T')[0] : ""
  });

  const handleSave = () => {
    onUpdate(item.inventory_id, formData);
  };

  if (editingItem === item.inventory_id) {
    return (
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
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
              onClick={() => setEditingItem(null)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:border-teal-300 transition-colors">
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
            onClick={() => onDelete(item.inventory_id)}
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
    </div>
  );
}

// Component for Delivery Card
function DeliveryCard({ request, onDeliver }) {
  return (
    <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${
      request.delivery_status === "Delivered" || request.status === "Completed" 
        ? "border-green-500" 
        : "border-blue-500"
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg">
            {request.delivery_status === "Delivered" || request.status === "Completed"
              ? "Delivered" 
              : "In Transit"} - Request #{request.request_id}
          </h3>
          <p className="text-sm text-gray-600">
            To: {request.pharmacist_name} • {request.pharmacy_name}
          </p>
          <p className="text-sm text-gray-600">
            Contact: {request.pharmacist_email} • {request.pharmacist_phone}
          </p>
          <p className="text-sm text-gray-600">
            Request Date: {new Date(request.request_date).toLocaleDateString()}
          </p>
          
          {/* Delivery Timeline */}
          <div className="mt-3 space-y-1">
            {request.shipped_date && (
              <p className="text-sm text-blue-600">
                Shipped on: {new Date(request.shipped_date).toLocaleDateString()}
              </p>
            )}
            {request.delivery_date && (
              <p className="text-sm text-green-600">
                Delivered on: {new Date(request.delivery_date).toLocaleDateString()}
              </p>
            )}
            {request.tracking_info && (
              <p className="text-sm text-gray-600">
                Tracking: {request.tracking_info}
              </p>
            )}
          </div>
        </div>
        <div className="text-right">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              request.delivery_status === "Delivered" || request.status === "Completed"
                ? "bg-green-100 text-green-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {request.delivery_status === "Delivered" || request.status === "Completed"
              ? "Delivered" 
              : "In Transit"}
          </span>
          {request.delivery_status === "Delivered" || request.status === "Completed" ? (
            <p className="text-sm text-green-600 mt-1 font-medium">
              Delivered to pharmacy
            </p>
          ) : (
            <p className="text-sm text-blue-600 mt-1">
              On the way to pharmacy
            </p>
          )}
        </div>
      </div>

          <div
      className={`rounded p-4 mb-4 ${
        request.delivery_status === "Delivered" || request.status === "Completed"
          ? "bg-green-50"
          : "bg-blue-50"
      }`}
    >
      <p className="font-medium text-gray-900">{request.medicine_name}</p>
      <p className="text-sm text-gray-700">{request.category}</p>

      <p className="text-gray-700 mt-1">
        Quantity: <span className="font-semibold">{request.quantity_requested} units</span>
      </p>

      {request.delivery_status === "Delivered" || request.status === "Completed" ? (
        <></> // removed the text completely
      ) : (
        <p className="text-blue-700 mt-2">Expected delivery soon</p>
      )}
    </div>


      {request.delivery_status === "Shipped" && onDeliver && (
        <button
          onClick={() => onDeliver(request.request_id)}
          className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center gap-2"
        >
          <CheckCircle size={20} />
          Mark as Delivered
        </button>
      )}
    </div>
  );
}

// Component for Add Medicine Form
function AddMedicineForm({ newInventoryItem, setNewInventoryItem, availableMedicines, onSave, onCancel }) {
  return (
    <>
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
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 flex items-center justify-center gap-2"
        >
          <Save size={20} />
          Add to Inventory
        </button>
      </div>
    </>
  );
}

// Component for Edit Details Modal
function EditDetailsModal({ editedDetails, setEditedDetails, onSave, onCancel }) {
  return (
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
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 flex items-center justify-center gap-2"
          >
            <Save size={20} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default SupplierDashboard;