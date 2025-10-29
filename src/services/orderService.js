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

const LAST_ORDER_ENDPOINT = ORDER_ENDPOINTS[ORDER_ENDPOINTS.length - 1];

const ORDER_CREATE_ENDPOINTS = [
  "/Order",
  "/Orders",
  "/Order/create",
  "/Orders/create",
  "/Order/book",
  "/Orders/book",
];

function buildOrderPayload(basePayload = {}) {
  if (!basePayload || typeof basePayload !== "object") {
    return {};
  }

  const {
    showtimeId,
    seatIds = [],
    promotionCode,
    promotionId,
    subtotal,
    discount,
    total,
    tickets = [],
  } = basePayload;

  const normalizedSeatIds = Array.from(
    new Set(
      (seatIds || [])
        .map((item) =>
          item == null || item === ""
            ? null
            : Number.isFinite(Number(item))
            ? Number(item)
            : item
        )
        .filter((item) => item !== null)
    )
  );

  const payload = {
    showtimeId:
      showtimeId ?? basePayload.showTimeId ?? basePayload.showtimeID ?? null,
    showTimeId: showtimeId ?? basePayload.showTimeId ?? null,
    showtimeID: showtimeId ?? basePayload.showtimeID ?? null,
    showTimeID: showtimeId ?? basePayload.showTimeID ?? null,
    seatIds: normalizedSeatIds,
    seats: normalizedSeatIds,
    seatIdList: normalizedSeatIds,
    showtimeSeatIds: normalizedSeatIds,
    showTimeSeatIds: normalizedSeatIds,
    seatCodes: basePayload.seatCodes || basePayload.seats || [],
    tickets: Array.isArray(tickets) ? tickets : [],
    items: Array.isArray(tickets) ? tickets : [],
    promotionCode: promotionCode || basePayload.promotionCode || null,
    promotionId: promotionId ?? basePayload.promotionId ?? null,
    discountAmount: discount ?? basePayload.discountAmount ?? null,
    totalAmount: total ?? basePayload.totalAmount ?? basePayload.amount ?? null,
    subTotal: subtotal ?? basePayload.subTotal ?? subtotal,
    orderAmount: total ?? basePayload.orderAmount ?? null,
    finalAmount: total ?? basePayload.finalAmount ?? null,
  };

  return {
    ...basePayload,
    ...payload,
  };
}

function extractOrderId(data) {
  if (data == null) return null;

  if (typeof data === "number" || typeof data === "bigint") {
    return Number(data);
  }

  if (typeof data === "string") {
    const numeric = Number(data);
    return Number.isFinite(numeric) ? numeric : data;
  }

  const candidates = [
    data.id,
    data.orderId,
    data.orderID,
    data.orderCode,
    data.value,
    data.result,
    data.data,
  ];

  for (const candidate of candidates) {
    if (candidate == null || candidate === "") continue;
    if (typeof candidate === "number" || typeof candidate === "bigint") {
      return Number(candidate);
    }
    if (typeof candidate === "string") {
      const numeric = Number(candidate);
      return Number.isFinite(numeric) ? numeric : candidate;
    }
  }

  return null;
}

export function extractOrdersList(data) {
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
      const normalized = extractOrdersList(response?.data);

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
      if (endpoint === LAST_ORDER_ENDPOINT) {
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

export async function createOrder(basePayload = {}, opts = {}) {
  const payload = buildOrderPayload(basePayload);

  let lastError = null;

  for (const endpoint of ORDER_CREATE_ENDPOINTS) {
    try {
      const response = await http.post(endpoint, payload, {
        signal: opts.signal,
      });

      const data = response?.data ?? null;

      return {
        data,
        orderId: extractOrderId(data),
        endpoint,
      };
    } catch (error) {
      if (error?.name === "CanceledError" || error?.code === "ERR_CANCELED") {
        throw error;
      }

      if (error?.response?.status === 404 || error?.response?.status === 405) {
        lastError = error;
        continue;
      }

      lastError = error;
      break;
    }
  }

  if (lastError) {
    throw lastError;
  }

  throw new Error("Không tạo được đơn hàng. Vui lòng thử lại sau.");
}

export default { getMyOrders, createOrder };
