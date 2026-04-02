import axios from "axios";

// ✅ Use ENV in production, fallback for safety
const BASE_URL =
  process.env.REACT_APP_API_URL ||
  "https://foodash-backend-1-uuwg.onrender.com/api";

// ✅ Axios instance
const API = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Attach token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("foodash_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Handle unauthorized globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("foodash_token");
      localStorage.removeItem("foodash_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

//
// 🔐 AUTH APIs
//
export const authAPI = {
  register: (data) => API.post("/auth/register", data),
  login: (data) => API.post("/auth/login", data),
  getMe: () => API.get("/auth/me"),
  updateProfile: (data) => API.put("/auth/profile", data),
  changePassword: (data) => API.put("/auth/change-password", data),
};

//
// 🍽 RESTAURANTS
//
export const restaurantAPI = {
  getAll: (params) => API.get("/restaurants", { params }),
  getOne: (id) => API.get(`/restaurants/${id}`),
  register: (data) => API.post("/restaurants/register", data),
  getMyProfile: () => API.get("/restaurants/my/profile"),
  updateProfile: (data) => API.put("/restaurants/my/profile", data),
  toggleStatus: () => API.put("/restaurants/my/toggle-status"),
  getOrders: (params) => API.get("/restaurants/my/orders", { params }),
  getAnalytics: () => API.get("/restaurants/my/analytics"),
};

//
// 🍔 MENU
//
export const menuAPI = {
  getItems: (restaurantId) => API.get(`/menu/${restaurantId}`),
  addItem: (data) => API.post("/menu", data),
  updateItem: (id, data) => API.put(`/menu/${id}`, data),
  deleteItem: (id) => API.delete(`/menu/${id}`),
  toggleAvailability: (id) => API.put(`/menu/${id}/toggle`),
};

//
// 📦 ORDERS
//
export const orderAPI = {
  place: (data) => API.post("/orders", data),
  getMy: (params) => API.get("/orders/my", { params }),
  getOne: (id) => API.get(`/orders/${id}`),
  updateStatus: (id, data) => API.put(`/orders/${id}/status`, data),
  rate: (id, data) => API.put(`/orders/${id}/rate`, data),
};

//
// 🚚 DELIVERY
//
export const deliveryAPI = {
  getAvailable: () => API.get("/delivery/available-orders"),
  getMyDeliveries: (params) => API.get("/delivery/my-deliveries", { params }),
  getEarnings: () => API.get("/delivery/earnings"),
  acceptDelivery: (orderId) => API.put(`/delivery/accept/${orderId}`),
  updateStatus: (orderId, data) =>
    API.put(`/delivery/update-status/${orderId}`, data),
  updateLocation: (data) => API.put("/delivery/location", data),
  toggleAvailability: () => API.put("/delivery/toggle-availability"),
};

//
// 🛠 ADMIN
//
export const adminAPI = {
  getDashboard: () => API.get("/admin/dashboard"),
  getUsers: (params) => API.get("/admin/users", { params }),
  toggleUser: (id) => API.put(`/admin/users/${id}/toggle`),
  getRestaurants: (params) => API.get("/admin/restaurants", { params }),
  getPendingRestaurants: () => API.get("/admin/restaurants/pending"),
  approveRestaurant: (id, data) =>
    API.put(`/admin/restaurants/${id}/approve`, data),
  getOrders: (params) => API.get("/admin/orders", { params }),
};

//
// 💳 PAYMENTS
//
export const paymentAPI = {
  createIntent: (data) => API.post("/payments/create-intent", data),
  verify: (data) => API.post("/payments/verify", data),
};

export default API;
