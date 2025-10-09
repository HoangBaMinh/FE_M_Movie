// import { useMemo, useState, useEffect } from "react";
// import useDebounce from "../hooks/useDebounce";
// import { useCategories } from "../hooks/useCategories";
// import { useMovies } from "../hooks/useMovies";
// import { useCountries } from "../hooks/useCountries";
// import HeaderBar from "../components/HeaderBar";
// import AuthModal from "./AuthModal";
// import { logout as logoutApi } from "../services/authService";
// import { getAccessToken } from "../api/http";
// import "../css/MovieBrowser.css";

// export default function MovieBrowser() {
//   const [activeCat, setActiveCat] = useState(null);
//   const [activeCountry, setActiveCountry] = useState(null);
//   const [query, setQuery] = useState("");

//   // Pagination state
//   const [currentPage, setCurrentPage] = useState(1);
//   const [pageSize] = useState(12);

//   const [catOpen, setCatOpen] = useState(false);
//   const [countryOpen, setCountryOpen] = useState(false);

//   // Auth modal state
//   const [showAuthModal, setShowAuthModal] = useState(false);

//   // Auth state - kiểm tra xem user có token không
//   const [isLoggedIn, setIsLoggedIn] = useState(false);

//   // Kiểm tra token khi component mount
//   useEffect(() => {
//     const token = getAccessToken();
//     setIsLoggedIn(!!token);
//   }, []);

//   const debounced = useDebounce(query, 300);

//   const {
//     data: categories,
//     loading: loadingCats,
//     error: catsError,
//   } = useCategories();

//   const {
//     data: countries,
//     loading: loadingCountries,
//     error: countriesError,
//   } = useCountries();

//   const moviesState = useMovies({
//     categoryId: activeCat,
//     countryId: activeCountry,
//     query: debounced,
//     pageNumber: currentPage,
//     pageSize: pageSize,
//     usePagination: true,
//   });

//   const {
//     data: movies,
//     loading: loadingMovies,
//     error: moviesError,
//     totalCount,
//     totalPages,
//     hasPreviousPage,
//     hasNextPage,
//   } = moviesState;

//   const error = catsError || moviesError || countriesError;

//   // Reset về trang 1 khi đổi filter
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [activeCat, activeCountry, debounced]);

//   useEffect(() => {
//     if (catOpen) setCountryOpen(false);
//   }, [catOpen]);

//   useEffect(() => {
//     if (countryOpen) setCatOpen(false);
//   }, [countryOpen]);

//   const sectionTitle = useMemo(() => {
//     if (debounced?.trim())
//       return `KẾT QUẢ TÌM KIẾM "${debounced.toUpperCase()}"`;
//     if (activeCat) {
//       const c = categories.find((x) => x.id === activeCat);
//       return c ? c.name.toUpperCase() : "DANH MỤC ĐƯỢC CHỌN";
//     }
//     if (activeCountry) {
//       const n = countries.find((x) => x.id === activeCountry);
//       return n ? `QUỐC GIA: ${n.name.toUpperCase()}` : "QUỐC GIA ĐƯỢC CHỌN";
//     }
//     return "PHIM ĐỀ CỬ";
//   }, [debounced, activeCat, activeCountry, categories, countries]);

//   const handlePageChange = (newPage) => {
//     if (newPage >= 1 && newPage <= totalPages) {
//       setCurrentPage(newPage);
//       window.scrollTo({ top: 0, behavior: "smooth" });
//     }
//   };

//   const getPageNumbers = () => {
//     const pages = [];
//     const maxVisible = 5;

//     if (totalPages <= maxVisible) {
//       for (let i = 1; i <= totalPages; i++) {
//         pages.push(i);
//       }
//     } else {
//       if (currentPage <= 3) {
//         pages.push(1, 2, 3, 4, "...", totalPages);
//       } else if (currentPage >= totalPages - 2) {
//         pages.push(
//           1,
//           "...",
//           totalPages - 3,
//           totalPages - 2,
//           totalPages - 1,
//           totalPages
//         );
//       } else {
//         pages.push(
//           1,
//           "...",
//           currentPage - 1,
//           currentPage,
//           currentPage + 1,
//           "...",
//           totalPages
//         );
//       }
//     }

