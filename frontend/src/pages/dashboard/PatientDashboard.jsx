// pages/dashboard/PatientDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../contexts/NotificationContext";
import { useAuth } from "../../hooks/useAuth";
import userService from "../../services/userService";
import orderService from "../../services/orderService";
import prescriptionService from "../../services/prescriptionService";
import cartService from "../../services/cartService";
import api from "../../services/api";
import StatsCard from "../../components/dashboard/StatsCard";
import OrderCard from "../../components/dashboard/OrderCard";
import PrescriptionCard from "../../components/dashboard/PrescriptionCard";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
  ShoppingCart,
  FileText,
  Package,
  User,
  LogOut,
  Home,
  Upload,
  CreditCard,
  AlertCircle,
  Plus,
  X
} from "lucide-react";

function PatientDashboard() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("cart");
  const [loading, setLoading] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const [cart, setCart] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [ordersWithoutPrescriptions, setOrdersWithoutPrescriptions] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [payments, setPayments] = useState([]);

  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [prescriptionNotes, setPrescriptionNotes] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [uploadError, setUploadError] = useState("");

  const [editingPrescription, setEditingPrescription] = useState(null);
  const [editPrescriptionFile, setEditPrescriptionFile] = useState(null);
  const [editPrescriptionNotes, setEditPrescriptionNotes] = useState("");
  const [editSelectedDoctorId, setEditSelectedDoctorId] = useState("");
  const [editSelectedOrderId, setEditSelectedOrderId] = useState("");

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardHolder: "",
    paymentMethod: "credit_card"
  });

  useEffect(() => {
    if (user === undefined || user === null) {
      return;
    }

    if (user.role !== "Patient") {
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
        const cartData = await cartService.getCart(user.id);
        setCart(cartData);
      } catch (err) {
        setCart([]);
      }

      try {
        const presData = await prescriptionService.getUserPrescriptions(user.id);
        setPrescriptions(presData);
      } catch (err) {
        setPrescriptions([]);
      }

      try {
        const ordersData = await orderService.getUserOrders(user.id);
        setOrders(ordersData);
      } catch (err) {
        setOrders([]);
      }

      try {
        const doctorsData = await userService.getAllDoctors();
        const formattedDoctors = doctorsData.map(doc => ({
          ...doc,
          name: doc.name || `${doc.first_name || ''} ${doc.last_name || ''}`.trim() || 'Doctor'
        }));
        setDoctors(formattedDoctors);
      } catch (err) {
        setDoctors([]);
      }

      try {
        const ordersWithoutData = await orderService.getOrdersWithoutPrescriptions(user.id);
        setOrdersWithoutPrescriptions(ordersWithoutData);
      } catch (err) {
        setOrdersWithoutPrescriptions([]);
      }

      try {
        const paymentsData = await api.get(`/api/payments/${user.id}`);
        setPayments(paymentsData);
      } catch (err) {
        setPayments([]);
      }

      showNotification("Dashboard loaded successfully", "success");
    } catch (err) {
      console.error("Error loading data:", err);
      showNotification("Some features may be limited", "warning");
    }
    setLoading(false);
  };

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  const updateCartQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    setLoading(true);
    try {
      await cartService.updateQuantity(cartItemId, newQuantity);
      setCart(prevCart =>
        prevCart.map(item =>
          item.cart_item_id === cartItemId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
      showNotification("Quantity updated", "success");
    } catch (err) {
      console.error("Error updating quantity:", err);
      showNotification("Error updating quantity", "error");
    }
    setLoading(false);
  };

  const removeFromCart = async (cartItemId) => {
    setLoading(true);
    try {
      await cartService.removeItem(cartItemId);
      setCart(prevCart => prevCart.filter(item => item.cart_item_id !== cartItemId));
      showNotification("Item removed from cart", "success");
    } catch (err) {
      console.error("Error removing item:", err);
      showNotification("Error removing item from cart", "error");
    }
    setLoading(false);
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

    setLoading(true);
    try {
      await prescriptionService.uploadPrescription({
        patient_id: user.id,
        doctor_id: selectedDoctorId,
        prescription_image: prescriptionFile,
        notes: prescriptionNotes,
        order_id: selectedOrderId,
      });

      showNotification("Prescription uploaded successfully!", "success");
      setPrescriptionFile(null);
      setPrescriptionNotes("");
      setSelectedDoctorId("");
      setSelectedOrderId("");
      setUploadError("");

      const presData = await prescriptionService.getUserPrescriptions(user.id);
      setPrescriptions(presData);
    } catch (err) {
      setUploadError(err.message);
      showNotification(err.message || "Failed to upload prescription", "error");
    }
    setLoading(false);
  };

  const startEditPrescription = async (prescription) => {
    setEditingPrescription(prescription);
    setEditPrescriptionNotes(prescription.notes || "");
    setEditSelectedDoctorId(prescription.doctor_id || "");
    setEditSelectedOrderId(prescription.order_id || "");
    setEditPrescriptionFile(null);

    try {
      const ordersWithoutPresData = await orderService.getOrdersWithoutPrescriptions(
        user.id,
        prescription.prescription_id
      );
      setOrdersWithoutPrescriptions(ordersWithoutPresData);
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

    setLoading(true);
    try {
      await prescriptionService.updatePrescription(editingPrescription.prescription_id, {
        doctor_id: editSelectedDoctorId,
        prescription_image: editPrescriptionFile || editingPrescription.prescription_image,
        notes: editPrescriptionNotes,
        order_id: editSelectedOrderId,
      });

      showNotification("Prescription updated successfully!", "success");
      cancelEdit();

      const presData = await prescriptionService.getUserPrescriptions(user.id);
      setPrescriptions(presData);
    } catch (err) {
      showNotification(err.message || "Failed to update prescription", "error");
    }
    setLoading(false);
  };

  const deletePrescription = async (prescriptionId) => {
    if (!window.confirm("Are you sure you want to delete this prescription?")) {
      return;
    }

    setLoading(true);
    try {
      await prescriptionService.deletePrescription(prescriptionId);
      showNotification("Prescription deleted successfully!", "success");
      setPrescriptions(prev => prev.filter(p => p.prescription_id !== prescriptionId));
    } catch (err) {
      showNotification(err.message || "Failed to delete prescription", "error");
    }
    setLoading(false);
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

    setLoading(true);
    try {
      await orderService.createOrder({
        user_id: user.id,
        items: cart.map((item) => ({
          medicine_id: item.medicine_id,
          quantity: item.quantity,
          price: item.price,
        })),
        total_price: calculateTotal() + 200,
        delivery_address: deliveryAddress,
      });

      showNotification("Order placed successfully!", "success");
      setDeliveryAddress("");
      setCart([]);
      setActiveTab("orders");

      const ordersData = await orderService.getUserOrders(user.id);
      setOrders(ordersData);
    } catch (err) {
      showNotification(err.message || "Failed to place order", "error");
    }
    setLoading(false);
  };

  const handlePayment = async () => {
    if (!selectedOrderForPayment) return;

    setLoading(true);
    try {
      await api.post('/api/payments', {
        order_id: selectedOrderForPayment.order_id,
        user_id: user.id,
        amount: selectedOrderForPayment.total_price,
        method: paymentDetails.paymentMethod,
        card_last_four: paymentDetails.cardNumber.slice(-4)
      });

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

      const paymentsData = await api.get(`/api/payments/${user.id}`);
      setPayments(paymentsData);
    } catch (err) {
      showNotification(err.message || "Payment failed", "error");
    }
    setLoading(false);
  };

  const initiatePayment = (order) => {
    if (!order.prescription_id) {
      showNotification("Please link a prescription to this order before making payment", "warning");
      return;
    }
    setSelectedOrderForPayment(order);
    setShowPaymentModal(true);
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <LoadingSpinner size="large" color="cyan" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 bg-gradient-to-b from-cyan-600 to-teal-600 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-cyan-500">
          Pharmora
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab("cart")}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
              activeTab === "cart" ? "bg-white text-cyan-600" : "hover:bg-cyan-500"
            }`}
          >
            <ShoppingCart size={20} />
            <span>My Cart</span>
            {cart.length > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {cart.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("prescriptions")}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
              activeTab === "prescriptions" ? "bg-white text-cyan-600" : "hover:bg-cyan-500"
            }`}
          >
            <FileText size={20} />
            <span>Prescriptions</span>
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
              activeTab === "orders" ? "bg-white text-cyan-600" : "hover:bg-cyan-500"
            }`}
          >
            <Package size={20} />
            <span>My Orders</span>
          </button>

          <button
            onClick={() => setActiveTab("payments")}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
              activeTab === "payments" ? "bg-white text-cyan-600" : "hover:bg-cyan-500"
            }`}
          >
            <CreditCard size={20} />
            <span>Payment History</span>
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
              activeTab === "profile" ? "bg-white text-cyan-600" : "hover:bg-cyan-500"
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

      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {user?.name}!
          </h1>
          <p className="text-gray-600 mb-8">Manage your healthcare needs</p>

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
                            Remove
                          </button>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateCartQuantity(item.cart_item_id, item.quantity - 1)}
                              className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-semibold">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateCartQuantity(item.cart_item_id, item.quantity + 1)}
                              className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

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
                      className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition"
                    >
                      Proceed to Checkout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "prescriptions" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">My Prescriptions</h2>

              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-xl font-semibold mb-4">Upload New Prescription</h3>

                {uploadError && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded flex items-center gap-2">
                    <AlertCircle size={20} />
                    <span>{uploadError}</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Prescription Image/PDF *
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Select Doctor *
                    </label>
                    <select
                      value={selectedDoctorId}
                      onChange={(e) => setSelectedDoctorId(e.target.value)}
                      className="w-full p-3 border rounded-lg"
                    >
                      <option value="">Choose a doctor</option>
                      {doctors.map(doctor => (
                        <option key={doctor.user_id} value={doctor.user_id}>
                          Dr. {doctor.name} {doctor.specialty ? `- ${doctor.specialty}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Link to Order *
                    </label>
                    <select
                      value={selectedOrderId}
                      onChange={(e) => setSelectedOrderId(e.target.value)}
                      className="w-full p-3 border rounded-lg"
                    >
                      <option value="">Select an order</option>
                      {ordersWithoutPrescriptions.map(order => (
                        <option key={order.order_id} value={order.order_id}>
                          Order #{order.order_id} - Rs. {order.total_price}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      value={prescriptionNotes}
                      onChange={(e) => setPrescriptionNotes(e.target.value)}
                      placeholder="Any special instructions"
                      className="w-full p-3 border rounded-lg"
                      rows="3"
                    />
                  </div>

                  <button
                    onClick={uploadPrescription}
                    disabled={!prescriptionFile || !selectedDoctorId || !selectedOrderId}
                    className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:bg-gray-400 flex items-center gap-2"
                  >
                    <Upload size={20} />
                    Upload Prescription
                  </button>
                </div>
              </div>

              {prescriptions.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <FileText size={64} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No prescriptions yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {prescriptions.map((pres) => (
                    <PrescriptionCard
                      key={pres.prescription_id}
                      prescription={pres}
                      onVerify={() => {}}
                      onReject={() => {}}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "orders" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">My Orders</h2>

              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package size={64} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No orders yet</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => {
                    const orderPayment = payments.find(p => p.order_id === order.order_id);
                    return (
                      <OrderCard
                        key={order.order_id}
                        order={{ ...order, payment: orderPayment }}
                        onPay={initiatePayment}
                        showPaymentButton={!orderPayment && order.prescription_id}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "payments" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Payment History</h2>

              {payments.length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard size={64} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No payment history</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div key={payment.payment_id} className="bg-white rounded-lg shadow p-6">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-semibold">Payment #{payment.payment_id}</h3>
                          <p className="text-sm text-gray-600">Order #{payment.order_id}</p>
                          <p className="text-sm text-gray-600">
                            Date: {new Date(payment.date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            Method: {payment.method}
                          </p>
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

          {activeTab === "profile" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">My Profile</h2>
              <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Name</label>
                    <p className="text-lg font-semibold">{user?.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-lg font-semibold">{user?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Role</label>
                    <p className="text-lg font-semibold">{user?.role}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

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
                  <p className="font-semibold">Order #{selectedOrderForPayment.order_id}</p>
                  <p className="text-lg font-bold text-green-700">
                    Total: Rs. {selectedOrderForPayment.total_price}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Payment Method</label>
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
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Card Number</label>
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
                    <label className="block text-sm font-medium mb-2">Expiry Date</label>
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
                    <label className="block text-sm font-medium mb-2">CVV</label>
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
                  <label className="block text-sm font-medium mb-2">Card Holder Name</label>
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

                <button
                  onClick={handlePayment}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700"
                >
                  Pay Rs. {selectedOrderForPayment.total_price}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientDashboard;
