import React, { useState, useEffect } from "react";
import { Box, ChevronRight, Edit2, LogOut, User } from "lucide-react";
import { urlCreateProfile, urlGetProfile, urlUpdateProfile } from "../../endpoints";
import customAxios from "../components/customAxios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const UserProfile = () => {
  const navigate = useNavigate();
  const { isLoggedIn, logout, user } = useAuth();

  const [activeSection, setActiveSection] = useState("profile");
  const [editMode, setEditMode] = useState({});

  const [userInfo, setUserInfo] = useState({
    full_name: "",
    phone_number: "",
    gender: "",
    address_line: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
    latitude: 0,
    longitude: 0,
    profile_image_url: "",
    email: "",
  });

  // ✅ PROTECT PAGE
  useEffect(() => {
    if (!isLoggedIn) {
      alert("Please login first");
      navigate("/");
      return;
    }

    fetchProfile();
  }, [isLoggedIn]);

  // ✅ INPUT HANDLER
  const handleInputChange = (field, value) => {
    setUserInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleEditMode = (field) => {
    setEditMode((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // ✅ FETCH PROFILE
  const fetchProfile = async () => {
    try {
      const res = await customAxios.get(urlGetProfile);
      setUserInfo(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        await createProfile();
      } else {
        console.error(err);
      }
    }
  };

  // ✅ UPDATE PROFILE
  const saveProfile = async () => {
    try {
      const res = await customAxios.put(urlUpdateProfile, userInfo);
      setUserInfo(res.data);
      alert("Profile updated successfully");
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ CREATE PROFILE
  const createProfile = async () => {
    try {
      const res = await customAxios.post(urlCreateProfile, userInfo);
      setUserInfo(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ LOGOUT HANDLER
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
     
      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* User Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex flex-col items-center text-center">
                <img
                  src={
                    userInfo.profile_image_url ||
                    "https://via.placeholder.com/80"
                  }
                  alt="profile"
                  className="w-20 h-20 rounded-full mb-4 object-cover border-2 border-blue-500"
                />
                <p className="text-sm text-gray-500 mb-1">Hello,</p>
                <h2 className="text-lg font-bold text-gray-900">
                  {userInfo.full_name || user?.email || "User"}
                </h2>
              </div>
            </div>

            {/* ACCOUNT SETTINGS */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
             

              <div className="divide-y divide-gray-200">
                <button
                  onClick={() => setActiveSection("profile")}
                  className={`w-full text-left px-6 py-3 hover:bg-gray-50 transition text-sm font-medium ${
                    activeSection === "profile"
                      ? "text-blue-600 bg-blue-50 border-l-4 border-blue-600"
                      : "text-gray-700"
                  }`}
                >
                  Profile Information
                </button>
              </div>
            </div>

            {/* MY ORDERS */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <button
                onClick={() => setActiveSection("orders")}
                className={`w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition ${
                  activeSection === "orders"
                    ? "bg-blue-50 border-l-4 border-blue-600"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <Box size={25} />
                  <span className="font-semibold text-gray-700">
                    MY ORDERS
                  </span>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full bg-red-50 text-red-600 hover:bg-red-100 font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>

          {/* Main Content */}
<div className="lg:col-span-3">
  {activeSection === "profile" && (
    <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Personal Information
        </h2>

        <button
          onClick={() => {
            if (editMode.personalInfo) {
              saveProfile();
            }
            toggleEditMode("personalInfo");
          }}
          className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
        >
          <Edit2 size={18} />
          {editMode.personalInfo ? "Save" : "Edit"}
        </button>
      </div>

      <div className="space-y-6">
        
        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Username
          </label>
          <input
            type="text"
            value={userInfo.full_name || ""}
            onChange={(e) =>
              handleInputChange("full_name", e.target.value)
            }
            disabled={!editMode.personalInfo}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 focus:ring-2 focus:ring-blue-500"
            placeholder="Enter full name"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Your Gender
          </label>

          <div className="flex flex-wrap items-center gap-6">
            {["male", "female", "others"].map((g) => (
              <label key={g} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value={g}
                  checked={userInfo.gender === g}
                  onChange={(e) =>
                    handleInputChange("gender", e.target.value)
                  }
                  disabled={!editMode.personalInfo}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="capitalize text-gray-700">{g}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={userInfo.phone_number || ""}
            onChange={(e) =>
              handleInputChange("phone_number", e.target.value)
            }
            disabled={!editMode.personalInfo}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg disabled:bg-gray-100 focus:ring-2 focus:ring-blue-500"
            placeholder="Enter mobile number"
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address
          </label>
          <input
            type="text"
            value={userInfo.address_line || ""}
            onChange={(e) =>
              handleInputChange("address_line", e.target.value)
            }
            disabled={!editMode.personalInfo}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg disabled:bg-gray-100 focus:ring-2 focus:ring-blue-500"
            placeholder="Street address"
          />
        </div>

        {/* City / State */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <input
              type="text"
              value={userInfo.city || ""}
              onChange={(e) =>
                handleInputChange("city", e.target.value)
              }
              disabled={!editMode.personalInfo}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 focus:ring-2 focus:ring-blue-500"
              placeholder="City"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State
            </label>
            <input
              type="text"
              value={userInfo.state || ""}
              onChange={(e) =>
                handleInputChange("state", e.target.value)
              }
              disabled={!editMode.personalInfo}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 focus:ring-2 focus:ring-blue-500"
              placeholder="State"
            />
          </div>
        </div>

        {/* Pincode / Country */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pincode
            </label>
            <input
              type="text"
              value={userInfo.pincode || ""}
              onChange={(e) =>
                handleInputChange("pincode", e.target.value)
              }
              disabled={!editMode.personalInfo}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 focus:ring-2 focus:ring-blue-500"
              placeholder="Pincode"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <input
              type="text"
              value={userInfo.country || ""}
              onChange={(e) =>
                handleInputChange("country", e.target.value)
              }
              disabled={!editMode.personalInfo}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 focus:ring-2 focus:ring-blue-500"
              placeholder="Country"
            />
          </div>
        </div>

      </div>
    </div>
  )}



            {activeSection === "orders" && (
              <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  My Orders
                </h2>
                <p className="text-gray-600">
                  You haven't placed any orders yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