//     return pages;
//   };

//   // Xử lý đăng nhập thành công
//   const handleLoginSuccess = () => {
//     setShowAuthModal(false);
//     setIsLoggedIn(true);
//   };

//   const handleCloseModal = () => {
//     setShowAuthModal(false);
//   };

//   // Xử lý đăng xuất
//   const handleLogout = async () => {
//     try {
//       await logoutApi();
//       setIsLoggedIn(false);
//       alert("Đăng xuất thành công!");
//     } catch (error) {
//       console.error("Logout error:", error);
//       // Vẫn logout ở client dù API fail
//       setIsLoggedIn(false);
//     }
//   };

//   return (
//     <div className="movie-browser">
//       <HeaderBar
//         query={query}
//         onQueryChange={setQuery}
//         onLogin={() => setShowAuthModal(true)}
//         onLogout={handleLogout}
//         onBookmark={() => console.log("open bookmarks")}
//         isLoggedIn={isLoggedIn}
//       />

//       <header className="header">
//         <div className="header-content">
//           <nav className="nav-menu">
//             <button
//               className={`nav-item ${
//                 activeCat === null && activeCountry === null && !debounced
//                   ? "active"
//                   : ""
//               }`}
//               onClick={() => {
//                 setActiveCat(null);
//                 setActiveCountry(null);
//               }}
//             >
//               TRANG CHỦ
//             </button>

//             {/* THỂ LOẠI */}
//             <div
//               className="nav-dropdown"
//               onMouseLeave={() => setCatOpen(false)}
//             >
//               <button
//                 className="nav-item"
//                 onClick={(e) => {
//                   e.preventDefault();
//                   e.stopPropagation();
//                   setCatOpen((v) => !v);
//                 }}
//               >
//                 THỂ LOẠI ▼
//               </button>
//               {catOpen && (
//                 <div className="dropdown-menu">
//                   {loadingCats ? (
//                     <div className="dropdown-item">Đang tải...</div>
//                   ) : (
//                     categories.map((c) => (
//                       <button
//                         key={c.id}
//                         onClick={(e) => {
//                           e.preventDefault();
//                           e.stopPropagation();
//                           setActiveCat(c.id);
//                           setCatOpen(false);
//                         }}
//                         className={`dropdown-item ${
//                           activeCat === c.id ? "active" : ""
//                         }`}
//                         title={c.description || ""}
//                       >
//                         {c.name}
//                       </button>
//                     ))
//                   )}
//                 </div>
//               )}
//             </div>

//             {/* QUỐC GIA */}
//             <div
//               className="nav-dropdown"
//               onMouseLeave={() => setCountryOpen(false)}
//             >
//               <button
//                 className="nav-item"
//                 onClick={(e) => {
//                   e.preventDefault();
//                   e.stopPropagation();
//                   setCountryOpen((v) => !v);
//                 }}
//               >
//                 QUỐC GIA ▼
//               </button>
//               {countryOpen && (
//                 <div className="dropdown-menu">
//                   {loadingCountries ? (
//                     <div className="dropdown-item">Đang tải...</div>
//                   ) : (
//                     countries.map((ct) => (
//                       <button
//                         key={ct.id}
//                         onClick={(e) => {
//                           e.preventDefault();
//                           e.stopPropagation();
//                           setActiveCountry(ct.id);
//                           setCountryOpen(false);
//                         }}
//                         className={`dropdown-item ${
//                           activeCountry === ct.id ? "active" : ""
//                         }`}
//                       >
//                         {ct.name}
//                       </button>
//                     ))
//                   )}
//                 </div>
//               )}
//             </div>

//             <button className="nav-item">PHIM CHIẾU RẠP</button>
//             <button className="nav-item">PHIM BỘ</button>
//             <button className="nav-item">PHIM LẺ</button>
//           </nav>
//         </div>
//       </header>

//       <main className="main-content">
//         {error && <div className="error-message">{String(error)}</div>}

//         <div className="movie-section">
//           <div className="section-header">
//             <h2 className="section-title">{sectionTitle}</h2>
//             {totalCount > 0 && (
//               <div className="result-info">
//                 Tìm thấy <strong>{totalCount}</strong> phim | Trang{" "}
//                 {currentPage}/{totalPages}
//               </div>
//             )}
//           </div>

