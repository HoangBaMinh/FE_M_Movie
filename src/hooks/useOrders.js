import { useCallback, useEffect, useRef, useState } from "react";
import { getOrders } from "../services/orderService";

function extractErrorMessage(error) {
  if (!error) return "";

  const responseData = error?.response?.data;
  const detail =
    responseData?.message ||
    responseData?.detail ||
    responseData?.title ||
    (Array.isArray(responseData?.errors)
      ? responseData.errors.join("; ")
      : null) ||
    (responseData?.errors
      ? Object.values(responseData.errors).flat().join("; ")
      : null);

  return detail || error.message || "Có lỗi xảy ra";
}

export function useOrders({ enabled = true } = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState("");
  const abortRef = useRef(null);

  const load = useCallback(async () => {
    abortRef.current?.abort?.();

    if (!enabled) {
      setData([]);
      setLoading(false);
      setError("");
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setLoading(true);
      setError("");
      const orders = await getOrders({ signal: controller.signal });
      if (!controller.signal.aborted) {
        setData(Array.isArray(orders) ? orders : []);
      }
    } catch (err) {
      if (controller.signal.aborted) return;
      console.error("Load orders error:", err);
      setError(extractErrorMessage(err));
      setData([]);
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [enabled]);

  useEffect(() => {
    load();
    return () => abortRef.current?.abort?.();
  }, [load]);

  const refetch = useCallback(() => {
    if (!enabled) {
      return Promise.resolve();
    }

    return load();
  }, [enabled, load]);

  return { data, loading, error, refetch };
}

export default useOrders;
