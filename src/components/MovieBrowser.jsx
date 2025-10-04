import { useMemo, useState, useEffect } from "react";
import useDebounce from "../hooks/useDebounce";
import { useCategories } from "../hooks/useCategories";
import { useMovies } from "../hooks/useMovies";
import { useCountries } from "../hooks/useCountries";
import HeaderBar from "../components/HeaderBar";
import "../css/MovieBrowser.css";

export default function MovieBrowser() {
  const [activeCat, setActiveCat] = useState(null);
  const [activeCountry, setActiveCountry] = useState(null);
  const [query, setQuery] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12); // Số phim mỗi trang

  const [catOpen, setCatOpen] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);

  const debounced = useDebounce(query, 300);

  const {
    data: categories,
    loading: loadingCats,
    error: catsError,
  } = useCategories();

  const {
    data: countries,
    loading: loadingCountries,
    error: countriesError,
  } = useCountries();

  const moviesState = useMovies({
    categoryId: activeCat,
    countryId: activeCountry,
    query: debounced,
    pageNumber: currentPage,
    pageSize: pageSize,
    usePagination: true, // BẬT PHÂN TRANG
  });

  const {
    data: movies,
    loading: loadingMovies,
    error: moviesError,
    totalCount,
    totalPages,
    hasPreviousPage,
    hasNextPage,
  } = moviesState;

  // DEBUG: Xem state có gì
  // console.log("Movies State:", moviesState);
  // console.log("Pagination:", {
  //   totalCount,
  //   totalPages,
  //   currentPage,
  //   hasNextPage,
  // });

  const error = catsError || moviesError || countriesError;

  // Reset về trang 1 khi đổi filter
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCat, activeCountry, debounced]);

  useEffect(() => {
    if (catOpen) setCountryOpen(false);
  }, [catOpen]);

  useEffect(() => {
    if (countryOpen) setCatOpen(false);
  }, [countryOpen]);

  const sectionTitle = useMemo(() => {
    if (debounced?.trim())
      return `KẾT QUẢ TÌM KIẾM "${debounced.toUpperCase()}"`;
    if (activeCat) {
      const c = categories.find((x) => x.id === activeCat);
      return c ? c.name.toUpperCase() : "DANH MỤC ĐƯỢC CHỌN";
    }
    if (activeCountry) {
      const n = countries.find((x) => x.id === activeCountry);
      return n ? `QUỐC GIA: ${n.name.toUpperCase()}` : "QUỐC GIA ĐƯỢC CHỌN";
    }
    return "PHIM ĐỀ CỬ";
  }, [debounced, activeCat, activeCountry, categories, countries]);

  // Hàm chuyển trang
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Tạo mảng số trang để hiển thị
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5; // Hiển thị tối đa 5 nút

    if (totalPages <= maxVisible) {
      // Nếu ít trang, hiển thị hết
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Nếu nhiều trang, hiển thị thông minh
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }

    return pages;
  };

  return (
    <div className="movie-browser">
      <HeaderBar
        query={query}
        onQueryChange={setQuery}
        onLogin={() => console.log("go login")}
        onRegister={() => console.log("go register")}
        onBookmark={() => console.log("open bookmarks")}
      />

      <header className="header">
        <div className="header-content">
          <nav className="nav-menu">
            <button
              className={`nav-item ${
                activeCat === null && activeCountry === null && !debounced
                  ? "active"
                  : ""
              }`}
              onClick={() => {
                setActiveCat(null);
                setActiveCountry(null);
              }}
            >
              TRANG CHỦ
            </button>

            {/* THỂ LOẠI */}
            <div
              className="nav-dropdown"
              onMouseLeave={() => setCatOpen(false)}
            >
              <button
                className="nav-item"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCatOpen((v) => !v);
                }}
              >
                THỂ LOẠI ▼
              </button>
              {catOpen && (
                <div className="dropdown-menu">
                  {loadingCats ? (
                    <div className="dropdown-item">Đang tải...</div>
                  ) : (
                    categories.map((c) => (
                      <button
                        key={c.id}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setActiveCat(c.id);
                          setCatOpen(false);
                        }}
                        className={`dropdown-item ${
                          activeCat === c.id ? "active" : ""
                        }`}
                        title={c.description || ""}
                      >
                        {c.name}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* QUỐC GIA */}
            <div
              className="nav-dropdown"
              onMouseLeave={() => setCountryOpen(false)}
            >
              <button
                className="nav-item"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCountryOpen((v) => !v);
                }}
              >
                QUỐC GIA ▼
              </button>
              {countryOpen && (
                <div className="dropdown-menu">
                  {loadingCountries ? (
                    <div className="dropdown-item">Đang tải...</div>
                  ) : (
                    countries.map((ct) => (
                      <button
                        key={ct.id}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setActiveCountry(ct.id);
                          setCountryOpen(false);
                        }}
                        className={`dropdown-item ${
                          activeCountry === ct.id ? "active" : ""
                        }`}
                      >
                        {ct.name}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <button className="nav-item">PHIM CHIẾU RẠP</button>
            <button className="nav-item">PHIM BỘ</button>
            <button className="nav-item">PHIM LẺ</button>
          </nav>
        </div>
      </header>

      <main className="main-content">
        {error && <div className="error-message">{String(error)}</div>}

        <div className="movie-section">
          <div className="section-header">
            <h2 className="section-title">{sectionTitle}</h2>
            {totalCount > 0 && (
              <div className="result-info">
                Tìm thấy <strong>{totalCount}</strong> phim | Trang{" "}
                {currentPage}/{totalPages}
              </div>
            )}
          </div>

          {loadingMovies ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              Đang tải phim...
            </div>
          ) : movies.length ? (
            <>
              <div className="movies-grid">
                {movies.map((movie) => (
                  <div key={movie.id} className="movie-card">
                    <div className="movie-poster">
                      <div className="quality-badge">
                        {movie.quality || "HD"}
                      </div>
                    </div>
                    <div className="movie-info">
                      <h4>{movie.name}</h4>
                      <p>{movie.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!hasPreviousPage}
                  >
                    « Trước
                  </button>

                  {getPageNumbers().map((page, idx) => (
                    <button
                      key={idx}
                      className={`pagination-btn ${
                        page === currentPage ? "active" : ""
                      } ${page === "..." ? "dots" : ""}`}
                      onClick={() =>
                        typeof page === "number" && handlePageChange(page)
                      }
                      disabled={page === "..."}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!hasNextPage}
                  >
                    Sau »
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="no-results">
              {debounced?.trim()
                ? `Không tìm thấy phim nào với từ khóa "${debounced}"`
                : activeCat || activeCountry
                ? "Không có phim cho bộ lọc hiện tại"
                : "Không có phim trong danh mục này"}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