//           {loadingMovies ? (
//             <div className="loading-container">
//               <div className="loading-spinner"></div>
//               Đang tải phim...
//             </div>
//           ) : movies.length ? (
//             <>
//               <div className="movies-grid">
//                 {movies.map((movie) => (
//                   <div key={movie.id} className="movie-card">
//                     <div className="movie-poster">
//                       <div className="quality-badge">
//                         {movie.quality || "HD"}
//                       </div>
//                     </div>
//                     <div className="movie-info">
//                       <h4>{movie.name}</h4>
//                       <p>{movie.description}</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* PAGINATION */}
//               {totalPages > 1 && (
//                 <div className="pagination">
//                   <button
//                     className="pagination-btn"
//                     onClick={() => handlePageChange(currentPage - 1)}
//                     disabled={!hasPreviousPage}
//                   >
//                     « Trước
//                   </button>

//                   {getPageNumbers().map((page, idx) => (
//                     <button
//                       key={idx}
//                       className={`pagination-btn ${
//                         page === currentPage ? "active" : ""
//                       } ${page === "..." ? "dots" : ""}`}
//                       onClick={() =>
//                         typeof page === "number" && handlePageChange(page)
//                       }
//                       disabled={page === "..."}
//                     >
//                       {page}
//                     </button>
//                   ))}

//                   <button
//                     className="pagination-btn"
//                     onClick={() => handlePageChange(currentPage + 1)}
//                     disabled={!hasNextPage}
//                   >
//                     Sau »
//                   </button>
//                 </div>
//               )}
//             </>
//           ) : (
//             <div className="no-results">
//               {debounced?.trim()
//                 ? `Không tìm thấy phim nào với từ khóa "${debounced}"`
//                 : activeCat || activeCountry
//                 ? "Không có phim cho bộ lọc hiện tại"
//                 : "Không có phim trong danh mục này"}
//             </div>
//           )}
//         </div>
//       </main>

//       {/* Auth Modal */}
//       {showAuthModal && (
//         <AuthModal
//           onClose={handleCloseModal}
//           onLoginSuccess={handleLoginSuccess}
//         />
//       )}
//     </div>
//   );
// }

// import { useMemo, useState, useEffect } from "react";
// import useDebounce from "../hooks/useDebounce";
// import { useCategories } from "../hooks/useCategories";
// import { useMovies } from "../hooks/useMovies";
// import { useCountries } from "../hooks/useCountries";
// import HeaderBar from "../components/HeaderBar";
// import AuthModal from "./AuthModal";
// import { logout as logoutApi } from "../services/authService";
// import { getAccessToken, logout as clearTokens } from "../api/http";
// import "../css/MovieBrowser.css";

// export default function MovieBrowser() {
//   const [activeCat, setActiveCat] = useState(null);
//   const [activeCountry, setActiveCountry] = useState(null);
//   const [query, setQuery] = useState("");

//   // Pagination state
//   const [currentPage, setCurrentPage] = useState(1);
//   const [pageSize] = useState(12);

//   const [catOpen, setCatOpen] = useState(false);
//   const [countryOpen, setCountryOpen] = useState(false);

//   // Auth modal state
//   const [showAuthModal, setShowAuthModal] = useState(false);
//   const [authModalView, setAuthModalView] = useState("login");

//   // Auth state - kiểm tra xem user có token không
//   const [isLoggedIn, setIsLoggedIn] = useState(false);

//   // Kiểm tra token khi component mount
//   useEffect(() => {
//     const token = getAccessToken();
//     setIsLoggedIn(!!token);
//   }, []);

//   const debounced = useDebounce(query, 300);

//   const {
//     data: categories,
//     loading: loadingCats,
//     error: catsError,
//   } = useCategories();

//   const {
//     data: countries,
//     loading: loadingCountries,
//     error: countriesError,
//   } = useCountries();

//   const moviesState = useMovies({
//     categoryId: activeCat,
//     countryId: activeCountry,
//     query: debounced,
//     pageNumber: currentPage,
//     pageSize: pageSize,
//     usePagination: true,
//   });

