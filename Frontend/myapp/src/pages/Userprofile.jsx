import React, { useState } from 'react';
import { Box, ChevronRight, Edit2, ListOrderedIcon, LogOut, User } from 'lucide-react';

const UserProfile = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [editMode, setEditMode] = useState({});
  
  const [userInfo, setUserInfo] = useState({
    firstName: 'Rakesh',
    lastName: 'A naik',
    email: 'rakesh@example.com',
    mobile: '+917413676048',
    gender: 'male',
    profileImage: 'https://via.placeholder.com/100/FFC300/000000?text=RA'
  });

  const [addresses, setAddresses] = useState([
    {
      id: 1,
      type: 'Home',
      address: '123 Main Street, Bangalore',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560001'
    }
  ]);

 
  const handleInputChange = (field, value) => {
    setUserInfo({
      ...userInfo,
      [field]: value
    });
  };

  const toggleEditMode = (field) => {
    setEditMode({
      ...editMode,
      [field]: !editMode[field]
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Account</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* User Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex flex-col items-center text-center">
                <img
                  src={userInfo.profileImage}
                  alt={userInfo.firstName}
                  className="w-20 h-20 rounded-full mb-4 object-cover border-2 border-blue-500"
                />
                <p className="text-sm text-gray-500 mb-1">Hello,</p>
                <h2 className="text-lg font-bold text-gray-900">{userInfo.firstName} {userInfo.lastName}</h2>
              </div>
            </div>

            {/* ACCOUNT SETTINGS Section */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                 <User size={25} />
                  <span className="font-semibold text-gray-700">ACCOUNT SETTINGS</span>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200">
                <button
                  onClick={() => setActiveSection('profile')}
                  className={`w-full text-left px-6 py-3 hover:bg-gray-50 transition text-sm font-medium ${
                    activeSection === 'profile' ? 'text-blue-600 bg-blue-50 border-l-4 border-blue-600' : 'text-gray-700'
                  }`}
                >
                  Profile Information
                </button>
                <button
                  onClick={() => setActiveSection('addresses')}
                  className={`w-full text-left px-6 py-3 hover:bg-gray-50 transition text-sm font-medium ${
                    activeSection === 'addresses' ? 'text-blue-600 bg-blue-50 border-l-4 border-blue-600' : 'text-gray-700'
                  }`}
                >
                  Manage Addresses
                </button>
               
              </div>
            </div>

             {/* MY ORDERS Section */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <button
                onClick={() => setActiveSection('orders')}
                className={`w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition ${
                  activeSection === 'orders' ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <Box size={25} />
                  
                  <span className="font-semibold text-gray-700">MY ORDERS</span>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </button>
            </div>


            

            {/* Logout Button */}
            <button className="w-full bg-red-50 text-red-600 hover:bg-red-100 font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2">
              <LogOut size={18} />
              Logout
            </button>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Profile Information */}
            {activeSection === 'profile' && (
              <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                  <button
                    onClick={() => toggleEditMode('personalInfo')}
                    className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                  >
                    <Edit2 size={18} />
                    Edit
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Name Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        value={userInfo.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        disabled={!editMode.personalInfo}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-700"
                        placeholder="First Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={userInfo.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        disabled={!editMode.personalInfo}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-700"
                        placeholder="Last Name"
                      />
                    </div>
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Your Gender</label>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          value="male"
                          checked={userInfo.gender === 'male'}
                          onChange={(e) => handleInputChange('gender', e.target.value)}
                          disabled={!editMode.personalInfo}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-gray-700">Male</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          value="female"
                          checked={userInfo.gender === 'female'}
                          onChange={(e) => handleInputChange('gender', e.target.value)}
                          disabled={!editMode.personalInfo}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-gray-700">Female</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 my-8"></div>

                {/* Email Section */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Email Address</h3>
                  <button
                    onClick={() => toggleEditMode('email')}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    {editMode.email ? 'Done' : 'Edit'}
                  </button>
                </div>
                <input
                  type="email"
                  value={userInfo.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!editMode.email}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-700 mb-8"
                  placeholder="Email Address"
                />

                {/* Mobile Number Section */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Mobile Number</h3>
                  <button
                    onClick={() => toggleEditMode('mobile')}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    {editMode.mobile ? 'Done' : 'Edit'}
                  </button>
                </div>
                <input
                  type="tel"
                  value={userInfo.mobile}
                  onChange={(e) => handleInputChange('mobile', e.target.value)}
                  disabled={!editMode.mobile}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-700"
                  placeholder="Mobile Number"
                />
              </div>
            )}

            {/* Manage Addresses */}
            {activeSection === 'addresses' && (
              <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Manage Addresses</h2>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium">
                    + Add Address
                  </button>
                </div>

                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div key={address.id} className="border border-gray-300 rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                            {address.type}
                          </span>
                          <p className="mt-3 text-gray-700 font-medium">{address.address}</p>
                          <p className="text-sm text-gray-600">{address.city}, {address.state} - {address.zipCode}</p>
                        </div>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Edit</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

           
            {/* My Orders */}
            {activeSection === 'orders' && (
              <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h2>
                <p className="text-gray-600">You haven't placed any orders yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
