import React from "react";

export default function CartModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      {/* Modal */}
      <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg relative">

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            My Cart
          </h2>
          <button
            onClick={onClose}
            className="text-2xl text-gray-500 hover:text-gray-800"
          >
            &times;
          </button>
        </div>

        {/* Cart Items */}
        <div className="max-h-[60vh] overflow-y-auto">

          {/* Item 1 */}
          <div className="flex gap-4 px-6 py-4 border-b">
            <img
              src="https://via.placeholder.com/80"
              alt="product"
              className="w-20 h-20 object-cover"
            />

            <div className="flex-1">
              <h3 className="font-medium text-gray-800">
                Just Herbs Energising Gin & Tonic Eau de Parfum
              </h3>
              <p className="text-sm text-gray-500">For Men & Women</p>

              <div className="mt-2 flex items-center gap-3">
                <span className="text-lg font-semibold">₹162</span>
                <span className="line-through text-gray-400 text-sm">₹649</span>
                <span className="text-green-600 text-sm font-medium">
                  75% off
                </span>
              </div>

              <div className="mt-3 flex items-center gap-6 text-sm font-medium">
               
                <button className="text-red-500 hover:underline">
                  REMOVE
                </button>
              </div>
            </div>
          </div>

          {/* Item 2 */}
          <div className="flex gap-4 px-6 py-4">
            <img
              src="https://via.placeholder.com/80"
              alt="product"
              className="w-20 h-20 object-cover"
            />

            <div className="flex-1">
              <h3 className="font-medium text-gray-800">
                Yazole Solid Men Round Neck White T-Shirt
              </h3>
              <p className="text-sm text-gray-500">Size: L</p>

              <div className="mt-2 flex items-center gap-3">
                <span className="text-lg font-semibold">₹244</span>
                <span className="line-through text-gray-400 text-sm">₹1,499</span>
                <span className="text-green-600 text-sm font-medium">
                  83% off
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-between items-center">
          <div>
            {/* <p className="text-sm text-gray-500">Total Amount</p>
            <p className="text-xl font-semibold">₹406</p> */}
          </div>

          <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md font-medium">
            PLACE ORDER
          </button>
        </div>

      </div>
    </div>
  );
}