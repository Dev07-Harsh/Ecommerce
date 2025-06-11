import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Twitter, Facebook, Github } from 'lucide-react';
import { Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  const [showRaiseTicket, setShowRaiseTicket] = useState(false);

  return (
    <footer className="bg-black text-white w-full overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-x-12 gap-y-10">
          {/* Logo and Company Info */}
          <div>
            <Link to="/" className="inline-block mb-8">
              <img src="/assets/images/logo.svg" alt="AUIN" className="h-8" />
            </Link>
            <div className="space-y-4 mt-6">
              <div className="flex items-start space-x-3">
                <MapPin size={20} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-400">1658 Rosewood Lane<br />New York city, NY</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone size={20} className="text-gray-400 flex-shrink-0" />
                <a href="tel:212-929-9953" className="text-[#F2631F] hover:text-white">212 929 9953</a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail size={20} className="text-gray-400 flex-shrink-0" />
                <a href="mailto:***********@gmail.com" className="text-[#F2631F] hover:text-white">***********@gmail.com</a>
              </div>
            </div>
          </div>

          {/* Shop Column */}
          <div className="mt-4">
            <h3 className="text-xl font-semibold mb-6">Shop</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/new-product" className="text-gray-300 hover:text-white transition-colors">New Product</Link>
              </li>
              <li>
                <Link to="/shop-live" className="text-gray-300 hover:text-white transition-colors"></Link>
              </li>
              <li>
                <Link to="/promotion" className="text-gray-300 hover:text-white transition-colors">Promotion</Link>
              </li>
              <li>
                <Link to="/live-shop" className="text-gray-300 hover:text-white transition-colors">Live Shop</Link>
              </li>
            </ul>
          </div>

          {/* Policies Column */}
          <div className="mt-4">
            <h3 className="text-xl font-semibold mb-6">Policies</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/privacy-policy" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/cancellation-policy" className="text-gray-300 hover:text-white transition-colors">Cancellation Policy</Link>
              </li>
              <li>
                <Link to="/return-refund" className="text-gray-300 hover:text-white transition-colors">Return & Refund</Link>
              </li>
              <li>
                <Link to="/shipping-delivery" className="text-gray-300 hover:text-white transition-colors">Shipping & Delivery Policy</Link>
              </li>
            </ul>
          </div>
          
          {/* Customer Support */}
          <div className="mt-4">
            <h3 className="text-xl font-semibold mb-6">Customer Support</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/RaiseTicket" className="text-gray-300 hover:text-white transition-colors">Raise Ticket</Link>
              </li>
              <li>
                <div className="text-gray-300">Call us at</div>
                <a href="tel:212-929-9953" className="text-[#F2631F] hover:text-white">212 929 9953</a>
              </li>
              <li>
                <Link to="/faq" className="text-gray-300 hover:text-white transition-colors">Frequently asked Questions</Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-white transition-colors">Terms & Conditions</Link>
              </li>
              <li>
                <Link to="/shipping-methods" className="text-gray-300 hover:text-white transition-colors">Shipping Methods</Link>
              </li>
              <li>
                <div className="text-gray-300 mt-3">Mail us at</div>
                <a href="mailto:******@gmail.com" className="text-[#F2631F] hover:text-white">******@gmail.com</a>
              </li>
            </ul>
          </div>
          
          {/* Follow Us Column */}
          <div className="mt-4">
            <h3 className="text-xl font-semibold mb-6">Follow Us</h3>
            <div className="flex space-x-5 mb-8">
              <a href="#" className="text-[#F2631F] hover:text-white transition-colors" aria-label="Twitter">
                <Twitter size={22} />
              </a>
              <a href="#" className="text-[#F2631F] hover:text-white transition-colors" aria-label="Facebook">
                <Facebook size={22} />
              </a>
              <a href="#" className="text-[#F2631F] hover:text-white transition-colors" aria-label="Instagram">
                <Instagram size={22} />
              </a>
              <a href="#" className="text-[#F2631F] hover:text-white transition-colors" aria-label="Github">
                <Github size={22} />
              </a>
            </div>

            {/* Newsletter Subscription */}
            <div className="mt-8">
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="py-2.5 px-4 bg-white text-gray-800 rounded-l-md focus:outline-none w-full"
                />
                <button className="bg-[#F2631F] text-white px-4 py-2.5 rounded-r-md font-medium">
                  Submit
                </button>
              </div>
              <p className="text-sm text-gray-300 mt-3">
                Receive our latest update about our products & promotion
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Copyright Section */}
      <div className="bg-white py-4 w-full">
        <div className="container mx-auto px-4">
          <p className="text-gray-500 text-sm text-center">
            © 2000-2021, All Rights Reserved
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;