// pages/Home.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiTruck, FiUserCheck, FiHeart, FiShield, FiClock, FiMail, FiPhone, FiMapPin, FiPackage, FiAward, FiArrowRight } from "react-icons/fi";
import "../styles/home.css";

function CountUp({ target, suffix = "", duration = 1800 }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.4 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(target);
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

function Home() {
  return (
    <div className="min-h-screen font-sans bg-white">

      {/* Hero */}
      <section className="relative pt-36 pb-24 px-8 overflow-hidden bg-gradient-to-br from-slate-50 via-cyan-50 to-teal-50">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-80 h-80 bg-cyan-300 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-300 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-7">
              <span className="inline-block text-sm font-semibold text-cyan-700 bg-cyan-100 px-4 py-1.5 rounded-full tracking-wide uppercase">
                Your Digital Pharmacy
              </span>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight animate-slideUp">
                Healthcare Made Simple.{" "}
                <span className="bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
                  Here's How.
                </span>
              </h1>
              <p className="text-lg text-gray-500 leading-relaxed animate-slideUp" style={{ animationDelay: "0.1s" }}>
                Discover a platform where your health, convenience, and trust matter — connecting patients, doctors, pharmacists, and suppliers in one secure system.
              </p>
              <div className="flex gap-4 animate-slideUp" style={{ animationDelay: "0.2s" }}>
                <Link to="/login">
                  <button className="px-7 py-3.5 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2">
                    Get Started <FiArrowRight />
                  </button>
                </Link>
                <Link to="/products">
                  <button className="px-7 py-3.5 border-2 border-cyan-600 text-cyan-700 rounded-xl font-semibold hover:bg-cyan-50 transition-all duration-300">
                    Browse Medicines
                  </button>
                </Link>
              </div>
            </div>

            <div className="relative animate-fadeIn" style={{ animationDelay: "0.4s" }}>
              <img
                src="/images/pharmacy.jpg"
                alt="Pharmacy"
                className="rounded-3xl shadow-2xl w-full h-[500px] object-cover"
              />

              {/* Floating card - Revenue Growth */}
              <div className="absolute top-6 left-4 bg-white rounded-2xl shadow-2xl p-5 w-44 animate-float" style={{ animationDelay: "0s", animationDuration: "3s" }}>
                <p className="text-sm font-semibold text-gray-800 mb-3">Revenue Growth</p>
                <div className="flex items-end gap-2 h-14">
                  <div className="flex-1 rounded" style={{ height: "55%", background: "#c084fc" }}></div>
                  <div className="flex-1 rounded" style={{ height: "100%", background: "#0891b2" }}></div>
                  <div className="flex-1 rounded" style={{ height: "75%", background: "#a855f7" }}></div>
                  <div className="flex-1 rounded" style={{ height: "85%", background: "#22d3ee" }}></div>
                  <div className="flex-1 rounded" style={{ height: "60%", background: "#7c3aed" }}></div>
                </div>
                <p className="text-xs text-gray-400 mt-2">Daily</p>
              </div>

              {/* Floating card - Data Analytics */}
              <div className="absolute top-6 right-4 bg-white rounded-2xl shadow-2xl p-5 w-44 animate-float" style={{ animationDelay: "0.8s", animationDuration: "3.5s" }}>
                <p className="text-sm font-semibold text-gray-800 mb-2">Data Analytics</p>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl font-bold text-gray-900">48k</span>
                  <span className="text-xs font-medium bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full">✓</span>
                </div>
                <svg viewBox="0 0 100 35" className="w-full h-10">
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0891b2" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#0891b2" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <polyline points="0,30 20,22 40,26 60,12 80,18 100,6" fill="none" stroke="#0891b2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              {/* Floating card - Sales Stats */}
              <div className="absolute bottom-6 right-4 bg-white rounded-2xl shadow-2xl p-5 w-44 animate-float" style={{ animationDelay: "1.4s", animationDuration: "4s" }}>
                <p className="text-sm font-semibold text-gray-800 mb-3">Sales Stats</p>
                <div className="flex items-center gap-3">
                  <svg viewBox="0 0 36 36" className="w-14 h-14 flex-shrink-0 -rotate-90">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#e5e7eb" strokeWidth="5" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#0891b2" strokeWidth="5" strokeDasharray="62 88" strokeLinecap="round" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#7c3aed" strokeWidth="5" strokeDasharray="26 88" strokeDashoffset="-62" strokeLinecap="round" />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Daily Visitor</p>
                    <p className="text-xl font-bold text-gray-900">800+</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-8 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <span className="inline-block text-sm font-semibold text-teal-700 bg-teal-50 px-4 py-1.5 rounded-full tracking-wide uppercase mb-4">
            How It Works
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Making Healthcare Easy
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-16">
            A simple three-step process to connect every part of the healthcare ecosystem.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: (
                  <svg className="w-14 h-14 mx-auto mb-5" viewBox="0 0 100 100">
                    <rect x="20" y="20" width="60" height="50" rx="8" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="2" />
                    <rect x="30" y="35" width="15" height="15" rx="4" fill="#3B82F6" />
                    <circle cx="60" cy="42" r="8" fill="#3B82F6" />
                    <line x1="35" y1="60" x2="65" y2="60" stroke="#3B82F6" strokeWidth="2" />
                  </svg>
                ),
                title: "Create Your Account",
                desc: "Sign up as a patient, doctor, pharmacist, or supplier to access our comprehensive healthcare platform.",
              },
              {
                step: "02",
                icon: (
                  <svg className="w-14 h-14 mx-auto mb-5" viewBox="0 0 100 100">
                    <rect x="25" y="15" width="50" height="60" rx="8" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2" />
                    <rect x="35" y="25" width="10" height="15" rx="2" fill="#10B981" />
                    <rect x="55" y="30" width="10" height="10" rx="2" fill="#EF4444" />
                    <rect x="35" y="50" width="30" height="4" rx="2" fill="#3B82F6" />
                    <text x="50" y="70" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#000">Rx</text>
                  </svg>
                ),
                title: "Manage Prescriptions",
                desc: "Doctors issue digital prescriptions, patients submit them, and pharmacists verify and process orders.",
              },
              {
                step: "03",
                icon: (
                  <svg className="w-14 h-14 mx-auto mb-5" viewBox="0 0 100 100">
                    <rect x="20" y="20" width="60" height="50" rx="8" fill="#E0F2FE" stroke="#06B6D4" strokeWidth="2" />
                    <rect x="30" y="35" width="12" height="25" rx="2" fill="#06B6D4" />
                    <rect x="45" y="30" width="12" height="30" rx="2" fill="#3B82F6" />
                    <rect x="60" y="40" width="12" height="20" rx="2" fill="#14B8A6" />
                  </svg>
                ),
                title: "Streamlined Supply Chain",
                desc: "Pharmacists request stock from suppliers, track deliveries, and manage inventory — all seamlessly.",
              },
            ].map((step, i) => (
              <div key={i} className="group relative">
                <div className="bg-gray-50 rounded-2xl p-8 hover:bg-white hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-transparent hover:border-gray-100">
                  <span className="inline-block text-5xl font-black text-gray-100 group-hover:text-cyan-100 transition-colors duration-300 mb-2 select-none">
                    {step.step}
                  </span>
                  <div className="group-hover:scale-110 transition-transform duration-300">{step.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 px-8 bg-gradient-to-br from-slate-50 to-cyan-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <img
                src="/images/why-choose-us.jpg"
                alt="Why Choose Us"
                className="rounded-3xl shadow-2xl w-full h-[480px] object-cover"
              />
            </div>
            <div>
              <span className="inline-block text-sm font-semibold text-cyan-700 bg-cyan-100 px-4 py-1.5 rounded-full tracking-wide uppercase mb-4">
                Why Pharmora
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-10">
                Built for Trust & Reliability
              </h2>
              <div className="space-y-5">
                {[
                  { icon: <FiShield className="text-2xl" />, title: "Secure & Trusted", desc: "Safe prescriptions with end-to-end encryption and verified healthcare professionals." },
                  { icon: <FiClock className="text-2xl" />, title: "24/7 Availability", desc: "Order medicines anytime, anywhere with round-the-clock customer support." },
                  { icon: <FiAward className="text-2xl" />, title: "Quality Assured", desc: "All medicines are sourced from certified suppliers and thoroughly verified." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-5 items-start p-5 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                    <div className="flex-shrink-0 p-3 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl text-white">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-8 bg-gradient-to-r from-cyan-600 to-teal-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-5">Your Priorities, Our Promise</h2>
          <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            Pharmora connects patients, doctors, pharmacists, and suppliers — delivering prescriptions, medicine, and healthcare solutions in one secure system.
          </p>
          <Link to="/login">
            <button className="px-10 py-4 bg-white text-cyan-700 rounded-xl font-bold hover:bg-gray-50 transition-all duration-300 hover:scale-105 shadow-xl flex items-center gap-2 mx-auto">
              Get Started Today <FiArrowRight />
            </button>
          </Link>
        </div>
      </section>

      {/* Services */}
      <section className="py-24 px-8 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <span className="inline-block text-sm font-semibold text-teal-700 bg-teal-50 px-4 py-1.5 rounded-full tracking-wide uppercase mb-4">
            What We Offer
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Our Services</h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto mb-16">
            Everything you need for modern healthcare — in one place.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <FiTruck className="text-3xl" />, title: "Fast Delivery", desc: "Get your medicines delivered to your doorstep in record time with real-time tracking." },
              { icon: <FiUserCheck className="text-3xl" />, title: "Expert Consultation", desc: "Connect with certified doctors and pharmacists for professional medical advice." },
              { icon: <FiHeart className="text-3xl" />, title: "Healthcare Support", desc: "Comprehensive healthcare services tailored for patients and healthcare providers." },
            ].map((service, i) => (
              <div key={i} className="group p-8 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-transparent hover:border-gray-100">
                <div className="inline-block p-4 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-2xl mb-6 text-white group-hover:scale-110 transition-transform duration-300 shadow-md">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-500 leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-8 bg-gradient-to-br from-slate-50 to-cyan-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Pharmora by the Numbers</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { target: 1000, suffix: "+", label: "Happy Customers",    icon: <FiHeart /> },
              { target: 100,  suffix: "+", label: "Medicines Available", icon: <FiPackage /> },
              { target: 50,   suffix: "+", label: "Expert Doctors",      icon: <FiUserCheck /> },
              { target: null, display: "24/7", label: "Support Available", icon: <FiClock /> },
            ].map((stat, i) => (
              <div key={i} className="text-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-1 border border-gray-100">
                <div className="inline-block p-4 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl text-white mb-4 text-2xl shadow-md">
                  {stat.icon}
                </div>
                <div className="text-4xl font-black bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent mb-1">
                  {stat.target !== null
                    ? <CountUp target={stat.target} suffix={stat.suffix} />
                    : stat.display}
                </div>
                <div className="text-gray-500 font-medium text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div>
            <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">Pharmora</h3>
            <p className="text-gray-400 leading-relaxed text-sm">Your trusted digital pharmacy for safe, fast, and reliable healthcare solutions.</p>
          </div>
          <div>
            <h4 className="text-base font-semibold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2.5 text-gray-400 text-sm">
              <li><Link to="/" className="hover:text-cyan-400 transition-colors">Home</Link></li>
              <li><Link to="/products" className="hover:text-cyan-400 transition-colors">Products</Link></li>
              <li><Link to="/doctors" className="hover:text-cyan-400 transition-colors">Doctors</Link></li>
              <li><Link to="/pharmacists" className="hover:text-cyan-400 transition-colors">Pharmacists</Link></li>
              <li><Link to="/suppliers" className="hover:text-cyan-400 transition-colors">Suppliers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-base font-semibold mb-4 text-white">Services</h4>
            <ul className="space-y-2.5 text-gray-400 text-sm">
              <li>Medicine Delivery</li>
              <li>Doctor Consultation</li>
              <li>Health Support</li>
              <li>Supply Management</li>
            </ul>
          </div>
          <div>
            <h4 className="text-base font-semibold mb-4 text-white">Contact Us</h4>
            <ul className="space-y-2.5 text-gray-400 text-sm">
              <li className="flex items-center gap-2"><FiMail size={14} /> support@pharmora.com</li>
              <li className="flex items-center gap-2"><FiPhone size={14} /> +92 300 1234567</li>
              <li className="flex items-center gap-2"><FiMapPin size={14} /> Karachi, Pakistan</li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Pharmora. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}

export default Home;
