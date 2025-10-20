import { useEffect, useMemo, useState } from "react";
import useDebounce from "../hooks/useDebounce";
import { useCategories } from "../hooks/useCategories";
import { useMovies } from "../hooks/useMovies";
import { useCountries } from "../hooks/useCountries";
import HeaderBar from "./HeaderBar";
import AuthModal from "./AuthModal";
import FilterBar from "./movie-browser/FilterBar";
import MovieSection from "./movie-browser/MovieSection";
import { logout as logoutApi } from "../services/authService";
import { getAccessToken, logout as clearTokens } from "../api/http";
import "../css/MovieBrowser.css";

export default function MovieBrowser() {
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeCountry, setActiveCountry] = useState(null);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalView, setAuthModalView] = useState("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
    data: movies = [],
    loading: loadingMovies,
    error: moviesError,
    totalCount = 0,
    totalPages = 0,
    hasPreviousPage = false,
    hasNextPage = false,
  } = useMovies({
    categoryId: activeCategory,
    countryId: activeCountry,
    query: debouncedQuery,
    pageNumber: currentPage,
    pageSize: 12,
    usePagination: true,
  });

  const error = categoriesError || countriesError || moviesError;

  useEffect(() => {
    const token = getAccessToken();
    setIsLoggedIn(Boolean(token));
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, activeCountry, debouncedQuery]);

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

    return "PHIM ĐỀ CỬ";
  }, [
    debouncedQuery,
    hasActiveSearch,
    activeCategory,
    activeCountry,
    categories,
    countries,
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
        activeCategory={activeCategory}
        activeCountry={activeCountry}
        hasActiveSearch={hasActiveSearch}
        onSelectCategory={setActiveCategory}
        onSelectCountry={setActiveCountry}
        onReset={() => {
          setActiveCategory(null);
          setActiveCountry(null);
        }}
        loadingCategories={loadingCategories}
        loadingCountries={loadingCountries}
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