//   const {
//     data: movies,
//     loading: loadingMovies,
//     error: moviesError,
//     totalCount,
//     totalPages,
//     hasPreviousPage,
//     hasNextPage,
//   } = moviesState;

//   const error = catsError || moviesError || countriesError;

//   // Reset về trang 1 khi đổi filter
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [activeCat, activeCountry, debounced]);

//   useEffect(() => {
//     if (catOpen) setCountryOpen(false);
//   }, [catOpen]);

//   useEffect(() => {
//     if (countryOpen) setCatOpen(false);
//   }, [countryOpen]);

//   const sectionTitle = useMemo(() => {
//     if (debounced?.trim())
//       return `KẾT QUẢ TÌM KIẾM "${debounced.toUpperCase()}"`;
//     if (activeCat) {
//       const c = categories.find((x) => x.id === activeCat);
//       return c ? c.name.toUpperCase() : "DANH MỤC ĐƯỢC CHỌN";
//     }
//     if (activeCountry) {
//       const n = countries.find((x) => x.id === activeCountry);
//       return n ? `QUỐC GIA: ${n.name.toUpperCase()}` : "QUỐC GIA ĐƯỢC CHỌN";
//     }
//     return "PHIM ĐỀ CỬ";
//   }, [debounced, activeCat, activeCountry, categories, countries]);

//   const handlePageChange = (newPage) => {
//     if (newPage >= 1 && newPage <= totalPages) {
//       setCurrentPage(newPage);
//       window.scrollTo({ top: 0, behavior: "smooth" });
//     }
//   };

//   const getPageNumbers = () => {
//     const pages = [];
//     const maxVisible = 5;

//     if (totalPages <= maxVisible) {
//       for (let i = 1; i <= totalPages; i++) {
//         pages.push(i);
//       }
//     } else {
//       if (currentPage <= 3) {
//         pages.push(1, 2, 3, 4, "...", totalPages);
//       } else if (currentPage >= totalPages - 2) {
//         pages.push(
//           1,
//           "...",
//           totalPages - 3,
//           totalPages - 2,
//           totalPages - 1,
//           totalPages
//         );
//       } else {
//         pages.push(
//           1,
//           "...",
//           currentPage - 1,
//           currentPage,
//           currentPage + 1,
//           "...",
//           totalPages
//         );
//       }
//     }

//     return pages;
//   };

//   // Xử lý đăng nhập thành công
//   const handleLoginSuccess = () => {
//     setShowAuthModal(false);
//     setIsLoggedIn(true);
//   };

//   const handleCloseModal = () => {
//     setShowAuthModal(false);
//   };

//   // Xử lý đăng xuất
//   const handleLogout = async () => {
//     try {
//       await logoutApi();
//       clearTokens();
//       setIsLoggedIn(false);
//       alert("Đăng xuất thành công!");
//     } catch (error) {
//       console.error("Logout error:", error);
//       // Vẫn logout ở client dù API fail
//       clearTokens();
//       setIsLoggedIn(false);
//     }
//   };

//   // Xử lý mở modal đổi mật khẩu
//   const handleChangePassword = () => {
//     setAuthModalView("changePassword");
//     setShowAuthModal(true);
//   };

//   // Xử lý khi đổi mật khẩu thành công (đăng xuất user)
//   const handleChangePasswordSuccess = async () => {
//     setShowAuthModal(false);
//     clearTokens();
//     setIsLoggedIn(false);
//     alert("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");

//     // Reload trang để đảm bảo state được reset hoàn toàn
//     setTimeout(() => {
//       window.location.reload();
//     }, 2500);
//   };

//   // Xử lý mở modal đăng nhập
//   const handleOpenLogin = () => {
//     setAuthModalView("login");
//     setShowAuthModal(true);
//   };

//   return (
//     <div className="movie-browser">
//       <HeaderBar
//         query={query}
//         onQueryChange={setQuery}
//         onLogin={handleOpenLogin}
//         onLogout={handleLogout}
//         onChangePassword={handleChangePassword}
//         onBookmark={() => console.log("open bookmarks")}
//         isLoggedIn={isLoggedIn}
//       />

