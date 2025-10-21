import { useEffect, useMemo, useRef, useState } from "react";
import useDebounce from "../hooks/useDebounce";
import { useCategories } from "../hooks/useCategories";
import { useCountries } from "../hooks/useCountries";
import { useCinemas } from "../hooks/useCinemas";
import HeaderBar from "./HeaderBar";
import AuthModal from "./AuthModal";
import FilterBar from "./movie-browser/FilterBar";
import MovieSection from "./movie-browser/MovieSection";
import { logout as logoutApi } from "../services/authService";
import { getAccessToken, logout as clearTokens } from "../api/http";
import {
  getMovies,
  getMoviesByCategory,
  getMoviesByCinema,
  getMoviesByCountry,
  getMoviesFiltered,
  getMoviesPaged,
  searchMoviesByName,
} from "../services/movieService";
import "../css/MovieBrowser.css";

export default function MovieBrowser() {
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeCountry, setActiveCountry] = useState(null);
  const [activeCinema, setActiveCinema] = useState(null);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalView, setAuthModalView] = useState("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [movies, setMovies] = useState([]);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [moviesError, setMoviesError] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);

  const fetchAbortRef = useRef(null);

  const debouncedQuery = useDebounce(query, 300);

  const {
    data: categories = [],
    loading: loadingCategories,
    error: categoriesError,
  } = useCategories();

  const {
    data: countries = [],
    loading: loadingCountries,
    error: countriesError,
  } = useCountries();

  const {
    data: cinemas = [],
    loading: loadingCinemas,
    error: cinemasError,
  } = useCinemas();

  const error =
    categoriesError || countriesError || moviesError || cinemasError;

  useEffect(() => {
    const token = getAccessToken();
    setIsLoggedIn(Boolean(token));
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, activeCountry, activeCinema, debouncedQuery]);

  useEffect(() => {
    fetchAbortRef.current?.abort?.();
    const controller = new AbortController();
    fetchAbortRef.current = controller;

    const run = async () => {
      setLoadingMovies(true);
      setMoviesError("");

      try {
        const trimmedQuery = debouncedQuery?.trim();

        // 1. Thử dùng endpoint phân trang nếu backend hỗ trợ
        try {
          const paged = await getMoviesPaged(
            {
              pageNumber: currentPage,
              pageSize: 12,
              searchTerm: trimmedQuery,
              categoryId: activeCategory ?? undefined,
              countryId: activeCountry ?? undefined,
              cinemaId: activeCinema ?? undefined,
              sortBy: "name",
              sortDescending: false,
            },
            { signal: controller.signal }
          );

          if (controller.signal.aborted) return;

          if (Array.isArray(paged?.items) && paged.items.length) {
            setMovies(paged.items);
            setTotalCount(paged.totalCount ?? paged.items.length);
            setTotalPages(paged.totalPages ?? 1);
            setHasPreviousPage(Boolean(paged.hasPreviousPage));
            setHasNextPage(Boolean(paged.hasNextPage));
            setLoadingMovies(false);
            return;
          }

          if (paged?.items?.length === 0) {
            setMovies([]);
            setTotalCount(0);
            setTotalPages(0);
            setHasPreviousPage(false);
            setHasNextPage(false);
            setLoadingMovies(false);
            return;
          }
        } catch (err) {
          if (controller.signal.aborted) return;
          console.error("Paged movies error:", err);
          // Rơi xuống fallback bên dưới khi API paged không sẵn sàng
        }

        // 2. Fallback: dùng các endpoint hiện có
        try {
          const filtered = await getMoviesFiltered(
            {
              categoryId: activeCategory,
              countryId: activeCountry,
              q: trimmedQuery,
            },
            { signal: controller.signal }
          );

          if (controller.signal.aborted) return;

          if (Array.isArray(filtered) && filtered.length) {
            handleClientPagination(filtered);
            setLoadingMovies(false);
            return;
          }
        } catch (err) {
          const status = err?.response?.status ?? err?.status;
          if (status && status !== 404) {
            throw err;
          }
        }

        const fallbackData = await loadWithLegacyEndpoints({
          controller,
          trimmedQuery,
        });

        if (controller.signal.aborted) return;

        handleClientPagination(fallbackData);
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error("Load movies error:", err);
        setMoviesError("Không tải được danh sách phim. Vui lòng thử lại.");
      } finally {
        if (!controller.signal.aborted) {
          setLoadingMovies(false);
        }
      }
    };

    const handleClientPagination = (allMovies) => {
      const safeMovies = Array.isArray(allMovies) ? allMovies : [];
      const nextTotal = safeMovies.length;
      const computedTotalPages = nextTotal
        ? Math.max(1, Math.ceil(nextTotal / 12))
        : 0;
      const safePage = computedTotalPages
        ? Math.min(currentPage, computedTotalPages)
        : 1;
      const startIndex = (safePage - 1) * 12;
      const pageItems = safeMovies.slice(startIndex, startIndex + 12);

      if (safePage !== currentPage) {
        setCurrentPage(safePage);
      }

      setMovies(pageItems);
      setTotalCount(nextTotal);
      setTotalPages(computedTotalPages);
      setHasPreviousPage(safePage > 1);
      setHasNextPage(safePage < computedTotalPages);
    };

    const loadWithLegacyEndpoints = async ({ controller, trimmedQuery }) => {
      let data = [];

      if (trimmedQuery) {
        try {
          const searchResults = await searchMoviesByName(trimmedQuery, {
            signal: controller.signal,
          });
          data = Array.isArray(searchResults) ? searchResults : [];
        } catch (err) {
          const status = err?.response?.status ?? err?.status;
          if (status >= 500) {
            data = [];
          } else {
            const all = await getMovies({ signal: controller.signal });
            data = (all || []).filter((movie) =>
              movie.name?.toLowerCase().includes(trimmedQuery.toLowerCase())
            );
          }
        }

        if (activeCategory != null) {
          data = data.filter((movie) =>
            Array.isArray(movie.lstCategoryIds)
              ? movie.lstCategoryIds.includes(activeCategory)
              : false
          );
        }

        if (activeCountry != null) {
          data = data.filter((movie) => movie.countryId === activeCountry);
        }
      } else {
        if (activeCategory != null && activeCountry != null) {
          const byCountry = await getMoviesByCountry(activeCountry, {
            signal: controller.signal,
          });
          data = (byCountry || []).filter((movie) =>
            Array.isArray(movie.lstCategoryIds)
              ? movie.lstCategoryIds.includes(activeCategory)
              : false
          );
        } else if (activeCountry != null) {
          data = await getMoviesByCountry(activeCountry, {
            signal: controller.signal,
          });
        } else if (activeCategory != null) {
          data = await getMoviesByCategory(activeCategory, {
            signal: controller.signal,
          });
        } else if (activeCinema != null) {
          data = await getMoviesByCinema(activeCategory, {
            signal: controller.signal,
          });
        } else {
          data = await getMovies({ signal: controller.signal });
        }
      }

      return data;
    };

    run();

    return () => controller.abort();
  }, [
    activeCategory,
    activeCountry,
    activeCinema,
    currentPage,
    debouncedQuery,
  ]);

  const hasActiveSearch = Boolean(debouncedQuery?.trim());

  const sectionTitle = useMemo(() => {
    if (hasActiveSearch) {
      return `KẾT QUẢ TÌM KIẾM "${debouncedQuery.toUpperCase()}"`;
    }

    if (activeCategory) {
      const category = categories.find((item) => item.id === activeCategory);
      return category ? category.name.toUpperCase() : "DANH MỤC ĐƯỢC CHỌN";
    }

    if (activeCountry) {
      const country = countries.find((item) => item.id === activeCountry);
      return country
        ? `QUỐC GIA: ${country.name.toUpperCase()}`
        : "QUỐC GIA ĐƯỢC CHỌN";
    }
    if (activeCinema) {
      const cinema = cinemas.find((item) => item.id === activeCinema);
      return cinema
        ? `RẠP CHIẾU: ${cinema.name.toUpperCase()}`
        : "RẠP CHIẾU ĐƯỢC CHỌN";
    }

    return "PHIM ĐỀ CỬ";
  }, [
    debouncedQuery,
    hasActiveSearch,
    activeCategory,
    activeCountry,
    activeCinema,
    categories,
    countries,
    cinemas,
  ]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const openAuthModal = (view = "login") => {
    setAuthModalView(view);
    setShowAuthModal(true);
  };

  const handleLoginSuccess = () => {
    setShowAuthModal(false);
    setIsLoggedIn(true);
  };

  const handleChangePasswordSuccess = () => {
    clearTokens();
    setIsLoggedIn(false);
    setShowAuthModal(false);
    setActiveCategory(null);
    setActiveCountry(null);
    setActiveCinema(null);
    setQuery("");
  };

  const handleCloseModal = () => {
    setShowAuthModal(false);
  };

  const handleLogout = async () => {
    try {
      await logoutApi();
      clearTokens();
      setIsLoggedIn(false);
      alert("Đăng xuất thành công!");
    } catch (error) {
      console.error("Logout error:", error);
      clearTokens();
      setIsLoggedIn(false);
    }
  };

  const emptyMessage = hasActiveSearch
    ? `Không tìm thấy phim nào với từ khóa "${debouncedQuery}"`
    : activeCategory || activeCountry
    ? "Không có phim cho bộ lọc hiện tại"
    : "Không có phim trong danh mục này";

  return (
    <div className="movie-browser">
      <HeaderBar
        query={query}
        onQueryChange={setQuery}
        onLogin={() => openAuthModal("login")}
        onLogout={handleLogout}
        onChangePassword={() => openAuthModal("changePassword")}
        onBookmark={() => console.log("open bookmarks")}
        isLoggedIn={isLoggedIn}
      />

      <FilterBar
        categories={categories}
        countries={countries}
        cinemas={cinemas}
        activeCategory={activeCategory}
        activeCountry={activeCountry}
        hasActiveSearch={hasActiveSearch}
        onSelectCategory={setActiveCategory}
        onSelectCountry={setActiveCountry}
        onSelectCinema={setActiveCinema}
        onReset={() => {
          setActiveCategory(null);
          setActiveCountry(null);
          setActiveCinema(null);
        }}
        loadingCategories={loadingCategories}
        loadingCountries={loadingCountries}
        loadingCinemas={loadingCinemas}
      />

      <main className="main-content">
        {error && <div className="error-message">{String(error)}</div>}

        <MovieSection
          title={sectionTitle}
          totalCount={totalCount}
          currentPage={currentPage}
          totalPages={totalPages}
          loading={loadingMovies}
          movies={movies}
          hasPreviousPage={hasPreviousPage}
          hasNextPage={hasNextPage}
          onPageChange={handlePageChange}
          emptyMessage={emptyMessage}
        />
      </main>

      {showAuthModal && (
        <AuthModal
          onClose={handleCloseModal}
          onLoginSuccess={handleLoginSuccess}
          onChangePasswordSuccess={handleChangePasswordSuccess}
          initialView={authModalView}
        />
      )}
    </div>
  );
}
