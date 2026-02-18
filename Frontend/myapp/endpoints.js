import config from "./appSettings.json";

const baseURL = config.baseUrl;

export const urlVerifyotp = `${baseURL}/auth/verify-otp`;
export const urlResendotp = `${baseURL}/auth/resend-otp`;
export const urlForgotpass = `${baseURL}/auth/forgot-password`;
export const urlResetpass = `${baseURL}/auth/reset-password`;

export const urlSignup = `${baseURL}/auth/signup`;
export const urlLogin = `${baseURL}/auth/login`;

export const urlGetMe = `${baseURL}/users/me`;
export const urlGetProducts = `${baseURL}/products/`;

export const urlGetProductById = (productId) =>
  `${baseURL}/products/${productId}`;
  

export const urlCreateProduct = `${baseURL}/admin/products/`;
export const urlUpdateProduct = (productId) =>
  `${baseURL}/admin/products/${productId}`;
export const urlDeleteProduct = (productId) => 
  `${baseURL}/admin/products/${productId}`;  


export const urlGetProfile = `${baseURL}/profile/`;
export const urlUpdateProfile = `${baseURL}/profile/`;
export const urlCreateProfile = `${baseURL}/profile/`;

export const urlGetCart = `${baseURL}/cart/`;
export const urlAddToCart = `${baseURL}/cart/add`;
export const urlUpdateCart = `${baseURL}/cart/update`;
export const urlDeleteCart = (productId) => 
  `${baseURL}/cart/remove/${productId}`; 