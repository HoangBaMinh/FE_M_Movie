import { http } from "../api/http";

export async function getCountries() {
  const res = await http.get("/Country");
  if (!Array.isArray(res.data)) {
    console.error("Country API returned non-array:", res.data);
    throw new Error("Country API must return an array");
  }
  return res.data;
}
