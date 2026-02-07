import config from "./appSettings.json";

const baseURL = config.baseUrl;

export const urlVerifyotp = `${baseURL}/auth/verify-otp`;
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