//       <header className="header">
//         <div className="header-content">
//           <nav className="nav-menu">
//             <button
//               className={`nav-item ${
//                 activeCat === null && activeCountry === null && !debounced
//                   ? "active"
//                   : ""
//               }`}
//               onClick={() => {
//                 setActiveCat(null);
//                 setActiveCountry(null);
//               }}
//             >
//               TRANG CHỦ
//             </button>

//             {/* THỂ LOẠI */}
//             <div
//               className="nav-dropdown"
//               onMouseLeave={() => setCatOpen(false)}
//             >
//               <button
//                 className="nav-item"
//                 onClick={(e) => {
//                   e.preventDefault();
//                   e.stopPropagation();
//                   setCatOpen((v) => !v);
//                 }}
//               >
//                 THỂ LOẠI ▼
//               </button>
//               {catOpen && (
//                 <div className="dropdown-menu">
//                   {loadingCats ? (
//                     <div className="dropdown-item">Đang tải...</div>
//                   ) : (
//                     categories.map((c) => (
//                       <button
//                         key={c.id}
//                         onClick={(e) => {
//                           e.preventDefault();
//                           e.stopPropagation();
//                           setActiveCat(c.id);
//                           setCatOpen(false);
//                         }}
//                         className={`dropdown-item ${
//                           activeCat === c.id ? "active" : ""
//                         }`}
//                         title={c.description || ""}
//                       >
//                         {c.name}
//                       </button>
//                     ))
//                   )}
//                 </div>
//               )}
//             </div>

//             {/* QUỐC GIA */}
//             <div
//               className="nav-dropdown"
//               onMouseLeave={() => setCountryOpen(false)}
//             >
//               <button
//                 className="nav-item"
//                 onClick={(e) => {
//                   e.preventDefault();
//                   e.stopPropagation();
//                   setCountryOpen((v) => !v);
//                 }}
//               >
//                 QUỐC GIA ▼
//               </button>
//               {countryOpen && (
//                 <div className="dropdown-menu">
//                   {loadingCountries ? (
//                     <div className="dropdown-item">Đang tải...</div>
//                   ) : (
//                     countries.map((ct) => (
//                       <button
//                         key={ct.id}
//                         onClick={(e) => {
//                           e.preventDefault();
//                           e.stopPropagation();
//                           setActiveCountry(ct.id);
//                           setCountryOpen(false);
//                         }}
//                         className={`dropdown-item ${
//                           activeCountry === ct.id ? "active" : ""
//                         }`}
//                       >
//                         {ct.name}
//                       </button>
//                     ))
//                   )}
//                 </div>
//               )}
//             </div>

//             <button className="nav-item">PHIM CHIẾU RẠP</button>
//             <button className="nav-item">PHIM BỘ</button>
//             <button className="nav-item">PHIM LẺ</button>
//           </nav>
//         </div>
//       </header>

//       <main className="main-content">
//         {error && <div className="error-message">{String(error)}</div>}

//         <div className="movie-section">
//           <div className="section-header">
//             <h2 className="section-title">{sectionTitle}</h2>
//             {totalCount > 0 && (
//               <div className="result-info">
//                 Tìm thấy <strong>{totalCount}</strong> phim | Trang{" "}
//                 {currentPage}/{totalPages}
//               </div>
//             )}
//           </div>

//           {loadingMovies ? (
//             <div className="loading-container">
//               <div className="loading-spinner"></div>
//               Đang tải phim...
//             </div>
//           ) : movies.length ? (
//             <>
//               <div className="movies-grid">
//                 {movies.map((movie) => (
//                   <div key={movie.id} className="movie-card">
//                     <div className="movie-poster">
//                       <div className="quality-badge">
//                         {movie.quality || "HD"}
//                       </div>
//                     </div>
//                     <div className="movie-info">
//                       <h4>{movie.name}</h4>
//                       <p>{movie.description}</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* PAGINATION */}
//               {totalPages > 1 && (
//                 <div className="pagination">
//                   <button
//                     className="pagination-btn"
//                     onClick={() => handlePageChange(currentPage - 1)}
//                     disabled={!hasPreviousPage}
//                   >
//                     « Trước
//                   </button>

//                   {getPageNumbers().map((page, idx) => (
//                     <button
//                       key={idx}
//                       className={`pagination-btn ${
//                         page === currentPage ? "active" : ""
//                       } ${page === "..." ? "dots" : ""}`}
//                       onClick={() =>
//                         typeof page === "number" && handlePageChange(page)
//                       }
//                       disabled={page === "..."}
//                     >
//                       {page}
//                     </button>
//                   ))}

