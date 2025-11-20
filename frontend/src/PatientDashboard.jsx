import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "./NotificationContext";
import {
  ShoppingCart,
  FileText,
  Package,
  User,
  LogOut,
  Home,
  Trash2,
  Plus,
  Minus,
  Upload,
  CreditCard,
  UserCheck,
  Link,
  AlertCircle,
  Edit,
  X,
  CheckCircle,
} from "lucide-react";

function PatientDashboard() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const user = JSON.parse(localStorage.getItem("user"));
  const [activeTab, setActiveTab] = useState("cart");
  const [cart, setCart] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [ordersWithoutPrescriptions, setOrdersWithoutPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [prescriptionNotes, setPrescriptionNotes] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [uploadError, setUploadError] = useState("");

  // Edit prescription states
  const [editingPrescription, setEditingPrescription] = useState(null);
  const [editPrescriptionFile, setEditPrescriptionFile] = useState(null);
  const [editPrescriptionNotes, setEditPrescriptionNotes] = useState("");
  const [editSelectedDoctorId, setEditSelectedDoctorId] = useState("");
  const [editSelectedOrderId, setEditSelectedOrderId] = useState("");

  // Payment states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardHolder: "",
    paymentMethod: "credit_card"
  });
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    if (!user || user.role !== "Patient") {
      navigate("/login");
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load cart
      const cartRes = await fetch(`http://localhost:5000/api/cart/${user.id}`);
      const cartData = await cartRes.json();
      setCart(cartData);

      // Load prescriptions
      const presRes = await fetch(`http://localhost:5000/api/prescriptions/${user.id}`);
      const presData = await presRes.json();
      setPrescriptions(presData);

      // Load orders
      const ordersRes = await fetch(`http://localhost:5000/api/orders/${user.id}`);
      const ordersData = await ordersRes.json();
      setOrders(ordersData);

      // Load orders without prescriptions for linking
      try {
        const ordersWithoutPresRes = await fetch(`http://localhost:5000/api/patient/${user.id}/orders-without-prescriptions`);
        if (ordersWithoutPresRes.ok) {
          const ordersWithoutPresData = await ordersWithoutPresRes.json();
          setOrdersWithoutPrescriptions(ordersWithoutPresData);
        }
      } catch (err) {
        console.log("Orders without prescriptions endpoint not available yet");
        setOrdersWithoutPrescriptions([]);
      }

      // Load doctors for prescription assignment
      const doctorsRes = await fetch("http://localhost:5000/api/doctors");
      const doctorsData = await doctorsRes.json();
      setDoctors(doctorsData);

      // Load payments
      try {
        const paymentsRes = await fetch(`http://localhost:5000/api/payments/${user.id}`);
        if (paymentsRes.ok) {
          const paymentsData = await paymentsRes.json();
          setPayments(paymentsData);
        }
      } catch (err) {
        console.log("Payments endpoint not available yet");
      }
    } catch (err) {
      console.error("Error loading data:", err);
    }
    setLoading(false);
  };

  const handleSignOut = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const updateCartQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      await fetch(`http://localhost:5000/api/cart/${cartItemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity }),
      });
      loadData();
    } catch (err) {
      console.error("Error updating quantity:", err);
      showNotification("Error updating quantity", "error");
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      await fetch(`http://localhost:5000/api/cart/${cartItemId}`, {
        method: "DELETE",
      });
      loadData();
      showNotification("Item removed from cart", "success");
    } catch (err) {
      console.error("Error removing item:", err);
      showNotification("Error removing item from cart", "error");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPrescriptionFile(reader.result);
      };
      reader.readAsDataURL(file);
    }
    setUploadError("");
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditPrescriptionFile(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPrescription = async () => {
    setUploadError("");

    if (!prescriptionFile) {
      setUploadError("Please select a prescription file");
      return;
    }

    if (!selectedDoctorId) {
      setUploadError("Please select a doctor for prescription verification");
      return;
    }

    if (!selectedOrderId) {
      setUploadError("Please select an order to link this prescription to");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: user.id,
          doctor_id: selectedDoctorId,
          prescription_image: prescriptionFile,
          notes: prescriptionNotes,
          order_id: selectedOrderId,
        }),
      });

      if (response.ok) {
        showNotification("Prescription uploaded successfully!", "success");
        setPrescriptionFile(null);
        setPrescriptionNotes("");
        setSelectedDoctorId("");
        setSelectedOrderId("");
        setUploadError("");
        loadData();
      } else {
        const errorData = await response.json();
        setUploadError(errorData.error || "Failed to upload prescription");
        showNotification(errorData.error || "Failed to upload prescription", "error");
      }
    } catch (err) {
      console.error("Error uploading prescription:", err);
      setUploadError("Failed to upload prescription");
      showNotification("Failed to upload prescription", "error");
    }
  };

  const startEditPrescription = async (prescription) => {
    setEditingPrescription(prescription);
    setEditPrescriptionNotes(prescription.notes || "");
    setEditSelectedDoctorId(prescription.doctor_id || "");
    setEditSelectedOrderId(prescription.order_id || "");
    setEditPrescriptionFile(null);

    // Reload orders without prescriptions, including the current order
    try {
      const ordersWithoutPresRes = await fetch(
        `http://localhost:5000/api/patient/${user.id}/orders-without-prescriptions?excludePrescriptionId=${prescription.prescription_id}`
      );
      if (ordersWithoutPresRes.ok) {
        const ordersWithoutPresData = await ordersWithoutPresRes.json();
        setOrdersWithoutPrescriptions(ordersWithoutPresData);
      }
    } catch (err) {
      console.log("Error loading orders for editing:", err);
    }
  };

  const cancelEdit = () => {
    setEditingPrescription(null);
    setEditPrescriptionNotes("");
    setEditSelectedDoctorId("");
    setEditSelectedOrderId("");
    setEditPrescriptionFile(null);
  };

  const updatePrescription = async () => {
    if (!editSelectedDoctorId) {
      showNotification("Please select a doctor", "warning");
      return;
    }

    if (!editSelectedOrderId) {
      showNotification("Please select an order to link", "warning");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/prescriptions/${editingPrescription.prescription_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctor_id: editSelectedDoctorId,
          prescription_image: editPrescriptionFile || editingPrescription.prescription_image,
          notes: editPrescriptionNotes,
          order_id: editSelectedOrderId,
        }),
      });

      if (response.ok) {
        const updatedPrescription = await response.json();
        showNotification("Prescription updated successfully!", "success");
        cancelEdit();
        loadData();
      } else {
        // Handle different error statuses
        if (response.status === 404) {
          showNotification("Prescription not found. It may have been deleted.", "error");
        } else {
          const errorData = await response.json();
          showNotification(errorData.error || "Failed to update prescription", "error");
        }
      }
    } catch (err) {
      console.error("Error updating prescription:", err);
      showNotification("Failed to update prescription. Please check your connection.", "error");
    }
  };

  const deletePrescription = async (prescriptionId) => {
    if (!window.confirm("Are you sure you want to delete this prescription?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/prescriptions/${prescriptionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        showNotification("Prescription deleted successfully!", "success");
        loadData();
      } else {
        if (response.status === 404) {
          showNotification("Prescription not found. It may have already been deleted.", "error");
        } else {
          showNotification("Failed to delete prescription", "error");
        }
      }
    } catch (err) {
      console.error("Error deleting prescription:", err);
      showNotification("Failed to delete prescription. Please check your connection.", "error");
    }
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      showNotification("Your cart is empty", "warning");
      return;
    }

    if (!deliveryAddress.trim()) {
      showNotification("Please enter a delivery address", "warning");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          items: cart.map((item) => ({
            medicine_id: item.medicine_id,
            quantity: item.quantity,
            price: item.price,
          })),
          total_price: calculateTotal(),
          delivery_address: deliveryAddress,
        }),
      });

      if (response.ok) {
        showNotification("Order placed successfully!", "success");
        setDeliveryAddress("");
        loadData();
        setActiveTab("orders");
      } else {
        showNotification("Failed to place order", "error");
      }
    } catch (err) {
      console.error("Error placing order:", err);
      showNotification("Failed to place order", "error");
    }
  };

  // Payment functions
  const handlePayment = async () => {
    if (!selectedOrderForPayment) return;

    try {
      console.log("Sending payment request...");
      
      const response = await fetch("http://localhost:5000/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: selectedOrderForPayment.order_id,
          user_id: user.id,
          amount: selectedOrderForPayment.total_price,
          method: paymentDetails.paymentMethod,
          card_last_four: paymentDetails.cardNumber.slice(-4)
        }),
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("Payment successful:", result);
        showNotification("Payment successful!", "success");
        setShowPaymentModal(false);
        setPaymentDetails({
          cardNumber: "",
          expiryDate: "",
          cvv: "",
          cardHolder: "",
          paymentMethod: "credit_card"
        });
        setSelectedOrderForPayment(null);
        loadData();
      } else {
        // Try to get error message
        try {
          const errorData = await response.json();
          console.log("Payment failed with error:", errorData);
          showNotification(`Payment failed: ${errorData.error}`, "error");
        } catch (parseError) {
          console.log("Payment failed - couldn't parse error response");
          showNotification("Payment failed - server error", "error");
        }
      }
    } catch (err) {
      console.error("Network error:", err);
      showNotification("Payment failed - network error", "error");
    }
  };

  const initiatePayment = (order) => {
    if (!order.prescription_id) {
      showNotification("Please link a prescription to this order before making payment", "warning");
      return;
    }
    setSelectedOrderForPayment(order);
    setShowPaymentModal(true);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-cyan-600 to-teal-600 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-cyan-500">
          Pharmora
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab("cart")}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
              activeTab === "cart"
                ? "bg-white text-cyan-600"
                : "hover:bg-cyan-500"
            }`}
          >
            <ShoppingCart size={20} />
            <span>My Cart</span>
          </button>

          <button
            onClick={() => setActiveTab("prescriptions")}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
              activeTab === "prescriptions"
                ? "bg-white text-cyan-600"
                : "hover:bg-cyan-500"
            }`}
          >
            <FileText size={20} />
            <span>Prescriptions</span>
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
              activeTab === "orders"
                ? "bg-white text-cyan-600"
                : "hover:bg-cyan-500"
            }`}
          >
            <Package size={20} />
            <span>My Orders</span>
          </button>

          <button
            onClick={() => setActiveTab("payments")}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
              activeTab === "payments"
                ? "bg-white text-cyan-600"
                : "hover:bg-cyan-500"
            }`}
          >
            <CreditCard size={20} />
            <span>Payment History</span>
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
              activeTab === "profile"
                ? "bg-white text-cyan-600"
                : "hover:bg-cyan-500"
            }`}
          >
            <User size={20} />
            <span>Profile</span>
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-cyan-500 transition"
          >
            <Home size={20} />
            <span>Browse Products</span>
          </button>
        </nav>

        <div className="p-4 border-t border-cyan-500">
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {user?.name}!
          </h1>
          <p className="text-gray-600 mb-8">Manage your healthcare needs</p>

          {/* Cart Tab */}
          {activeTab === "cart" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Shopping Cart</h2>

              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart size={64} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Your cart is empty</p>
                  <button
                    onClick={() => navigate("/")}
                    className="mt-4 px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
                  >
                    Browse Products
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    {cart.map((item) => (
                      <div
                        key={item.cart_item_id}
                        className="bg-white rounded-lg shadow p-4 flex gap-4"
                      >
                        <img
                          src={item.image_url || "/placeholder.jpg"}
                          alt={item.name}
                          className="w-24 h-24 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{item.name}</h3>
                          <p className="text-gray-600 text-sm">{item.category}</p>
                          <p className="text-green-700 font-bold mt-2">
                            Rs. {item.price}
                          </p>
                        </div>
                        <div className="flex flex-col items-end justify-between">
                          <button
                            onClick={() => removeFromCart(item.cart_item_id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={20} />
                          </button>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                updateCartQuantity(
                                  item.cart_item_id,
                                  item.quantity - 1
                                )
                              }
                              className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="w-8 text-center font-semibold">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateCartQuantity(
                                  item.cart_item_id,
                                  item.quantity + 1
                                )
                              }
                              className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Checkout Card */}
                  <div className="bg-white rounded-lg shadow p-6 h-fit">
                    <h3 className="text-xl font-bold mb-4">Order Summary</h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>Rs. {calculateTotal()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery</span>
                        <span>Rs. 200</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>Rs. {calculateTotal() + 200}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">
                        Delivery Address
                      </label>
                      <textarea
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Enter your delivery address"
                        className="w-full p-3 border rounded-lg"
                        rows="3"
                      />
                    </div>

                    <button
                      onClick={handleCheckout}
                      className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center gap-2"
                    >
                      <CreditCard size={20} />
                      Proceed to Checkout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Prescriptions Tab */}
          {activeTab === "prescriptions" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">My Prescriptions</h2>

              {/* Edit Prescription Modal */}
              {editingPrescription && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold">Edit Prescription #{editingPrescription.prescription_id}</h3>
                        <button
                          onClick={cancelEdit}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X size={24} />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Prescription Image/PDF
                          </label>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleEditFileChange}
                            className="w-full p-2 border rounded"
                          />
                          <p className="text-sm text-gray-500 mt-1">
                            {editPrescriptionFile ? "New file selected" : "Current file will be kept"}
                          </p>
                          {editingPrescription.prescription_image && !editPrescriptionFile && (
                            <div className="mt-2">
                              <p className="text-sm font-medium mb-2">Current Image:</p>
                              <img
                                src={editingPrescription.prescription_image}
                                alt="Current prescription"
                                className="w-full max-h-48 object-contain border rounded"
                              />
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Select Doctor for Verification <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={editSelectedDoctorId}
                            onChange={(e) => setEditSelectedDoctorId(e.target.value)}
                            className="w-full p-3 border rounded-lg"
                            required
                          >
                            <option value="">Choose a doctor</option>
                            {doctors.map(doctor => (
                              <option key={doctor.user_id} value={doctor.user_id}>
                                Dr. {doctor.name} - {doctor.specialty}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Link to Order <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={editSelectedOrderId}
                            onChange={(e) => setEditSelectedOrderId(e.target.value)}
                            className="w-full p-3 border rounded-lg"
                            required
                          >
                            <option value="">Select an order to link</option>
                            {ordersWithoutPrescriptions.map(order => (
                              <option key={order.order_id} value={order.order_id}>
                                Order #{order.order_id} - {new Date(order.order_date).toLocaleDateString()} - Rs. {order.total_price}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Additional Notes
                          </label>
                          <textarea
                            value={editPrescriptionNotes}
                            onChange={(e) => setEditPrescriptionNotes(e.target.value)}
                            placeholder="Any special instructions or notes for the doctor"
                            className="w-full p-3 border rounded-lg"
                            rows="3"
                          />
                        </div>

                        <div className="flex gap-3 pt-4">
                          <button
                            onClick={cancelEdit}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={updatePrescription}
                            disabled={!editSelectedDoctorId || !editSelectedOrderId}
                            className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                          >
                            Update Prescription
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload New Prescription Form */}
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-xl font-semibold mb-4">
                  Upload New Prescription
                </h3>
                
                {uploadError && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center gap-2">
                    <AlertCircle size={20} />
                    <span>{uploadError}</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Prescription Image/PDF <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Select Doctor for Verification <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedDoctorId}
                      onChange={(e) => setSelectedDoctorId(e.target.value)}
                      className="w-full p-3 border rounded-lg"
                      required
                    >
                      <option value="">Choose a doctor</option>
                      {doctors.map(doctor => (
                        <option key={doctor.user_id} value={doctor.user_id}>
                          Dr. {doctor.name} - {doctor.specialty}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Link to Order <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedOrderId}
                      onChange={(e) => setSelectedOrderId(e.target.value)}
                      className="w-full p-3 border rounded-lg"
                      required
                    >
                      <option value="">Select an order to link</option>
                      {ordersWithoutPrescriptions.map(order => (
                        <option key={order.order_id} value={order.order_id}>
                          Order #{order.order_id} - {new Date(order.order_date).toLocaleDateString()} - Rs. {order.total_price}
                        </option>
                      ))}
                    </select>
                    {ordersWithoutPrescriptions.length === 0 && (
                      <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-sm text-yellow-700 font-medium">
                          No orders available for linking
                        </p>
                        <p className="text-sm text-yellow-600 mt-1">
                          You need to place an order first before you can upload a prescription.
                        </p>
                        <button
                          onClick={() => setActiveTab("cart")}
                          className="mt-2 px-4 py-2 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                        >
                          Go to Cart
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      value={prescriptionNotes}
                      onChange={(e) => setPrescriptionNotes(e.target.value)}
                      placeholder="Any special instructions or notes for the doctor"
                      className="w-full p-3 border rounded-lg"
                      rows="3"
                    />
                  </div>
                  
                  <button
                    onClick={uploadPrescription}
                    disabled={!prescriptionFile || !selectedDoctorId || !selectedOrderId || ordersWithoutPrescriptions.length === 0}
                    className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                  >
                    <Upload size={20} />
                    Upload Prescription
                  </button>
                </div>
              </div>

              {/* Prescriptions List */}
              {prescriptions.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <FileText size={64} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No prescriptions yet</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Upload your first prescription to get started
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {prescriptions.map((pres) => (
                    <div
                      key={pres.prescription_id}
                      className="bg-white rounded-lg shadow p-6 relative"
                    >
                      {/* Edit and Delete Buttons */}
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button
                          onClick={() => startEditPrescription(pres)}
                          className="p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                          title="Edit prescription"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => deletePrescription(pres.prescription_id)}
                          className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                          title="Delete prescription"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold">
                            Prescription #{pres.prescription_id}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {new Date(pres.date_issued).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            pres.status === "Verified"
                              ? "bg-green-100 text-green-700"
                              : pres.status === "Pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {pres.status}
                        </span>
                      </div>
                      
                      {pres.doctor_name ? (
                        <div className="flex items-center gap-2 mb-2">
                          <UserCheck size={16} className="text-blue-600" />
                          <p className="text-sm text-gray-600">
                            Assigned Doctor: <span className="font-medium">{pres.doctor_name}</span>
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-red-500 mb-2">
                          No doctor assigned
                        </p>
                      )}

                      {pres.order_id && (
                        <div className="flex items-center gap-2 mb-2">
                          <Link size={16} className="text-green-600" />
                          <p className="text-sm text-gray-600">
                            Linked to Order: <span className="font-medium">#{pres.order_id}</span>
                          </p>
                        </div>
                      )}
                      
                      {pres.notes && (
                        <p className="text-sm text-gray-700 mb-3">
                          <span className="font-semibold">Notes:</span> {pres.notes}
                        </p>
                      )}
                      
                      {pres.prescription_image && (
                        <div className="mt-3">
                          <p className="text-sm font-medium mb-2">Prescription Image:</p>
                          <img
                            src={pres.prescription_image}
                            alt="Prescription"
                            className="w-full max-h-64 object-contain border rounded"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">My Orders</h2>

              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package size={64} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No orders yet</p>
                  <button
                    onClick={() => navigate("/")}
                    className="mt-4 px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
                  >
                    Browse Products
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => {
                    const orderPayment = payments.find(p => p.order_id === order.order_id);
                    return (
                      <div
                        key={order.order_id}
                        className="bg-white rounded-lg shadow p-6"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">
                              Order #{order.order_id}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {new Date(order.order_date).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {order.delivery_address}
                            </p>
                            {order.prescription_id ? (
                              <div className="flex items-center gap-2 mt-1">
                                <Link size={16} className="text-green-600" />
                                <p className="text-sm text-green-600">
                                  Linked to Prescription #{order.prescription_id}
                                </p>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 mt-1">
                                <AlertCircle size={16} className="text-yellow-600" />
                                <p className="text-sm text-yellow-600">
                                  No prescription linked - upload one in the Prescriptions tab
                                </p>
                              </div>
                            )}
                            
                            {/* Payment Status */}
                            {orderPayment ? (
                              <div className="flex items-center gap-2 mt-1">
                                <CheckCircle size={16} className="text-green-600" />
                                <p className="text-sm text-green-600">
                                  Paid on {new Date(orderPayment.date).toLocaleDateString()} 
                                  ({orderPayment.method})
                                </p>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 mt-1">
                                <AlertCircle size={16} className="text-orange-600" />
                                <p className="text-sm text-orange-600">
                                  Payment Pending
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <span
                              className={`px-3 py-1 rounded-full text-sm ${
                                order.status === "Delivered"
                                  ? "bg-green-100 text-green-700"
                                  : order.status === "Shipped"
                                  ? "bg-blue-100 text-blue-700"
                                  : order.status === "Processing"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {order.status}
                            </span>
                            <p className="text-lg font-bold text-gray-900 mt-2">
                              Rs. {order.total_price}
                            </p>
                            
                            {/* Payment Button */}
                            {!orderPayment && order.prescription_id && (
                              <button
                                onClick={() => initiatePayment(order)}
                                className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                              >
                                Proceed to Payment
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <h4 className="font-semibold mb-3">Order Items:</h4>
                          <div className="space-y-2">
                            {order.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-4 p-2 bg-gray-50 rounded"
                              >
                                <img
                                  src={item.image_url || "/placeholder.jpg"}
                                  alt={item.medicine_name}
                                  className="w-16 h-16 object-cover rounded"
                                />
                                <div className="flex-1">
                                  <p className="font-medium">
                                    {item.medicine_name}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Quantity: {item.quantity}
                                  </p>
                                </div>
                                <p className="font-semibold">Rs. {item.price}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === "payments" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Payment History</h2>

              {payments.length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard size={64} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No payment history</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Your payment history will appear here after you make payments
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div key={payment.payment_id} className="bg-white rounded-lg shadow p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">
                            Payment #{payment.payment_id}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Order #{payment.order_id}
                          </p>
                          <p className="text-sm text-gray-600">
                            Date: {new Date(payment.date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600 capitalize">
                            Method: {payment.method.replace('_', ' ')}
                          </p>
                          {payment.card_last_four && (
                            <p className="text-sm text-gray-600">
                              Card: **** **** **** {payment.card_last_four}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-700">
                            Rs. {payment.amount}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">My Profile</h2>
              <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Name
                    </label>
                    <p className="text-lg font-semibold">{user?.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Email
                    </label>
                    <p className="text-lg font-semibold">{user?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Role
                    </label>
                    <p className="text-lg font-semibold">{user?.role}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Modal */}
          {showPaymentModal && selectedOrderForPayment && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Complete Payment</h3>
                    <button
                      onClick={() => setShowPaymentModal(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold">Order Summary</h4>
                      <p>Order #{selectedOrderForPayment.order_id}</p>
                      <p className="text-lg font-bold text-green-700">
                        Total: Rs. {selectedOrderForPayment.total_price}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Payment Method
                      </label>
                      <select
                        value={paymentDetails.paymentMethod}
                        onChange={(e) => setPaymentDetails({
                          ...paymentDetails,
                          paymentMethod: e.target.value
                        })}
                        className="w-full p-3 border rounded-lg"
                      >
                        <option value="credit_card">Credit Card</option>
                        <option value="debit_card">Debit Card</option>
                        <option value="bank_transfer">Bank Transfer</option>
                      </select>
                    </div>

                    {paymentDetails.paymentMethod.includes('card') && (
                      <>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Card Number
                          </label>
                          <input
                            type="text"
                            placeholder="1234 5678 9012 3456"
                            value={paymentDetails.cardNumber}
                            onChange={(e) => setPaymentDetails({
                              ...paymentDetails,
                              cardNumber: e.target.value
                            })}
                            className="w-full p-3 border rounded-lg"
                            maxLength={16}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Expiry Date
                            </label>
                            <input
                              type="text"
                              placeholder="MM/YY"
                              value={paymentDetails.expiryDate}
                              onChange={(e) => setPaymentDetails({
                                ...paymentDetails,
                                expiryDate: e.target.value
                              })}
                              className="w-full p-3 border rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              CVV
                            </label>
                            <input
                              type="text"
                              placeholder="123"
                              value={paymentDetails.cvv}
                              onChange={(e) => setPaymentDetails({
                                ...paymentDetails,
                                cvv: e.target.value
                              })}
                              className="w-full p-3 border rounded-lg"
                              maxLength={3}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Card Holder Name
                          </label>
                          <input
                            type="text"
                            placeholder="John Doe"
                            value={paymentDetails.cardHolder}
                            onChange={(e) => setPaymentDetails({
                              ...paymentDetails,
                              cardHolder: e.target.value
                            })}
                            className="w-full p-3 border rounded-lg"
                          />
                        </div>
                      </>
                    )}

                    <button
                      onClick={handlePayment}
                      disabled={paymentDetails.paymentMethod.includes('card') && 
                        (!paymentDetails.cardNumber || !paymentDetails.expiryDate || !paymentDetails.cvv || !paymentDetails.cardHolder)}
                      className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Pay Rs. {selectedOrderForPayment.total_price}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PatientDashboard;