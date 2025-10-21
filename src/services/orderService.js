import { http } from "../api/http";

const ORDER_ENDPOINTS = [
  "/Order/my-orders",
  "/Order/my",
  "/Order/me",
  "/Order/user",
  "/Orders/my",
  "/Orders/me",
  "/Orders/user",
  "/Orders/history",
  "/Order/history",
  "/Orders",
  "/Order",
];

function normalizeResponse(data) {
  if (!data) return [];

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.orders)) return data.orders;
  if (Array.isArray(data?.orderList)) return data.orderList;
  if (Array.isArray(data?.records)) return data.records;
  if (Array.isArray(data?.value)) return data.value;
  if (Array.isArray(data?.list)) return data.list;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data?.items)) return data.data.items;
  if (Array.isArray(data?.data?.results)) return data.data.results;
  if (Array.isArray(data?.payload)) return data.payload;
  if (Array.isArray(data?.payload?.items)) return data.payload.items;

  return [];
}

export async function getMyOrders(opts = {}) {
  const errors = [];

  for (const endpoint of ORDER_ENDPOINTS) {
    try {
      const response = await http.get(endpoint, { signal: opts.signal });
      const normalized = normalizeResponse(response?.data);

      if (
        !normalized.length &&
        ORDER_ENDPOINTS.indexOf(endpoint) < ORDER_ENDPOINTS.length - 2
      ) {
        // Nếu không có dữ liệu, thử endpoint tiếp theo.
        continue;
      }

      if (normalized.length) {
        return normalized;
      }

      // Nếu endpoint trả về object mà không có mảng, nhưng là endpoint cuối -> trả object.
      if (endpoint === ORDER_ENDPOINTS[ORDER_ENDPOINTS.length - 1]) {
        return response?.data ?? [];
      }
    } catch (error) {
      if (error?.name === "CanceledError" || error?.code === "ERR_CANCELED") {
        throw error;
      }
      errors.push({ endpoint, error });
    }
  }

  const lastError = errors.at(-1)?.error;
  if (lastError) {
    throw lastError;
  }

  throw new Error("Không tìm thấy API đơn hàng phù hợp.");
}

export default { getMyOrders };
