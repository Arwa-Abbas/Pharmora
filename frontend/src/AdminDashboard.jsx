import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  Package, 
  ShoppingCart, 
  FileText, 
  Trash2, 
  Edit,
  Save,
  X,
  Plus,
  BarChart3,
  User,
  LogOut,
  Home,
  DollarSign,
  Download,
  Search,
  RefreshCw
} from "lucide-react";

function AdminDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showAddUser, setShowAddUser] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    role: "Patient",
    password: ""
  });

  useEffect(() => {
    if (!user || user.role !== "Admin") {
      navigate("/login");
      return;
    }
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === "users") {
        console.log("Fetching users from API...");
        const usersRes = await fetch("http://localhost:5000/api/admin/users");
        console.log("Response status:", usersRes.status);
        
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          console.log("Users data received:", usersData);
          setUsers(usersData);
        } else {
          const errorText = await usersRes.text();
          console.error("Failed to fetch users:", errorText);
          alert("Failed to load users data: " + usersRes.status);
        }
      } else if (activeTab === "dashboard") {
        const statsRes = await fetch("http://localhost:5000/api/admin/stats");
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        } else {
          console.error("Failed to fetch stats");
          alert("Failed to load dashboard data");
        }
      }
    } catch (err) {
      console.error("Error loading data:", err);
      alert("Failed to load data. Please check if the server is running.");
    }
    setLoading(false);
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: "DELETE"
      });

      if (response.ok) {
        alert("User deleted successfully!");
        loadData();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to delete user");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Failed to delete user. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUserId(user.user_id);
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      address: user.address || '',
      role: user.role
    });
  };

  const handleSaveUser = async (userId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        alert("User updated successfully!");
        setEditingUserId(null);
        setEditForm({});
        loadData();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to update user");
      }
    } catch (err) {
      console.error("Error updating user:", err);
      alert("Failed to update user. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditForm({});
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!newUser.name.trim() || !newUser.email.trim() || !newUser.password.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    if (newUser.password.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        alert("User created successfully!");
        setShowAddUser(false);
        setNewUser({
          name: "",
          email: "",
          phone: "",
          address: "",
          role: "Patient",
          password: ""
        });
        loadData();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to create user");
      }
    } catch (err) {
      console.error("Error creating user:", err);
      alert("Failed to create user. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (type, format = 'csv') => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/reports?type=${type}&format=${format}`);
      if (response.ok) {
        if (format === 'csv') {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${type}_report_${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          alert(`CSV report downloaded successfully!`);
        } else {
          const reportData = await response.json();
          setReports(reportData);
          alert(`Report generated! Total records: ${reportData.length}`);
        }
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to generate report");
      }
    } catch (err) {
      console.error("Error generating report:", err);
      alert("Failed to generate report");
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const getRoleColor = (role) => {
    const colors = {
      Patient: "bg-blue-100 text-blue-800 border border-blue-200",
      Doctor: "bg-green-100 text-green-800 border border-green-200",
      Pharmacist: "bg-purple-100 text-purple-800 border border-purple-200",
      Supplier: "bg-orange-100 text-orange-800 border border-orange-200",
      Admin: "bg-red-100 text-red-800 border border-red-200"
    };
    return colors[role] || "bg-gray-100 text-gray-800 border border-gray-200";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-gray-800 to-gray-900 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-gray-700">
          Pharmora Admin
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
              activeTab === "dashboard"
                ? "bg-white text-gray-900 shadow-md"
                : "hover:bg-gray-700 hover:shadow-sm"
            }`}
          >
            <BarChart3 size={20} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
              activeTab === "users"
                ? "bg-white text-gray-900 shadow-md"
                : "hover:bg-gray-700 hover:shadow-sm"
            }`}
          >
            <Users size={20} />
            <span>User Management</span>
          </button>

          <button
            onClick={() => setActiveTab("reports")}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
              activeTab === "reports"
                ? "bg-white text-gray-900 shadow-md"
                : "hover:bg-gray-700 hover:shadow-sm"
            }`}
          >
            <FileText size={20} />
            <span>Reports</span>
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700 transition"
          >
            <Home size={20} />
            <span>Home</span>
          </button>
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3 p-3 text-sm text-gray-300">
            <User size={16} />
            <div>
              <p className="font-medium">{user?.name}</p>
              <p className="text-xs text-gray-400">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-600 transition mt-2"
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
                Admin Dashboard
              </h1>
              <p className="text-gray-600">Welcome back, {user?.name}</p>
            </div>
            <div className="text-right space-y-2">
              <button
                onClick={loadData}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <RefreshCw size={16} />
                )}
                Refresh Data
              </button>
              <p className="text-sm text-gray-500">Last updated</p>
              <p className="text-sm font-medium text-gray-700">{new Date().toLocaleString()}</p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading data...</p>
            </div>
          ) : (
            <>
              {/* Dashboard Tab */}
              {activeTab === "dashboard" && (
                <div className="space-y-8">
                  <h2 className="text-2xl font-bold text-gray-800">System Overview</h2>
                  
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Users</p>
                          <p className="text-2xl font-bold text-gray-900">{stats.total_users || 0}</p>
                          <p className="text-xs text-gray-500 mt-1">All system users</p>
                        </div>
                        <Users className="h-8 w-8 text-blue-500" />
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Medicines</p>
                          <p className="text-2xl font-bold text-gray-900">{stats.total_medicines || 0}</p>
                          <p className="text-xs text-gray-500 mt-1">In inventory</p>
                        </div>
                        <Package className="h-8 w-8 text-green-500" />
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Orders</p>
                          <p className="text-2xl font-bold text-gray-900">{stats.total_orders || 0}</p>
                          <p className="text-xs text-gray-500 mt-1">All time orders</p>
                        </div>
                        <ShoppingCart className="h-8 w-8 text-purple-500" />
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500 hover:shadow-lg transition">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                          <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.total_revenue || 0)}</p>
                          <p className="text-xs text-gray-500 mt-1">Lifetime revenue</p>
                        </div>
                        <DollarSign className="h-8 w-8 text-orange-500" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Users by Role */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                      <h3 className="text-lg font-semibold mb-4 text-gray-800">Users by Role</h3>
                      <div className="space-y-3">
                        {stats.users_by_role && Object.entries(stats.users_by_role).length > 0 ? (
                          Object.entries(stats.users_by_role).map(([role, count]) => (
                            <div key={role} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                              <div className="flex items-center gap-3">
                                <span className={`w-3 h-3 rounded-full ${
                                  role === 'Patient' ? 'bg-blue-500' :
                                  role === 'Doctor' ? 'bg-green-500' :
                                  role === 'Pharmacist' ? 'bg-purple-500' :
                                  role === 'Supplier' ? 'bg-orange-500' : 'bg-gray-500'
                                }`}></span>
                                <span className="font-medium text-gray-700 capitalize">{role}s</span>
                              </div>
                              <span className="text-xl font-bold text-gray-900 bg-white px-3 py-1 rounded-full">
                                {count}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4 text-gray-500">
                            No user data available
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Recent Orders */}
                    {stats.recent_orders && stats.recent_orders.length > 0 && (
                      <div className="bg-white rounded-xl shadow-md p-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">Recent Orders</h3>
                        <div className="space-y-3">
                          {stats.recent_orders.map((order) => (
                            <div key={order.order_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                              <div>
                                <p className="font-medium text-gray-900">Order #{order.order_id}</p>
                                <p className="text-sm text-gray-600">{order.name}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-gray-900">{formatCurrency(order.total_price)}</p>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {order.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* User Management Tab */}
              {activeTab === "users" && (
                <div className="space-y-6">
                  {/* <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
                    <button
                      onClick={() => setShowAddUser(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-md"
                    >
                      <Plus size={20} />
                      Add New User
                    </button>
                  </div> */}

                  {/* Search Bar */}
                  <div className="bg-white rounded-xl shadow-md p-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        placeholder="Search users by name, email, or role..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
{/* 
                  {/* Add User Modal */}
                  {showAddUser && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xl font-bold text-gray-900">Add New User</h3>
                          <button
                            onClick={() => setShowAddUser(false)}
                            className="text-gray-400 hover:text-gray-600 transition"
                          >
                            <X size={24} />
                          </button>
                        </div>
                        <form onSubmit={handleAddUser} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                            <input
                              type="text"
                              required
                              value={newUser.name}
                              onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter full name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                            <input
                              type="email"
                              required
                              value={newUser.email}
                              onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter email address"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                            <input
                              type="password"
                              required
                              value={newUser.password}
                              onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter password"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                            <select
                              value={newUser.role}
                              onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="Patient">Patient</option>
                              <option value="Doctor">Doctor</option>
                              <option value="Pharmacist">Pharmacist</option>
                              <option value="Supplier">Supplier</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input
                              type="text"
                              value={newUser.phone}
                              onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter phone number"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <input
                              type="text"
                              value={newUser.address}
                              onChange={(e) => setNewUser({...newUser, address: e.target.value})}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter address"
                            />
                          </div>
                          <div className="flex gap-3 pt-4">
                            <button
                              type="submit"
                              disabled={loading}
                              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                              {loading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : null}
                              {loading ? "Creating..." : "Create User"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowAddUser(false)}
                              className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )} 
                  
                  {/* Users Table */}
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow">
                      <User size={64} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 text-lg mb-2">
                        {searchTerm ? "No users match your search" : "No users found"}
                      </p>
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm("")}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl shadow overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User Information</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact Details</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {filteredUsers.map((user) => (
                              <tr key={user.user_id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="text-sm font-mono text-gray-500">#{user.user_id}</span>
                                </td>
                                <td className="px-6 py-4">
                                  {editingUserId === user.user_id ? (
                                    <div className="space-y-2">
                                      <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Full Name"
                                      />
                                      <input
                                        type="email"
                                        value={editForm.email}
                                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Email Address"
                                      />
                                    </div>
                                  ) : (
                                    <div>
                                      <p className="font-semibold text-gray-900">{user.name}</p>
                                      <p className="text-sm text-gray-500">{user.email}</p>
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {editingUserId === user.user_id ? (
                                    <select
                                      value={editForm.role}
                                      onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                                      className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                      <option value="Patient">Patient</option>
                                      <option value="Doctor">Doctor</option>
                                      <option value="Pharmacist">Pharmacist</option>
                                      <option value="Supplier">Supplier</option>
                                    </select>
                                  ) : (
                                    <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                                      {user.role}
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  {editingUserId === user.user_id ? (
                                    <div className="space-y-2">
                                      <input
                                        type="text"
                                        value={editForm.phone}
                                        onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Phone Number"
                                      />
                                      <input
                                        type="text"
                                        value={editForm.address}
                                        onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Address"
                                      />
                                    </div>
                                  ) : (
                                    <div>
                                      <p className="text-sm text-gray-900">{user.phone || 'Not provided'}</p>
                                      <p className="text-xs text-gray-500 max-w-xs truncate">{user.address || 'No address'}</p>
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    {editingUserId === user.user_id ? (
                                      <>
                                        <button
                                          onClick={() => handleSaveUser(user.user_id)}
                                          disabled={loading}
                                          className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        >
                                          {loading ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                          ) : (
                                            <Save size={16} />
                                          )}
                                          {loading ? "Saving..." : "Save"}
                                        </button>
                                        <button
                                          onClick={handleCancelEdit}
                                          className="flex items-center gap-1 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-sm font-medium"
                                        >
                                          <X size={16} />
                                          Cancel
                                        </button>
                                      </>
                                    ) : (
                                      <>
                                        <button
                                          onClick={() => handleEditUser(user)}
                                          className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                                        >
                                          <Edit size={16} />
                                          Edit
                                        </button>
                                        <button
                                          onClick={() => handleDeleteUser(user.user_id, user.name)}
                                          className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
                                        >
                                          <Trash2 size={16} />
                                          Delete
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Reports Tab */}
              {activeTab === "reports" && (
                <div className="space-y-8">
                  <h2 className="text-2xl font-bold text-gray-800">Reports & Analytics</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-white rounded-xl shadow-md border-l-4 border-green-500 hover:shadow-lg transition">
                      <ShoppingCart className="h-8 w-8 text-green-500 mb-4" />
                      <h3 className="font-semibold text-gray-900 mb-2">Sales Report</h3>
                      <p className="text-sm text-gray-600 mb-4">Last 30 days revenue and orders</p>
                      <button
                        onClick={() => generateReport('sales', 'csv')}
                        className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 font-medium"
                      >
                        <Download size={16} />
                        Download CSV
                      </button>
                    </div>

                    {/* In your Reports tab, update the User Growth button text */}
                        <div className="p-6 bg-white rounded-xl shadow-md border-l-4 border-blue-500 hover:shadow-lg transition">
                        <Users className="h-8 w-8 text-blue-500 mb-4" />
                        <h3 className="font-semibold text-gray-900 mb-2">User Distribution</h3>
                        <p className="text-sm text-gray-600 mb-4">User count and percentage by role</p>
                        <button
                            onClick={() => generateReport('users', 'csv')}
                            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 font-medium"
                        >
                            <Download size={16} />
                            Download CSV
                        </button>
                        </div>

                    <div className="p-6 bg-white rounded-xl shadow-md border-l-4 border-purple-500 hover:shadow-lg transition">
                      <Package className="h-8 w-8 text-purple-500 mb-4" />
                      <h3 className="font-semibold text-gray-900 mb-2">Medicine Analytics</h3>
                      <p className="text-sm text-gray-600 mb-4">Top selling medicines and stock</p>
                      <button
                        onClick={() => generateReport('medicines', 'csv')}
                        className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2 font-medium"
                      >
                        <Download size={16} />
                        Download CSV
                      </button>
                    </div>
                  </div>

                  {reports.length > 0 && (
                    <div className="bg-white rounded-xl shadow p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Report Preview (First 10 Records)</h3>
                        <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                          {reports.length} total records
                        </span>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg overflow-x-auto max-h-96 border border-gray-200">
                        <pre className="text-sm text-gray-700">{JSON.stringify(reports.slice(0, 10), null, 2)}</pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;