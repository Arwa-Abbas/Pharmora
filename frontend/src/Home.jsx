import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiTruck, FiUserCheck, FiHeart, FiShield, FiClock, FiSun, FiMoon, FiCheckCircle, FiPhone, FiMail, FiMapPin, FiPackage, FiActivity, FiAward } from "react-icons/fi";

function Home() {
  const [isDark, setIsDark] = useState(false);

  return (
    <div className={`min-h-screen font-sans ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 to-blue-50'}`}>
      {/* Navigation */}
      {/* <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md shadow-sm z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
            Pharmora
          </div>
          <div className="hidden md:flex gap-8 items-center">
          <Link to="/" className="text-gray-700 hover:text-primary-600 transition">Home</Link>
          <Link to="/products" className="text-gray-700 hover:text-primary-600 transition">Products</Link>
          <Link to="/doctors" className="text-gray-700 hover:text-primary-600 transition">Doctors</Link>
          <Link to="/suppliers" className="text-gray-700 hover:text-primary-600 transition">Suppliers</Link>
          <Link to="/pharmacists" className="text-gray-700 hover:text-primary-600 transition">Pharmacists</Link>

            <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              {isDark ? <FiSun className="text-gray-700" /> : <FiMoon className="text-gray-700" />}
            </button>
             <Link to="/login">
              <button className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300">
              Sign In
            </button>
             </Link>
          </div>
        </div>
      </nav> */}

      {/* Hero Section with Image */}
      <section className="relative pt-32 pb-20 px-8 overflow-hidden">
        {/* Background Pattern */}
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
          <h1 className="text-2xl font-bold mb-6 animate-fade-in drop-shadow-lg">
            Your Trusted Digital Pharmacy
          </h1>
                Discover a platform where your health, convenience, and trust matter, right from day one.
              </p>
              <div className="flex gap-4 animate-slideUp" style={{animationDelay: '0.2s'}}>
              </div>

              {/* Stats Cards */}
              <div className="flex gap-4 pt-8 animate-slideUp" style={{animationDelay: '0.3s'}}>
              </div>
            </div>

            <div className="relative animate-fadeIn" style={{animationDelay: '0.4s'}}>
              <img
                src="/images/pharmacy.jpg"
                alt="Pharmacy"
                className="rounded-3xl shadow-2xl w-full h-[500px] object-cover"
              />
              
              {/* Floating Cards */}
              <div className="absolute top-10 -left-6 bg-white rounded-xl shadow-xl p-4 animate-float">
                <div className="text-sm text-gray-600 mb-2">Revenue Growth</div>
                <div className="flex gap-2">
                  <div className="w-8 h-16 bg-purple-200 rounded"></div>
                  <div className="w-8 h-24 bg-blue-400 rounded"></div>
                  <div className="w-8 h-20 bg-purple-300 rounded"></div>
                </div>
                <div className="text-xs text-gray-500 mt-2">Daily</div>
              </div>

              <div className="absolute top-20 -right-6 bg-white rounded-xl shadow-xl p-4 animate-float" style={{animationDelay: '0.5s'}}>
                <div className="text-sm text-gray-600 mb-2">Data Analytics</div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="px-3 py-1 bg-blue-500 text-white rounded-full text-xs font-semibold">48k</div>
                  <FiCheckCircle className="text-blue-500" />
                </div>
                <svg className="w-32 h-16" viewBox="0 0 100 50">
                  <path d="M 0 40 Q 25 20, 50 30 T 100 25" stroke="#3B82F6" strokeWidth="2" fill="none"/>
                  <path d="M 0 40 Q 25 20, 50 30 T 100 25 L 100 50 L 0 50 Z" fill="url(#gradient)" opacity="0.2"/>
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <div className="absolute bottom-10 -right-6 bg-white rounded-xl shadow-xl p-4 animate-float" style={{animationDelay: '1s'}}>
                <div className="text-sm text-gray-600 mb-2">Sales Stats</div>
                <div className="flex items-center gap-3">
                  <svg className="w-16 h-16" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="#E0F2FE" />
                    <path d="M 50 10 A 40 40 0 0 1 90 50 L 50 50 Z" fill="#3B82F6" />
                  </svg>
                  <div>
                    <div className="text-xs text-gray-500">Daily Visitor</div>
                    <div className="text-2xl font-bold text-gray-900">800+</div>
                  </div>
                </div>
              </div>

              <div className="absolute top-32 -left-8 bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl shadow-xl p-3 animate-float" style={{animationDelay: '0.7s'}}>
                <FiPackage className="text-white text-2xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-16 px-8 bg-white">
        <div className="max-w-7xl mx-auto">
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-8 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-16">How our platform process<br/>easy to use?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <svg className="w-16 h-16 mx-auto mb-6" viewBox="0 0 100 100">
                  <rect x="20" y="20" width="60" height="50" rx="8" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="2"/>
                  <rect x="30" y="35" width="15" height="15" rx="4" fill="#3B82F6"/>
                  <circle cx="60" cy="42" r="8" fill="#3B82F6"/>
                  <line x1="35" y1="60" x2="65" y2="60" stroke="#3B82F6" strokeWidth="2"/>
                </svg>,
                title: "Login or sign up to be able use our platform",
                desc: "You must log in first to be able to use our platform and your product analytics."
              },
              {
                icon: <svg className="w-16 h-16 mx-auto mb-6" viewBox="0 0 100 100">
                  <rect x="25" y="15" width="50" height="60" rx="8" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2"/>
                  <rect x="35" y="25" width="10" height="15" rx="2" fill="#10B981"/>
                  <rect x="55" y="30" width="10" height="10" rx="2" fill="#EF4444"/>
                  <rect x="35" y="50" width="30" height="4" rx="2" fill="#3B82F6"/>
                  <text x="50" y="70" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#000">12.02</text>
                </svg>,
                title: "Connect your website with just a few click",
                desc: "Select the application you wanted to be able to connect with just a few clicks."
              },
              {
                icon: <svg className="w-16 h-16 mx-auto mb-6" viewBox="0 0 100 100">
                  <rect x="20" y="20" width="60" height="50" rx="8" fill="#E0F2FE" stroke="#06B6D4" strokeWidth="2"/>
                  <rect x="30" y="35" width="12" height="25" rx="2" fill="#06B6D4"/>
                  <rect x="45" y="30" width="12" height="30" rx="2" fill="#3B82F6"/>
                  <rect x="60" y="40" width="12" height="20" rx="2" fill="#14B8A6"/>
                </svg>,
                title: "Take some sales data that you want",
                desc: "You already have sales data of your product with some variants you want."
              }
            ].map((step, i) => (
              <div key={i} className="group">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                  <div className="group-hover:scale-110 transition-transform duration-300">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-gray-600">{step.desc}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2">
                    <svg width="60" height="20" viewBox="0 0 60 20">
                      <path d="M 0 10 Q 30 10, 60 10" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="5,5" fill="none"/>
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us with Image */}
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

      {/* CTA Section */}
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
          <button className="px-10 py-4 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 hover:scale-105 shadow-xl">
            Get Started Today
          </button>
        </div>
      </section>

      {/* Services Grid */}
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

      {/* Stats */}
      <section className="py-20 px-8 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "10,000+", label: "Happy Customers", icon: <FiHeart /> },
              { number: "500+", label: "Medicines Available", icon: <FiPackage /> },
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

      {/* Testimonials */}
      <section className="py-20 px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-16">What Our Customers Say</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { text: "Pharmora made it so easy to get my medicines delivered. Quick and reliable!", name: "Ayesha K.", role: "Patient" },
              { text: "The doctor consultation feature saved me a hospital trip. Amazing service!", name: "Hassan M.", role: "Customer" },
              { text: "User-friendly and secure. I trust Pharmora with all my healthcare needs.", name: "Sarah L.", role: "Regular User" }
            ].map((t, i) => (
              <div
                key={i}
                className="p-8 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
              >
                <div className="text-4xl text-cyan-600 mb-4">"</div>
                <p className="text-gray-700 text-lg mb-6 leading-relaxed">{t.text}</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{t.name}</h4>
                    <p className="text-sm text-gray-600">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">Pharmora</h3>
            <p className="text-gray-400 leading-relaxed">Your trusted digital pharmacy for safe, fast, and reliable healthcare solutions.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Home</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Products</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Doctors</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pharmacists</a></li>
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

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-slideUp {
          animation: slideUp 1s ease-out both;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default Home;