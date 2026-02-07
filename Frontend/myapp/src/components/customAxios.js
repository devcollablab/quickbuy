// import axios from "axios";

// const customAxios = axios.create({
//   baseURL: import.meta.env.VITE_API_URL,
//   headers: {
//     "Content-Type": "application/json",
//     "x-admin-key": import.meta.env.VITE_ADMIN_KEY
//   }
// });

// customAxios.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// export default customAxios;


import axios from "axios";

const customAxios = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
    "x-admin-key": import.meta.env.VITE_ADMIN_KEY,
  },
});

// Attach token only if it exists
customAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    // Do NOT attach token for login/signup
    if (token && !config.url.includes("/login") && !config.url.includes("/signup")) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default customAxios;
