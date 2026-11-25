import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

export const verifyPin = async (pin) => {
  const { data } = await api.post("/verify-pin", { pin });
  return data;
};

export const completePrintJob = async (jobId) => {
  const { data } = await api.put(`/print-jobs/${jobId}/status`, {
    print_status: "completed",
  });
  return data;
};

export default api;