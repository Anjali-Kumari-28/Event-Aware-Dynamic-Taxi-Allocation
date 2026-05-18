import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const predict = async (text: string) => {
  console.log("Calling predict with:", text);
  try {
    const res = await axios.post(`${BASE}/predict`, { text });
    console.log("Predict API response:", res.data);
    return res.data;
  } catch (err: any) {
    // ✅ When backend returns 400 or 422, axios throws — extract the error message
    if (err.response?.data?.error) {
      // Return error as a normal object so App.tsx can handle it cleanly
      return { error: err.response.data.error };
    }
    // Network error or server down
    throw new Error("Cannot reach backend. Make sure it is running on port 8000.");
  }
};

export const simulateTaxis = async (allocations: any[]) => {
  console.log("Calling simulateTaxis with:", allocations);
  try {
    const res = await axios.post(`${BASE}/simulate-taxis`, { allocations });
    console.log("SimulateTaxis API response:", res.data);
    return res.data.taxis;
  } catch (err: any) {
    console.error("simulateTaxis error:", err);
    return []; // ✅ Return empty array instead of crashing
  }
};
