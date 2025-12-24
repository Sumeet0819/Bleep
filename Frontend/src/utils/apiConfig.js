import axios from "axios";


export const instance = axios.create({
  baseURL: "https://bleep-5hlw.onrender.com/api",
  headers: { "Content-Type": "application/json" },
    withCredentials: true 
});