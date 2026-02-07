import React from "react";

function Adminlogin() {
  return (
    <div class="flex items-center justify-center">
        <div class="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
    <h2 class="text-2xl font-semibold text-center mb-6">Login</h2>

    <form>
     
      <div class="mb-4">
        <label class="block text-gray-700 mb-1">Username</label>
        <input
          type="text"
          placeholder="Enter username"
          class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

   
      <div class="mb-6">
        <label class="block text-gray-700 mb-1">Password</label>
        <input
          type="password"
          placeholder="Enter password"
          class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      
      <button
        type="submit"
        class="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
      >
        Login
      </button>
    </form>
  </div>


        
    </div>
    );
}
export default Adminlogin;