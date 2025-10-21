import { useState } from "react";

const STATIC_LINKS = ["PHIM SẮP CHIẾU", "TOP PHIM "];

export default function FilterBar({
  categories = [],
  countries = [],
  cinemas = [],
  activeCategory,
  activeCountry,
  activeCinema,
  hasActiveSearch,
  onSelectCategory,
  onSelectCountry,
  onSelectCinema,
  onReset,
  loadingCategories,
  loadingCountries,
  loadingCinemas,
}) {
  const [isCategoryOpen, setCategoryOpen] = useState(false);
  const [isCountryOpen, setCountryOpen] = useState(false);
  const [isCinemaOpen, setCinemaOpen] = useState(false);

  const toggleCategory = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setCategoryOpen((value) => !value);
    setCountryOpen(false);
    setCinemaOpen(false);
  };

  const toggleCountry = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setCountryOpen((value) => !value);
    setCategoryOpen(false);
    setCinemaOpen(false);
  };

  const toggleCinema = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setCinemaOpen((value) => !value);
    setCountryOpen(false);
    setCategoryOpen(false);
  };

  const closeMenus = () => {
    setCategoryOpen(false);
    setCountryOpen(false);
    setCinemaOpen(false);
  };

  return (
    <header className="header">
      <div className="header-content">
        <nav className="nav-menu">
          <button
            type="button"
            className={`nav-item ${
              !hasActiveSearch &&
              activeCategory === null &&
              activeCountry === null &&
              activeCinema === null
                ? "active"
                : ""
            }`}
            onClick={() => {
              closeMenus();
              onReset?.();
            }}
          >
            TRANG CHỦ
          </button>

          <div className="nav-dropdown" onMouseLeave={closeMenus}>
            <button type="button" className="nav-item" onClick={toggleCinema}>
              RẠP CHIẾU ▼
            </button>
            {isCinemaOpen && (
              <div className="dropdown-menu">
                {loadingCinemas ? (
                  <div className="dropdown-item">Đang tải...</div>
                ) : (
                  cinemas.map((cinema) => (
                    <button
                      key={cinema.id}
                      type="button"
                      className={`dropdown-item ${
                        activeCinema === cinema.id ? "active" : ""
                      }`}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setCinemaOpen(false);
                        onSelectCinema?.(cinema.id);
                      }}
                      title={cinema.description || ""}
                    >
                      {cinema.name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {STATIC_LINKS.map((label) => (
            <button key={label} type="button" className="nav-item">
              {label}
            </button>
          ))}

          <div className="nav-dropdown" onMouseLeave={closeMenus}>
            <button type="button" className="nav-item" onClick={toggleCategory}>
              THỂ LOẠI ▼
            </button>
            {isCategoryOpen && (
              <div className="dropdown-menu">
                {loadingCategories ? (
                  <div className="dropdown-item">Đang tải...</div>
                ) : (
                  categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      className={`dropdown-item ${
                        activeCategory === category.id ? "active" : ""
                      }`}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setCategoryOpen(false);
                        onSelectCategory?.(category.id);
                      }}
                      title={category.description || ""}
                    >
                      {category.name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="nav-dropdown" onMouseLeave={closeMenus}>
            <button type="button" className="nav-item" onClick={toggleCountry}>
              QUỐC GIA ▼
            </button>
            {isCountryOpen && (
              <div className="dropdown-menu">
                {loadingCountries ? (
                  <div className="dropdown-item">Đang tải...</div>
                ) : (
                  countries.map((country) => (
                    <button
                      key={country.id}
                      type="button"
                      className={`dropdown-item ${
                        activeCountry === country.id ? "active" : ""
                      }`}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setCountryOpen(false);
                        onSelectCountry?.(country.id);
                      }}
                    >
                      {country.name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
