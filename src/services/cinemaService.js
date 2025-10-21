import { http } from "../api/http";

export async function getCinemas() {
  const res = await http.get("/Cinema");
  if (!Array.isArray(res.data)) {
    console.error("Cinema API returned non-array:", res.data);
    throw new Error("Cinema API must return an array");
  }
  return res.data;
}
