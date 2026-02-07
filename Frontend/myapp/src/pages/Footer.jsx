import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-8 md:pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-8">
          {/* About Section */}
          <div>
            <h4 className="text-lg font-bold mb-4">About Shoppy</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition text-sm">About Us</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition text-sm">Careers</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition text-sm">Blog</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition text-sm">Press</a></li>
            </ul>
          </div>

          {/* Help Section */}
          <div>
            <h4 className="text-lg font-bold mb-4">Help & Support</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition text-sm">Contact Us</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition text-sm">FAQ</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition text-sm">Shipping Info</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition text-sm">Returns</a></li>
            </ul>
          </div>

          {/* Policies Section */}
          <div>
            <h4 className="text-lg font-bold mb-4">Policies</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition text-sm">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition text-sm">Terms & Conditions</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition text-sm">Cookie Policy</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition text-sm">Security</a></li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h4 className="text-lg font-bold mb-4">Contact Us</h4>
            <ul className="space-y-2">
              <li className="text-gray-300 text-sm">Email: support@shoppy.com</li>
              <li className="text-gray-300 text-sm">Phone: 1-800-SHOPPY</li>
              <li className="text-gray-300 text-sm">Hours: 24/7 Support</li>
              <li className="flex gap-4 mt-4">
                <a href="#" className="text-gray-300 hover:text-white text-2xl">f</a>
                <a href="#" className="text-gray-300 hover:text-white text-2xl">𝕏</a>
                <a href="#" className="text-gray-300 hover:text-white text-2xl">📷</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 my-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm text-center md:text-left">
            &copy; 2026 Shoppy. All rights reserved.
          </p>
          <div className="flex gap-4 md:gap-6 flex-wrap justify-center md:justify-end">
            <a href="#" className="text-gray-400 text-sm hover:text-white transition">Sitemap</a>
            <a href="#" className="text-gray-400 text-sm hover:text-white transition">Accessibility</a>
            <a href="#" className="text-gray-400 text-sm hover:text-white transition">Manage Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
