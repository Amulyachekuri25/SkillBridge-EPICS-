// src/api/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // change if your backend host/port differ
  withCredentials: true,
});

export const getInternships = () => API.get("/internships");

export default API;