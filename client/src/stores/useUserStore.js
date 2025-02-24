import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useUserStore = create((set, get) => ({
  user: null,
  loading: false,
  checkingAuth: true,

  signup: async ({ name, email, password, confirmPassword, navigate }) => {
    set({ loading: true });
    if (password !== confirmPassword) {
      set({ loading: false });
      toast.error("Passwords do not match");
      return;
    }

    try {
      const res = await axios.post("/auth/signup", {
        name,
        email,
        password,
      });

      set({ user: res.data, loading: false });
      toast.success("Signup successful");
      navigate("/login");
    } catch (error) {
      toast.error("Failed to signup: " + error.response.data.message);
    }
  },

  login: async ({ email, password, navigate }) => {
    set({ loading: true });
    try {
      const res = await axios.post("/auth/login", {
        email,
        password,
      });
      console.log(res.data);

      set({ user: res.data, loading: false });
      toast.success("Login successful");
      navigate("/");
    } catch (error) {
      toast.error("Failed to login: " + error.response.data.message);
    }
    set({ loading: false });
  },

  checkAuth: async () => {
    set({ checkingAuth: true });
    try {
      const res = await axios.get("/auth/profile");
      set({ user: res.data, checkingAuth: false });
    } catch (error) {
      set({ user: null, checkingAuth: false });
      console.log("Error in checkAuth: " + error.response.data.message);
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await axios.post("/auth/logout");
      set({ user: null, loading: false });
    } catch (error) {
      toast.error("Failed to logout: " + error.response.data.message);
    }
  },

  refreshToken: async () => {
    if (get().checkingAuth) return;

    set({ checkingAuth: true });
    try {
      const response = await axios.post("/auth/refresh-token");
      set({ checkingAuth: false });
      return response.data;
    } catch (error) {
      set({ user: null, checkingAuth: false });
      throw error;
    }
  },
}));

let refreshPromise = null;

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // if a refresh is already in progress
        if (refreshPromise) {
          await refreshPromise;
          return axios(originalRequest);
        }

        // start a new refresh request
        refreshPromise = useUserStore.getState().refreshToken();
        await refreshPromise;

        refreshPromise = null;

        return axios(originalRequest);
      } catch (refreshError) {
        // if refresh token fails, redirect to login page
        useUserStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
