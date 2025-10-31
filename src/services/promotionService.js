import { http } from "../api/http";

export async function getActivePromotions(opts = {}) {
  const res = await http.get("/Promotion/active", {
    signal: opts.signal,
  });

  const data = Array.isArray(res.data) ? res.data : res.data?.items || [];
  return data;
}

export async function validatePromotionCode(payload, opts = {}) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Payload is required to validate promotion code");
  }

  const rawAmount =
    payload.orderAmount != null ? payload.orderAmount : payload.amount;

  let numericAmount = 0;
  if (typeof rawAmount === "number") {
    numericAmount = rawAmount;
  } else if (typeof rawAmount === "string") {
    const cleaned = rawAmount.replace(/[^0-9.,-]/g, "");
    // Dấu phẩy thường được dùng làm phân cách thập phân ở VN
    const normalized = cleaned.replace(/,/g, "");
    numericAmount = Number(normalized);
  }

  if (!Number.isFinite(numericAmount) || numericAmount < 0) {
    numericAmount = 0;
  }

  const body = {
    code: (payload.code || payload.promotionCode || "").trim(),
    orderAmount: numericAmount,
    userId: payload.userId ?? payload.customerId ?? null,
  };

  const res = await http.post("/Promotion/validate", body, {
    signal: opts.signal,
  });

  return res.data;
}

export default {
  getActivePromotions,
  validatePromotionCode,
};