//                   <button
//                     className="pagination-btn"
//                     onClick={() => handlePageChange(currentPage + 1)}
//                     disabled={!hasNextPage}
//                   >
//                     Sau »
//                   </button>
//                 </div>
//               )}
//             </>
//           ) : (
//             <div className="no-results">
//               {debounced?.trim()
//                 ? `Không tìm thấy phim nào với từ khóa "${debounced}"`
//                 : activeCat || activeCountry
//                 ? "Không có phim cho bộ lọc hiện tại"
//                 : "Không có phim trong danh mục này"}
//             </div>
//           )}
//         </div>
//       </main>

//       {/* Auth Modal */}
//       {showAuthModal && (
//         <AuthModal
//           onClose={handleCloseModal}
//           onLoginSuccess={
//             authModalView === "changePassword"
//               ? handleChangePasswordSuccess
//               : handleLoginSuccess
//           }
//           initialView={authModalView}
//         />
//       )}
//     </div>
//   );
// }

import { useMemo, useState, useEffect } from "react";
import useDebounce from "../hooks/useDebounce";
import { useCategories } from "../hooks/useCategories";
import { useMovies } from "../hooks/useMovies";
import { useCountries } from "../hooks/useCountries";
import HeaderBar from "../components/HeaderBar";
import AuthModal from "./AuthModal";
import { logout as logoutApi } from "../services/authService";
import { getAccessToken, logout as clearTokens } from "../api/http";
import "../css/MovieBrowser.css";

export default function MovieBrowser() {
  const [activeCat, setActiveCat] = useState(null);
  const [activeCountry, setActiveCountry] = useState(null);
  const [query, setQuery] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);

  const [catOpen, setCatOpen] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);

  // Auth modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalView, setAuthModalView] = useState("login");

  // Auth state - kiểm tra xem user có token không
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Kiểm tra token khi component mount
  useEffect(() => {
    const token = getAccessToken();
    setIsLoggedIn(!!token);
  }, []);

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
    usePagination: true,
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

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
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

  // Xử lý đăng nhập thành công
  const handleLoginSuccess = () => {
    setShowAuthModal(false);
    setIsLoggedIn(true);
  };

  const handleCloseModal = () => {
    setShowAuthModal(false);
  };

  // Hàm logout chung để tái sử dụng
  const performLogout = async (showAlert = true) => {
    try {
      await logoutApi();
      clearTokens();
      setIsLoggedIn(false);
      if (showAlert) {
        alert("Đăng xuất thành công!");
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Vẫn logout ở client dù API fail
      clearTokens();
      setIsLoggedIn(false);
    }
  };

  // Xử lý đăng xuất thông thường
  const handleLogout = async () => {
    await performLogout(true);
  };

  // Xử lý mở modal đổi mật khẩu
  const handleChangePassword = () => {
    setAuthModalView("changePassword");
    setShowAuthModal(true);
  };

  // Xử lý khi đổi mật khẩu thành công (tự động đăng xuất)
  const handleChangePasswordSuccess = async () => {
    setShowAuthModal(false);

    // Tự động đăng xuất
    await performLogout(false);

    alert(
      "Đổi mật khẩu thành công! Bạn đã được đăng xuất. Vui lòng đăng nhập lại."
    );

    // Reload để đảm bảo UI clean
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  // Xử lý mở modal đăng nhập
  const handleOpenLogin = () => {
    setAuthModalView("login");
    setShowAuthModal(true);
  };

  return (
    <div className="movie-browser">
      <HeaderBar
        query={query}
        onQueryChange={setQuery}
        onLogin={handleOpenLogin}
        onLogout={handleLogout}
        onChangePassword={handleChangePassword}
        onBookmark={() => console.log("open bookmarks")}
        isLoggedIn={isLoggedIn}
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

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={handleCloseModal}
          onLoginSuccess={
            authModalView === "changePassword"
              ? handleChangePasswordSuccess
              : handleLoginSuccess
          }
          initialView={authModalView}
        />
      )}
    </div>
  );
}
