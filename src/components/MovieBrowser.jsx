import { useMemo, useState } from "react";
import useDebounce from "../hooks/useDebounce";
import { useCategories } from "../hooks/useCategories";
import { useMovies } from "../hooks/useMovies";
import HeaderBar from "../components/HeaderBar";
import "../css/MovieBrowser.css";

export default function MovieBrowser() {
  const [activeCat, setActiveCat] = useState(null);
  const [query, setQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const debounced = useDebounce(query, 300);

  const {
    data: categories,
    loading: loadingCats,
    error: catsError,
  } = useCategories();
  const {
    data: movies,
    loading: loadingMovies,
    error: moviesError,
  } = useMovies({
    categoryId: activeCat,
    query: debounced,
  });
  const error = catsError || moviesError;

  const sectionTitle = useMemo(() => {
    if (debounced?.trim())
      return `KẾT QUẢ TÌM KIẾM "${debounced.toUpperCase()}"`;
    if (activeCat) {
      const c = categories.find((x) => x.id === activeCat);
      return c ? c.name.toUpperCase() : "DANH MỤC ĐƯỢC CHỌN";
    }
    return "PHIM ĐỀ CỬ";
  }, [debounced, activeCat, categories]);

  return (
    <div className="movie-browser">
      {/* TOP BAR: logo + search + actions */}
      <HeaderBar
        query={query}
        onQueryChange={setQuery}
        onLogin={() => console.log("go login")}
        onRegister={() => console.log("go register")}
        onBookmark={() => console.log("open bookmarks")}
      />
      {/* NAV bên dưới (TRANG CHỦ, THỂ LOẠI, ...) */}
      <header className="header">
        <div className="header-content">
          <nav className="nav-menu">
            <button
              className={`nav-item ${activeCat === null ? "active" : ""}`}
              onClick={() => setActiveCat(null)}
            >
              TRANG CHỦ
            </button>

            <div
              className="nav-dropdown"
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <button
                className="nav-item"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDropdownOpen((v) => !v);
                }}
              >
                THỂ LOẠI ▼
              </button>
              {dropdownOpen && (
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
                          setDropdownOpen(false);
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

            <button className="nav-item">QUỐC GIA</button>
            <button className="nav-item">PHIM CHIẾU RẠP</button>
            <button className="nav-item">PHIM BỘ</button>
            <button className="nav-item">PHIM LẺ</button>
          </nav>
        </div>
      </header>
      <main className="main-content">
        {error && <div className="error-message">{error}</div>}

        <div className="movie-section">
          <h2 className="section-title">{sectionTitle}</h2>

          {loadingMovies ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              Đang tải phim...
            </div>
          ) : movies.length ? (
            <div className="movies-grid">
              {movies.map((movie) => (
                <div key={movie.id} className="movie-card">
                  <div className="movie-poster">
                    <div className="quality-badge">{movie.quality || "HD"}</div>
                  </div>
                  <div className="movie-info">
                    <h4>{movie.name}</h4>
                    <p>{movie.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-results">
              {debounced?.trim()
                ? `Không tìm thấy phim nào với từ khóa "${debounced}"`
                : "Không có phim trong danh mục này"}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
