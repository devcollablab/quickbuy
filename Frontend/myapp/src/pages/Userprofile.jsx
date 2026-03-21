import React, { useState, useEffect } from "react";
import { Box, ChevronRight, LogOut, Pencil } from "lucide-react";
import { urlChangeAvatar, urlCreateProfile, urlGetAvatars, urlGetProfile, urlMyOrders, urlUpdateProfile } from "../../endpoints";
import customAxios from "../components/customAxios";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import Login from "./Login";
import Forgotpassword from "./Forgotpassword";
import Signup from "./Signup";
import CustomAlert from "../components/CustomAlert";
import Toast from "../components/Toast";


const UserProfile = () => {

  const [activeSection, setActiveSection] = useState("profile");
  const [editMode, setEditMode] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user, isLoggedIn } = useAuth();
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [orders, setOrders] = useState([]);
const [loadingOrders, setLoadingOrders] = useState(false);
const [avatars, setAvatars] = useState([]);
const [showAvatarPicker, setShowAvatarPicker] = useState(false);
const [loadingAvatars, setLoadingAvatars] = useState(false);

  const [userInfo, setUserInfo] = useState({
    full_name: "",
    phone_number: "",
    gender: "",
    address_line: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
    profile_image_url: "",
  });

  useEffect(() => {
    if (activeSection === "orders") {
      fetchOrders();
    }
  }, [activeSection]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

   // ✅ PROTECT PAGE
  //  useEffect(() => {
  //   if (!isLoggedIn) {
  //     alert("Please login first");
  //     navigate("/");
  //     return;
  //   }

  //   fetchProfile();
  // }, [isLoggedIn]);
  

  const handleInputChange = (field, value) => {

    // FULL NAME (letters + spaces only)
    if (field === "full_name") {
      const regex = /^[A-Za-z\s]*$/;
      if (!regex.test(value)) return;
    }
  
    // CITY
    if (field === "city") {
      const regex = /^[A-Za-z\s]*$/;
      if (!regex.test(value)) return;
    }
  
    // STATE
    if (field === "state") {
      const regex = /^[A-Za-z\s]*$/;
      if (!regex.test(value)) return;
    }
  
    // COUNTRY
    if (field === "country") {
      const regex = /^[A-Za-z\s]*$/;
      if (!regex.test(value)) return;
    }
  
    // PHONE NUMBER (max 10 digits)
    if (field === "phone_number") {
      const regex = /^[0-9]{0,10}$/;
      if (!regex.test(value)) return;
    }
  
    // PINCODE (max 6 digits)
    if (field === "pincode") {
      const regex = /^[0-9]{0,6}$/;
      if (!regex.test(value)) return;
    }
  
    setUserInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleEdit = () => {
    if (editMode) saveProfile();
    setEditMode(!editMode);
  };

  // FETCH PROFILE
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

  // CREATE PROFILE
  const createProfile = async () => {
    try {
      const res = await customAxios.post(urlCreateProfile, userInfo);
      setUserInfo(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // UPDATE PROFILE
  const saveProfile = async () => {

    const nameRegex = /^[A-Za-z\s]+$/;
    const phoneRegex = /^[0-9]{10}$/;
    const pincodeRegex = /^[0-9]{6}$/;
  
    // if (!nameRegex.test(userInfo.full_name)) {
    //   alert("Full name should contain only letters");
    //   return;
    // }
  
    // if (!phoneRegex.test(userInfo.phone_number)) {
    //   setToast({
    //     message: "10 digits number",
    //     type: "error",
    //   });
    //   return;
    // }
  
    // if (!pincodeRegex.test(userInfo.pincode)) {
    //   alert("Pincode must be 6 digits");
    //   return;
    // }
  
    try {
      const res = await customAxios.put(urlUpdateProfile, userInfo);
      setUserInfo(res.data);
      setToast({
        message: "Profile Updated",
        type: "success"
      });
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    }
  };

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const res = await customAxios.get(urlMyOrders);
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error("Error fetching orders", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchAvatars = async () => {
    if (!userInfo.gender) return;
  
    try {
      setLoadingAvatars(true);
  
      const res = await customAxios.get(
        `${urlGetAvatars}?gender=${userInfo.gender}`
      );
  
      setAvatars(res.data);
      setShowAvatarPicker(true);
  
    } catch (err) {
      console.error("Error fetching avatars", err);
    } finally {
      setLoadingAvatars(false);
    }
  };

  const selectAvatar = async (avatarId) => {
    try {
      const res = await customAxios.post(
        urlChangeAvatar(avatarId)
      );
  
      setUserInfo((prev) => ({
        ...prev,
        profile_image_url: res.data.avatar_url
      }));
  
      setShowAvatarPicker(false);
  
      setToast({
        message: "Avatar updated",
        type: "success"
      });
  
    } catch (err) {
      console.error("Error selecting avatar", err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // If user is not logged in show login screen
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-16">
        <div className="text-center bg-white p-10 rounded-lg shadow">
  
          <h2 className="text-2xl font-semibold mb-3">
            Please Login
          </h2>
  
          <p className="text-gray-500 mb-6">
            You need to login to view your profile.
          </p>
  
          <button
            onClick={() => setIsLoginOpen(true)}
            className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
          >
            Login
          </button>
  
        </div>
  
        {/* LOGIN MODALS */}
        <Login
          isOpen={isLoginOpen}
          setIsOpen={setIsLoginOpen}
          onOpenSignup={() => {
            setIsLoginOpen(false);
            setIsSignupOpen(true);
          }}
          onOpenForgot={() => {
            setIsLoginOpen(false);
            setIsForgotOpen(true);
          }}
        />
  
        <Signup isOpen={isSignupOpen} setIsOpen={setIsSignupOpen} />
  
        <Forgotpassword
          isOpen={isForgotOpen}
          setIsOpen={setIsForgotOpen}
        />
  
      </div>
    );
  }

  return (
    <>
    <Toast
     message={toast.message}
     type={toast.type}
     onClose={() => setToast({ message: "" })}
    />
    <div className="min-h-screen bg-gray-50 pt-16">

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* SIDEBAR */}
          <div className="lg:col-span-1">

            {/* PROFILE CARD */}
            <div className="bg-white rounded-lg shadow-sm p-6 text-center mb-6 relative">

  <div className="relative inline-block">
    <img
      src={
        userInfo.profile_image_url ||
        "https://i.pravatar.cc/150"
      }
      className="w-20 h-20 rounded-full mx-auto mb-2 object-cover"
      alt="profile"
    />

    {editMode && (
      <button
      onClick={fetchAvatars}
      className="absolute bottom-0 right-0 bg-white border rounded-full p-1.5 shadow hover:bg-gray-100"
    >
      <Pencil size={16} className="text-gray-600" />
    </button>
    )}
  </div>

  <h3 className="font-semibold text-gray-800">
    {userInfo.full_name || "User"}
  </h3>

  <p className="text-sm text-gray-500">
    {user?.email}
  </p>

</div>

{showAvatarPicker && (
  <div className="bg-white rounded-lg shadow-sm p-4 mb-6">

    <p className="text-sm font-medium mb-3">
      Select Avatar
    </p>

    {loadingAvatars ? (
      <p>Loading...</p>
    ) : (
      <div className="grid grid-cols-4 gap-3">
        {avatars.map((avatar) => (
          <img
            key={avatar.id}
            src={avatar.image_url}
            onClick={() => selectAvatar(avatar.id)}
            className="w-14 h-14 rounded-full cursor-pointer border-2 hover:border-[#c5a46d] object-cover"
          />
        ))}
      </div>
    )}

  </div>
)}
            {/* MENU */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">

              <button
                onClick={() => setActiveSection("profile")}
                className={`w-full text-left px-6 py-4 border-b transition-colors
${
  activeSection === "profile"
    ? "bg-[#c5a46d]/10 text-[#c5a46d] font-semibold"
    : "hover:bg-[#c5a46d]/10 hover:text-[#c5a46d]"
}`}
              >
                Account Details
              </button>

              <button
                onClick={() => setActiveSection("orders")}
                className={`w-full text-left px-6 py-4 border-b transition-colors
${
  activeSection === "orders"
    ? "bg-[#c5a46d]/10 text-[#c5a46d] font-semibold"
    : "hover:bg-[#c5a46d]/10 hover:text-[#c5a46d]"
}`}
              >
                My Orders
              </button>

              

              <button
                onClick={handleLogout}
                className="w-full text-left px-6 py-4 text-red-600 hover:bg-red-50"
              >
                Log Out
              </button>

            </div>
          </div>


          {/* MAIN CONTENT */}
          <div className="lg:col-span-3 space-y-6">

            {/* ACCOUNT DETAILS */}
            {activeSection === "profile" && (
              <div className="bg-white rounded-lg shadow-sm border p-6">

                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">
                    Account Details
                  </h2>

                  <button
                    onClick={toggleEdit}
                    className="border px-4 py-1.5 rounded text-sm hover:bg-gray-50"
                  >
                    {editMode ? "Save Profile" : "Edit Profile"}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                  {/* FULL NAME */}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      FULL NAME
                    </p>

                    {editMode ? (
                      <input
                      type="text"
                        value={userInfo.full_name || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "full_name",
                            e.target.value
                          )
                        }
                        className="border rounded px-3 py-2 w-full"
                      />
                    ) : (
                      <p className="text-gray-800">
                        {userInfo.full_name}
                      </p>
                    )}
                  </div>

                {/* GENDER */}
<div>
  <p className="text-xs text-gray-500 mb-1">GENDER</p>

  {editMode ? (
    <select
      value={userInfo.gender || ""}
      onChange={(e) =>
        handleInputChange("gender", e.target.value)
      }
      className="border rounded px-3 py-2 w-full"
    >
      <option value="">Select Gender</option>
      <option value="Male">Male</option>
      <option value="Female">Female</option>
      <option value="Other">Other</option>
    </select>
  ) : (
    <p className="text-gray-800">
      {userInfo.gender || "-"}
    </p>
  )}
</div>

                  {/* PHONE */}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      PHONE
                    </p>

                    {editMode ? (
                      <input
                        value={userInfo.phone_number || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "phone_number",
                            e.target.value
                          )
                        }
                        className="border rounded px-3 py-2 w-full"
                      />
                    ) : (
                      <p className="text-gray-800">
                        {userInfo.phone_number}
                      </p>
                    )}
                  </div>

                  {/* ADDRESS */}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      ADDRESS
                    </p>

                    {editMode ? (
                      <input
                        value={userInfo.address_line || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "address_line",
                            e.target.value
                          )
                        }
                        className="border rounded px-3 py-2 w-full"
                      />
                    ) : (
                      <p className="text-gray-800">
                        {userInfo.address_line}
                      </p>
                    )}
                  </div>
                  {/* COUNTRY */}
<div>
  <p className="text-xs text-gray-500 mb-1">COUNTRY</p>

  {editMode ? (
    <input
    type="text"
      value={userInfo.country || ""}
      onChange={(e) =>
        handleInputChange("country", e.target.value)
      }
      className="border rounded px-3 py-2 w-full"
    />
  ) : (
    <p className="text-gray-800">
      {userInfo.country || "-"}
    </p>
  )}
</div>
{/* STATE */}
<div>
  <p className="text-xs text-gray-500 mb-1">STATE</p>

  {editMode ? (
    <input
    type="text"
      value={userInfo.state || ""}
      onChange={(e) =>
        handleInputChange("state", e.target.value)
      }
      className="border rounded px-3 py-2 w-full"
    />
  ) : (
    <p className="text-gray-800">
      {userInfo.state || "-"}
    </p>
  )}
</div>
{/* CITY */}
<div>
  <p className="text-xs text-gray-500 mb-1">CITY</p>

  {editMode ? (
    <input
    type="text"
      value={userInfo.city || ""}
      onChange={(e) =>
        handleInputChange("city", e.target.value)
      }
      className="border rounded px-3 py-2 w-full"
    />
  ) : (
    <p className="text-gray-800">
      {userInfo.city || "-"}
    </p>
  )}
</div>
{/* PINCODE */}
<div>
  <p className="text-xs text-gray-500 mb-1">PINCODE</p>

  {editMode ? (
    <input
    type="number"
    value={userInfo.pincode || ""}
    onChange={(e) =>
      handleInputChange("pincode", e.target.value)
    }
    className="border rounded px-3 py-2 w-full"
  />
  ) : (
    <p className="text-gray-800">
      {userInfo.pincode || "-"}
    </p>
  )}
</div>

                </div>
              </div>
            )}


            {/* RECENT ORDERS */}
            {activeSection === "orders" && (
  <div className="bg-white rounded-lg shadow-sm border p-6">

    <h2 className="text-lg font-semibold mb-6">
      My Orders
    </h2>

    {loadingOrders ? (
      <p>Loading orders...</p>
    ) : orders.length === 0 ? (
      <p className="text-gray-500">No orders found</p>
    ) : (
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.order_id} className="border rounded-lg p-4">

            {/* ORDER HEADER */}
            <div className="flex justify-between border-b pb-3 mb-3">
              <div>
                <p className="font-medium">
                  Order #{order.order_id}
                </p>

                <p className="text-sm text-gray-500">
                  Payment: {order.payment_status}
                </p>
              </div>

              <div className="text-right">
                <p className="text-green-600 text-sm font-semibold">
                  {order.order_status}
                </p>

                <p className="font-medium">
                  ₹{order.total_amount}
                </p>
              </div>
            </div>

            {/* PRODUCTS */}
            <div className="space-y-3">
              {order.products.map((product) => (
                <div
                  key={product.product_id}
                  className="flex items-center gap-4"
                >
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded"
                  />

                  <div className="flex-1">
                    <p className="font-medium">
                      {product.name}
                    </p>

                    <p className="text-sm text-gray-500">
                      Qty: {product.quantity}
                    </p>
                  </div>

                  <p className="font-medium">
                    ₹{product.total}
                  </p>
                </div>
              ))}
            </div>

          </div>
        ))}
      </div>
    )}

  </div>
)}
          </div>

        </div>
      </div>
  
    </div>
    </>
  );
};

export default UserProfile;