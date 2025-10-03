import React from "react";
import { FiTruck, FiUserCheck, FiHeart, FiShield, FiClock } from "react-icons/fi";
import "./index.css";

function Home() {
  return (
    <div className="font-sans relative bg-gray-100">
      {/* Black Gradient Overlay for Whole Page */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/20 -z-10"></div>

      {/* Hero Section */}
      <section className="relative w-full h-screen">
        <img
          src="/images/pharmacy.jpg"
          alt="Pharmacy"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center text-white">
          <h1 className="text-5xl font-bold mb-6 animate-fade-in drop-shadow-lg">
            Your Trusted Digital Pharmacy
          </h1>
        </div>
      </section>

      {/* About Us */}
      <section className="py-16 px-8 bg-white/90 backdrop-blur-sm text-center shadow-inner">
        <h2 className="text-3xl font-bold mb-6 text-[#2b0d0d]">About Us</h2>
        <p className="max-w-2xl mx-auto text-lg text-gray-700 leading-relaxed">
          Pharmora is an integrated pharmacy and e-commerce platform connecting
          patients, doctors, pharmacists, and suppliers. We provide prescriptions,
          medicine delivery, and healthcare solutions — all in one secure system.
        </p>
      </section>

      {/* Services */}
      <section className="py-16 px-8 bg-gray-50/90 backdrop-blur-sm text-center">
        <h2 className="text-3xl font-bold mb-12 text-[#2b0d0d]">Our Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <FiTruck size={40} className="mx-auto text-green-600 mb-4" />,
              title: "Fast Delivery",
              desc: "Get your medicines delivered at your doorstep in record time."
            },
            {
              icon: <FiUserCheck size={40} className="mx-auto text-blue-600 mb-4" />,
              title: "Consultation",
              desc: "Connect with doctors and pharmacists for expert advice."
            },
            {
              icon: <FiHeart size={40} className="mx-auto text-red-600 mb-4" />,
              title: "Healthcare Support",
              desc: "Comprehensive healthcare services for patients and providers."
            }
          ].map((service, i) => (
            <div
              key={i}
              className="p-8 bg-white shadow-lg rounded-xl hover:shadow-2xl transition transform hover:-translate-y-2 duration-300"
            >
              {service.icon}
              <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
              <p className="text-gray-600">{service.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-8 bg-white/90 backdrop-blur-sm shadow-inner">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-left">
            <h2 className="text-3xl font-bold mb-6 text-[#2b0d0d]">
              Why Choose Pharmora?
            </h2>
            <ul className="space-y-6 text-gray-700 leading-relaxed">
              <li className="flex items-start">
                <FiShield size={28} className="text-green-600 mr-3 mt-1" />
                <span><strong>Secure & Trusted:</strong> Safe prescriptions and reliable services.</span>
              </li>
              <li className="flex items-start">
                <FiClock size={28} className="text-blue-600 mr-3 mt-1" />
                <span><strong>24/7 Availability:</strong> Order medicines anytime, anywhere.</span>
              </li>
              <li className="flex items-start">
                <FiHeart size={28} className="text-red-600 mr-3 mt-1" />
                <span><strong>Customer Focused:</strong> Your health & convenience first.</span>
              </li>
            </ul>
          </div>
          <div className="flex justify-center animate-fade-right">
            <img
              src="/images/why-choose-us.jpg"
              alt="Why Choose Us"
              className="rounded-xl shadow-lg object-cover w-full h-96"
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-8 bg-gray-50/90 backdrop-blur-sm text-center">
        <h2 className="text-3xl font-bold mb-12 text-[#2b0d0d]">What Our Customers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { text: "Pharmora made it so easy to get my medicines delivered. Quick and reliable!", name: "— Ayesha K." },
            { text: "The doctor consultation feature saved me a hospital trip. Amazing service!", name: "— Hassan M." },
            { text: "User-friendly and secure. I trust Pharmora with all my healthcare needs.", name: "— Sarah L." }
          ].map((t, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1 duration-300"
            >
              <p className="italic text-gray-600 mb-4">"{t.text}"</p>
              <h4 className="font-semibold text-[#2b0d0d]">{t.name}</h4>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2b0d0d] text-gray-300 py-10 px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Pharmora</h3>
            <p>Your trusted digital pharmacy for safe, fast, and reliable healthcare.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-2">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-green-400">Home</a></li>
              <li><a href="#" className="hover:text-green-400">Products</a></li>
              <li><a href="#" className="hover:text-green-400">Doctors</a></li>
              <li><a href="#" className="hover:text-green-400">Pharmacists</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-2">Services</h4>
            <ul className="space-y-2">
              <li>Medicine Delivery</li>
              <li>Doctor Consultation</li>
              <li>Health Support</li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-2">Contact Us</h4>
            <p>Email: support@pharmora.com</p>
            <p>Phone: +92 300 1234567</p>
            <p>Location: Karachi, Pakistan</p>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-4 text-center text-sm">
          © {new Date().getFullYear()} Pharmora. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}

export default Home;
