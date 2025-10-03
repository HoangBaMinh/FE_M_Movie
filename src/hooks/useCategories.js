import { useEffect, useReducer, useRef } from "react";
import { getCategories } from "../services/categoryService";

const initial = { data: [], loading: true, error: "" };

function reducer(state, action) {
  switch (action.type) {
    case "START":
      return { ...state, loading: true, error: "" };
    case "SUCCESS":
      return { data: action.payload || [], loading: false, error: "" };
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

export function useCategories() {
  const [state, dispatch] = useReducer(reducer, initial);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    const run = async () => {
      dispatch({ type: "START" });
      try {
        const data = await getCategories();
        if (!alive.current) return;
        dispatch({ type: "SUCCESS", payload: data });
      } catch (e) {
        if (!alive.current) return;
        dispatch({ type: "ERROR", payload: "Không tải được danh mục." });
        console.error("Load categories error:", e);
      }
    };
    run();
    return () => {
      alive.current = false;
    };
  }, []);

  return state; // {data, loading, error}
}
