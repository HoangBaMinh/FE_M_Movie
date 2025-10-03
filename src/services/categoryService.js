import { http } from "../api/http";

// MUST return an array
export async function getCategories() {
  const res = await http.get("/Category"); // -> đúng: /api/Category vì baseURL đã + "/api"
  if (!Array.isArray(res.data)) {
    console.error("Category API returned non-array:", res.data);
    throw new Error("Category API must return an array");
  }
  return res.data; // <-- mảng CategoryDto
}
