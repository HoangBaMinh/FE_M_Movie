// import { useEffect, useReducer, useRef } from "react";
// import {
//   getMovies,
//   getMoviesByCategory,
//   getMoviesByCountry,
//   searchMoviesByName,
//   getMoviesFiltered,
// } from "../services/movieService";

// const initial = { data: [], loading: true, error: "" };

// function reducer(state, action) {
//   switch (action.type) {
//     case "START":
//       return { ...state, loading: true, error: "" };
//     case "SUCCESS":
//       return { data: action.payload || [], loading: false, error: "" };
//     case "EMPTY":
//       return { data: [], loading: false, error: "" };
//     case "ERROR":
//       return {
//         ...state,
//         loading: false,
//         error: action.payload || "Có lỗi xảy ra",
//       };
//     default:
//       return state;
//   }
// }

// /**
//  * Params:
//  * - categoryId: number | null
//  * - countryId : number | null
//  * - query     : string (đã debounce ngoài component)
//  */
// export function useMovies({ categoryId, countryId, query }) {
//   const [state, dispatch] = useReducer(reducer, initial);
//   const abortRef = useRef(null);

//   useEffect(() => {
//     abortRef.current?.abort?.();
//     const controller = new AbortController();
//     abortRef.current = controller;

//     const run = async () => {
//       dispatch({ type: "START" });
//       try {
//         const q = query?.trim();

//         // 1) Ưu tiên gọi endpoint tổng hợp
//         try {
//           const data = await getMoviesFiltered(
//             { categoryId, countryId, q },
//             { signal: controller.signal }
//           );
//           if (controller.signal.aborted) return;
//           if (!data?.length) dispatch({ type: "EMPTY" });
//           else dispatch({ type: "SUCCESS", payload: data });
//           return; // done
//         } catch (err) {
//           const status = err?.response?.status ?? err?.status;
//           // Nếu 404 hoặc chưa có endpoint filter → fallback
//           if (status && status !== 404) {
//             // lỗi server khác -> ném lên xử lý chung
//             throw err;
//           }
//         }

//         // 2) Fallback (khi chưa triển khai /Movie/filter)
//         let data = [];
//         if (q) {
//           // Tìm theo tên trước
//           try {
//             const searchResults = await searchMoviesByName(q, {
//               signal: controller.signal,
//             });
//             data = Array.isArray(searchResults) ? searchResults : [];
//           } catch (err) {
//             const st = err?.response?.status ?? err?.status;
//             if (st >= 500) data = [];
//             else {
//               const all = await getMovies({ signal: controller.signal });
//               data = (all || []).filter((m) =>
//                 m.name?.toLowerCase().includes(q.toLowerCase())
//               );
//             }
//           }

//           // Lọc tiếp theo category/country nếu có
//           if (categoryId != null) {
//             data = data.filter(
//               (m) =>
//                 Array.isArray(m.lstCategoryIds) &&
//                 m.lstCategoryIds.includes(categoryId)
//             );
//           }
//           if (countryId != null) {
//             data = data.filter((m) => m.countryId === countryId);
//           }
//         } else {
//           // Không có query: ưu tiên gọi theo bộ lọc phần cứng nếu có
//           if (categoryId != null && countryId != null) {
//             // Không có endpoint kết hợp -> tạm gọi theo country rồi lọc category client-side
//             const byCountry = await getMoviesByCountry(countryId, {
//               signal: controller.signal,
//             });
//             data = (byCountry || []).filter(
//               (m) =>
//                 Array.isArray(m.lstCategoryIds) &&
//                 m.lstCategoryIds.includes(categoryId)
//             );
//           } else if (countryId != null) {
//             data = await getMoviesByCountry(countryId, {
//               signal: controller.signal,
//             });
//           } else if (categoryId != null) {
//             data = await getMoviesByCategory(categoryId, {
//               signal: controller.signal,
//             });
//           } else {
//             data = await getMovies({ signal: controller.signal });
//           }
//         }

//         if (controller.signal.aborted) return;
//         if (!data?.length) dispatch({ type: "EMPTY" });
//         else dispatch({ type: "SUCCESS", payload: data });
//       } catch (e) {
//         if (controller.signal.aborted) return;
//         console.error("Load movies error:", e);
//         dispatch({
//           type: "ERROR",
//           payload: "Không tải được danh sách phim. Vui lòng thử lại.",
//         });
//       }
//     };

//     run();
//     return () => controller.abort();
//   }, [categoryId, countryId, query]);

//   return state; // { data, loading, error }
// }

import { useEffect, useReducer, useRef } from "react";
import {
  getMovies,
  getMoviesByCategory,
  getMoviesByCountry,
  searchMoviesByName,
  getMoviesFiltered,
  getMoviesPaged,
} from "../services/movieService";

