import { useEffect, useReducer, useRef } from "react";
import {
  getMovies,
  getMoviesByCategory,
  searchMoviesByName,
} from "../services/movieService";

const initial = { data: [], loading: true, error: "" };

function reducer(state, action) {
  switch (action.type) {
    case "START":
      return { ...state, loading: true, error: "" };
    case "SUCCESS":
      return { data: action.payload || [], loading: false, error: "" };
    case "EMPTY":
      return { data: [], loading: false, error: "" };
    case "ERROR":
      return {
        ...state,
        loading: false,
        error: action.payload || "Có lỗi xảy ra",
      };
    default:
      return state;
  }
}

/**
 * Tham số:
 * - categoryId: number | null
 * - query: string (đã debounce ngoài component)
 */
export function useMovies({ categoryId, query }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const abortRef = useRef(null);

  useEffect(() => {
    abortRef.current?.abort?.(); // Hủy request trước đó
    const controller = new AbortController();
    abortRef.current = controller;
 
    const run = async () => {
      dispatch({ type: "START" });
      try {
        let data = [];
        const q = query?.trim();

        if (q) {
          // Tìm theo tên
          try {
            const searchResults = await searchMoviesByName(q, {
              signal: controller.signal,
            });
            data = Array.isArray(searchResults) ? searchResults : [];
            if (categoryId != null) {
              data = data.filter(
                (m) =>
                  Array.isArray(m.lstCategoryIds) &&
                  m.lstCategoryIds.includes(categoryId)
              );
            }
          } catch (err) {
            // Nếu 500 thì coi như không có kết quả; nếu lỗi khác, thử fallback
            const status = err?.response?.status ?? err?.status;
            if (status >= 500) {
              data = [];
            } else {
              const all = await getMovies({ signal: controller.signal });
              const filtered = (all || []).filter((m) =>
                m.name?.toLowerCase().includes(q.toLowerCase())
              );
              data =
                categoryId == null
                  ? filtered
                  : filtered.filter(
                      (m) =>
                        Array.isArray(m.lstCategoryIds) &&
                        m.lstCategoryIds.includes(categoryId)
                    );
            }
          }
        } else {
          // Không có query -> lấy theo danh mục
          data =
            categoryId == null
              ? await getMovies({ signal: controller.signal })
              : await getMoviesByCategory(categoryId, {
                  signal: controller.signal,
                }); 
        }

        if (controller.signal.aborted) return;
        if (!data?.length) dispatch({ type: "EMPTY" });
        else dispatch({ type: "SUCCESS", payload: data });
      } catch (e) {
        if (controller.signal.aborted) return;
        console.error("Load movies error:", e);
        dispatch({
          type: "ERROR",
          payload: "Không tải được danh sách phim. Vui lòng thử lại.",
        });
      }
    };

    run();
    return () => controller.abort();
  }, [categoryId, query]);

  return state; // {data, loading, error}
}
