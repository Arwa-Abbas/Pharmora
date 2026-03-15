// pages/Home.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiTruck, FiUserCheck, FiHeart, FiShield, FiClock, FiSun, FiMoon, FiCheckCircle, FiPhone, FiMail, FiMapPin, FiPackage, FiActivity, FiAward } from "react-icons/fi";
import "../styles/home.css";

function Home() {
  const [isDark, setIsDark] = useState(false);

  return (
    <div className={`min-h-screen font-sans ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 to-blue-50'}`}>
      <section className="relative pt-32 pb-20 px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-400 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight animate-slideUp">
                Healthcare Made Simple. <span className="bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">Here's How.</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed animate-slideUp" style={{animationDelay: '0.1s'}}>
                Your Trusted Digital Pharmacy - Discover a platform where your health, convenience, and trust matter.
              </p>
            </div>

            <div className="relative animate-fadeIn" style={{animationDelay: '0.4s'}}>
              <img
                src="/images/pharmacy.jpg"
                alt="Pharmacy"
                className="rounded-3xl shadow-2xl w-full h-[500px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-8 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-16">How Our Pharmacy Platform<br/>Makes Healthcare Easy</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <svg className="w-16 h-16 mx-auto mb-6" viewBox="0 0 100 100">
                  <rect x="20" y="20" width="60" height="50" rx="8" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="2"/>
                  <rect x="30" y="35" width="15" height="15" rx="4" fill="#3B82F6"/>
                  <circle cx="60" cy="42" r="8" fill="#3B82F6"/>
                  <line x1="35" y1="60" x2="65" y2="60" stroke="#3B82F6" strokeWidth="2"/>
                </svg>,
                title: "Create Your Account & Login",
                desc: "Sign up as a patient, doctor, pharmacist, or supplier to access our comprehensive healthcare platform."
              },
              {
                icon: <svg className="w-16 h-16 mx-auto mb-6" viewBox="0 0 100 100">
                  <rect x="25" y="15" width="50" height="60" rx="8" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2"/>
                  <rect x="35" y="25" width="10" height="15" rx="2" fill="#10B981"/>
                  <rect x="55" y="30" width="10" height="10" rx="2" fill="#EF4444"/>
                  <rect x="35" y="50" width="30" height="4" rx="2" fill="#3B82F6"/>
                  <text x="50" y="70" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#000">12.02</text>
                </svg>,
                title: "Manage Medications & Prescriptions",
                desc: "Doctors can issue digital prescriptions, patients can upload them, and pharmacists can verify and process orders."
              },
              {
                icon: <svg className="w-16 h-16 mx-auto mb-6" viewBox="0 0 100 100">
                  <rect x="20" y="20" width="60" height="50" rx="8" fill="#E0F2FE" stroke="#06B6D4" strokeWidth="2"/>
                  <rect x="30" y="35" width="12" height="25" rx="2" fill="#06B6D4"/>
                  <rect x="45" y="30" width="12" height="30" rx="2" fill="#3B82F6"/>
                  <rect x="60" y="40" width="12" height="20" rx="2" fill="#14B8A6"/>
                </svg>,
                title: "Streamlined Supply Chain",
                desc: "Pharmacists can request stock from suppliers, track deliveries, and manage inventory seamlessly."
              }
            ].map((step, i) => (
              <div key={i} className="group relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                  <div className="group-hover:scale-110 transition-transform duration-300">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-gray-600">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">Why Choose Pharmora?</h2>

              <div className="space-y-6">
                {[
                  {
                    icon: <FiShield className="text-3xl" />,
                    title: "Secure & Trusted",
                    desc: "Safe prescriptions with end-to-end encryption and verified healthcare professionals."
                  },
                  {
                    icon: <FiClock className="text-3xl" />,
                    title: "24/7 Availability",
                    desc: "Order medicines anytime, anywhere with round-the-clock customer support."
                  },
                  {
                    icon: <FiAward className="text-3xl" />,
                    title: "Quality Assured",
                    desc: "All medicines are sourced from certified suppliers and thoroughly verified."
                  }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 items-start p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="flex-shrink-0 p-4 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl text-white">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <img
                src="/images/why-choose-us.jpg"
                alt="Why Choose Us"
                className="rounded-3xl shadow-2xl w-full h-[500px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-8 bg-gradient-to-r from-cyan-600 to-teal-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-teal-400 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Your Priorities, Our Promise</h2>
          <p className="text-xl text-white/90 mb-10 max-w-3xl mx-auto">
            Pharmora is an integrated pharmacy and e-commerce platform connecting
            patients, doctors, pharmacists, and suppliers. We provide prescriptions,
            medicine delivery, and healthcare solutions — all in one secure system.
          </p>
          <Link to="/login">
            <button className="px-10 py-4 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 hover:scale-105 shadow-xl">
              Get Started Today
            </button>
          </Link>
        </div>
      </section>

      <section className="py-20 px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-16">Our Services</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <FiTruck className="text-4xl" />,
                title: "Fast Delivery",
                desc: "Get your medicines delivered at your doorstep in record time with real-time tracking."
              },
              {
                icon: <FiUserCheck className="text-4xl" />,
                title: "Expert Consultation",
                desc: "Connect with certified doctors and pharmacists for professional medical advice."
              },
              {
                icon: <FiHeart className="text-4xl" />,
                title: "Healthcare Support",
                desc: "Comprehensive healthcare services tailored for patients and healthcare providers."
              }
            ].map((service, i) => (
              <div
                key={i}
                className="group p-8 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
              >
                <div className="inline-block p-4 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl mb-6 text-white group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{service.title}</h3>
                <p className="text-gray-600 leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-8 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "1000+", label: "Happy Customers", icon: <FiHeart /> },
              { number: "100+", label: "Medicines Available", icon: <FiPackage /> },
              { number: "50+", label: "Expert Doctors", icon: <FiUserCheck /> },
              { number: "24/7", label: "Support Available", icon: <FiClock /> }
            ].map((stat, i) => (
              <div
                key={i}
                className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
              >
                <div className="inline-block p-4 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl text-white mb-4 text-3xl">
                  {stat.icon}
                </div>
                <div className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-16 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">Pharmora</h3>
            <p className="text-gray-400 leading-relaxed">Your trusted digital pharmacy for safe, fast, and reliable healthcare solutions.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3 text-gray-400">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Products</Link></li>
              <li><Link to="/doctors" className="hover:text-white transition-colors">Doctors</Link></li>
              <li><Link to="/pharmacists" className="hover:text-white transition-colors">Pharmacists</Link></li>
              <li><Link to="/suppliers" className="hover:text-white transition-colors">Suppliers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-3 text-gray-400">
              <li>Medicine Delivery</li>
              <li>Doctor Consultation</li>
              <li>Health Support</li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-center gap-2"><FiMail size={16} /> support@pharmora.com</li>
              <li className="flex items-center gap-2"><FiPhone size={16} /> +92 300 1234567</li>
              <li className="flex items-center gap-2"><FiMapPin size={16} /> Karachi, Pakistan</li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-gray-800 text-center text-gray-400">
          © {new Date().getFullYear()} Pharmora. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}

export default Home;
