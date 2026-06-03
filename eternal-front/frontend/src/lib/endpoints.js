const base = import.meta.env.VITE_API_URL || "http://localhost:8000";
const v1 = `${base}/api/v1`;

export const endpoints = {
  health: `${base}/health`,
  signup: `${v1}/auth/signup`,
  resendOtp: `${v1}/auth/resend-otp`,
  verifyOtp: `${v1}/auth/verify-otp`,
  login: `${v1}/auth/login`,
  refresh: `${v1}/auth/refresh`,
  forgotPassword: `${v1}/auth/forgot-password`,
  resetPassword: `${v1}/auth/reset-password`,
  me: `${v1}/users/me`,
  productsV2: `${v1}/products/v2`,
  productV2: (id) => `${v1}/products/v2/${id}`,
  cart: `${v1}/cart/`,
  cartAdd: `${v1}/cart/add`,
  cartUpdate: `${v1}/cart/update`,
  cartRemove: `${v1}/cart/remove`,
  createOrder: `${v1}/payment/create-order`,
  verifyPayment: `${v1}/orders/verify-payment`,
  myOrders: `${v1}/orders/my-orders`,
  profile: `${v1}/profile/`,
};