const initial = {
  data: [],
  loading: true,
  error: "",
  // Thêm pagination info
  totalCount: 0,
  pageNumber: 1,
  pageSize: 12,
  totalPages: 0,
  hasPreviousPage: false,
  hasNextPage: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "START":
      return { ...state, loading: true, error: "" };
    case "SUCCESS":
      return {
        data: action.payload?.items || action.payload || [],
        loading: false,
        error: "",
        // Update pagination info nếu có
        totalCount: action.payload?.totalCount ?? state.totalCount,
        pageNumber: action.payload?.pageNumber ?? state.pageNumber,
        pageSize: action.payload?.pageSize ?? state.pageSize,
        totalPages: action.payload?.totalPages ?? state.totalPages,
        hasPreviousPage:
          action.payload?.hasPreviousPage ?? state.hasPreviousPage,
        hasNextPage: action.payload?.hasNextPage ?? state.hasNextPage,
      };
    case "EMPTY":
      return {
        ...initial,
        data: [],
        loading: false,
        error: "",
        totalCount: 0,
      };
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
 * Params:
 * - categoryId: number | null
 * - countryId : number | null
 * - query     : string (đã debounce ngoài component)
 * - pageNumber: number (mặc định 1)
 * - pageSize  : number (mặc định 12)
 * - usePagination: boolean (true = dùng API phân trang, false = load all như cũ)
 */
export function useMovies({
  categoryId,
  countryId,
  query,
  pageNumber = 1,
  pageSize = 12,
  usePagination = false, // Thêm flag này
}) {
  const [state, dispatch] = useReducer(reducer, initial);
  const abortRef = useRef(null);

  useEffect(() => {
    abortRef.current?.abort?.();
    const controller = new AbortController();
    abortRef.current = controller;

    const run = async () => {
      dispatch({ type: "START" });
      try {
        const q = query?.trim();

        // Nếu dùng pagination, gọi API paged
        if (usePagination) {
          try {
            const pagedData = await getMoviesPaged(
              {
                pageNumber,
                pageSize,
                searchTerm: q,
                categoryId,
                countryId,
                sortBy: "name",
                sortDescending: false,
              },
              { signal: controller.signal }
            );

            if (controller.signal.aborted) return;

            // DEBUG: Kiểm tra response
            console.log("📊 Paged Response:", pagedData);
            console.log("TotalPages:", pagedData?.totalPages);
            console.log("TotalCount:", pagedData?.totalCount);

            if (!pagedData?.items?.length) {
              dispatch({ type: "EMPTY" });
            } else {
              dispatch({ type: "SUCCESS", payload: pagedData });
            }
            return;
          } catch (err) {
            if (controller.signal.aborted) return;
            console.error("Paged API error:", err);
            // Nếu lỗi, fallback về logic cũ
          }
        }

        // Logic cũ (không dùng pagination)
        // 1) Ưu tiên gọi endpoint tổng hợp
        try {
          const data = await getMoviesFiltered(
            { categoryId, countryId, q },
            { signal: controller.signal }
          );
          if (controller.signal.aborted) return;
          if (!data?.length) dispatch({ type: "EMPTY" });
          else dispatch({ type: "SUCCESS", payload: data });
          return;
        } catch (err) {
          const status = err?.response?.status ?? err?.status;
          if (status && status !== 404) {
            throw err;
          }
        }

        // 2) Fallback
        let data = [];
        if (q) {
          try {
            const searchResults = await searchMoviesByName(q, {
              signal: controller.signal,
            });
            data = Array.isArray(searchResults) ? searchResults : [];
          } catch (err) {
            const st = err?.response?.status ?? err?.status;
            if (st >= 500) data = [];
            else {
              const all = await getMovies({ signal: controller.signal });
              data = (all || []).filter((m) =>
                m.name?.toLowerCase().includes(q.toLowerCase())
              );
            }
          }

          if (categoryId != null) {
            data = data.filter(
              (m) =>
                Array.isArray(m.lstCategoryIds) &&
                m.lstCategoryIds.includes(categoryId)
            );
          }
          if (countryId != null) {
            data = data.filter((m) => m.countryId === countryId);
          }
        } else {
          if (categoryId != null && countryId != null) {
            const byCountry = await getMoviesByCountry(countryId, {
              signal: controller.signal,
            });
            data = (byCountry || []).filter(
              (m) =>
                Array.isArray(m.lstCategoryIds) &&
                m.lstCategoryIds.includes(categoryId)
            );
          } else if (countryId != null) {
            data = await getMoviesByCountry(countryId, {
              signal: controller.signal,
            });
          } else if (categoryId != null) {
            data = await getMoviesByCategory(categoryId, {
              signal: controller.signal,
            });
          } else {
            data = await getMovies({ signal: controller.signal });
          }
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
  }, [categoryId, countryId, query, pageNumber, pageSize, usePagination]);

  return state; // { data, loading, error, totalCount, pageNumber, ... }
}
