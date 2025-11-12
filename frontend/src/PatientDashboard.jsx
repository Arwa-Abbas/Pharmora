import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";

function PatientDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [activeTab, setActiveTab] = useState("cart");
  const [cart, setCart] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [prescriptionNotes, setPrescriptionNotes] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");

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
      const presRes = await fetch(
        `http://localhost:5000/api/prescriptions/${user.id}`
      );
      const presData = await presRes.json();
      setPrescriptions(presData);

      // Load orders
      const ordersRes = await fetch(
        `http://localhost:5000/api/orders/${user.id}`
      );
      const ordersData = await ordersRes.json();
      setOrders(ordersData);
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
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      await fetch(`http://localhost:5000/api/cart/${cartItemId}`, {
        method: "DELETE",
      });
      loadData();
    } catch (err) {
      console.error("Error removing item:", err);
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
  };

  const uploadPrescription = async () => {
    if (!prescriptionFile) {
      alert("Please select a prescription file");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: user.id,
          prescription_image: prescriptionFile,
          notes: prescriptionNotes,
        }),
      });

      if (response.ok) {
        alert("Prescription uploaded successfully!");
        setPrescriptionFile(null);
        setPrescriptionNotes("");
        loadData();
      }
    } catch (err) {
      console.error("Error uploading prescription:", err);
      alert("Failed to upload prescription");
    }
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert("Your cart is empty");
      return;
    }

    if (!deliveryAddress.trim()) {
      alert("Please enter a delivery address");
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
        alert("Order placed successfully!");
        setDeliveryAddress("");
        loadData();
        setActiveTab("orders");
      }
    } catch (err) {
      console.error("Error placing order:", err);
      alert("Failed to place order");
    }
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

              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-xl font-semibold mb-4">
                  Upload New Prescription
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Prescription Image/PDF
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
                      Additional Notes
                    </label>
                    <textarea
                      value={prescriptionNotes}
                      onChange={(e) => setPrescriptionNotes(e.target.value)}
                      placeholder="Any special instructions or notes"
                      className="w-full p-3 border rounded-lg"
                      rows="3"
                    />
                  </div>
                  <button
                    onClick={uploadPrescription}
                    className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 flex items-center gap-2"
                  >
                    <Upload size={20} />
                    Upload Prescription
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {prescriptions.map((pres) => (
                  <div
                    key={pres.prescription_id}
                    className="bg-white rounded-lg shadow p-6"
                  >
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
                    {pres.doctor_name && (
                      <p className="text-sm text-gray-600 mb-2">
                        Doctor: {pres.doctor_name}
                      </p>
                    )}
                    {pres.notes && (
                      <p className="text-sm text-gray-700 mb-3">{pres.notes}</p>
                    )}
                    {pres.prescription_image && (
                      <img
                        src={pres.prescription_image}
                        alt="Prescription"
                        className="w-full h-40 object-cover rounded"
                      />
                    )}
                  </div>
                ))}
              </div>
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
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
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
        </div>
      </div>
    </div>
  );
}

export default PatientDashboard;