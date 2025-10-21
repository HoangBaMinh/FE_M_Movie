import logo from "../assets/Images/Logo/Logo_M_Movie.png";
import "../css/HeaderBar.css";

export default function HeaderBar({
  query,
  onQueryChange,
  onLogin,
  onLogout,
  onChangePassword,
  onBookmark,
  isLoggedIn,
}) {
  return (
    <div className="topbar">
      <a className="topbar__brand" href="/">
        <img src={logo} alt="M-Movie" className="topbar__logo" />
      </a>

      <div className="topbar__search">
        <input
          type="text"
          placeholder="Nhập tên phim bạn muốn tìm kiếm..."
          value={query}
          onChange={(e) => onQueryChange?.(e.target.value)}
        />
        <button className="topbar__searchBtn" aria-label="Tìm kiếm">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79L20 21.5 21.5 20l-6-6zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
        </button>
      </div>

      <div className="topbar__actions">
        {isLoggedIn ? (
          <>
            <button className="topbar__link" onClick={onChangePassword}>
              Đổi mật khẩu
            </button>
            <button className="topbar__link" onClick={onLogout}>
              Đăng xuất
            </button>
          </>
        ) : (
          <button className="topbar__link" onClick={onLogin}>
            Đăng nhập
          </button>
        )}

        <button className="topbar__link" onClick={onBookmark}>
          Bookmark
        </button>
      </div>
    </div>
  );
}
