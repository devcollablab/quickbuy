import config from "./appSettings.json";

const baseURL = config.baseUrl;

export const urlVerifyotp = `${baseURL}/api/v1/auth/verify-otp`;
export const urlResendotp = `${baseURL}/api/v1/auth/resend-otp`;
export const urlForgotpass = `${baseURL}/api/v1/auth/forgot-password`;
export const urlResetpass = `${baseURL}/api/v1/auth/reset-password`;

export const urlSignup = `${baseURL}/api/v1/auth/signup`;
export const urlLogin = `${baseURL}/api/v1/auth/login`;
export const urlGoogleLogin = `${baseURL}/api/v1/auth/google/login`;

export const urlGetMe = `${baseURL}/api/v1/users/me`;
export const urlGetProducts = `${baseURL}/api/v1/products/`;

export const urlGetProductById = (productId) =>
  `${baseURL}/api/v1/products/${productId}`;
  export const urlGetProductimages = (productId) =>
  `${baseURL}/api/v1/products/v2/${productId}`;  

export const urlCreateProduct = `${baseURL}/api/v1/admin/products/`;
export const urlUpdateProduct = (productId) =>
  `${baseURL}/api/v1/admin/products/${productId}`;
export const urlDeleteProduct = (productId) => 
  `${baseURL}/api/v1/admin/products/${productId}`;  


export const urlGetProfile = `${baseURL}/api/v1/profile/`;
export const urlUpdateProfile = `${baseURL}/api/v1/profile/`;
export const urlCreateProfile = `${baseURL}/api/v1/profile/`;

export const urlGetCart = `${baseURL}/api/v1/cart/`;
export const urlAddToCart = `${baseURL}/api/v1/cart/add`;
export const urlUpdateCart = `${baseURL}/api/v1/cart/update`;
export const urlDeleteCart = `${baseURL}/api/v1/cart/remove`;
// export const urlDeleteCart = (productId) => 
//   `${baseURL}/api/v1/cart/remove/${productId}`; 

  export const urlCreateOrder = `${baseURL}/api/v1/payment/create-order`;
  export const urlVerifyPayment = `${baseURL}/api/v1/orders/verify-payment`;  
  export const urlMyOrders = `${baseURL}/api/v1/orders/my-orders`;

  export const urlGetAvatars = `${baseURL}/api/v1/avatars/`;
  export const urlChangeAvatar = (avatarId) => 
  `${baseURL}/api/v1/avatars/select/${avatarId}`; 