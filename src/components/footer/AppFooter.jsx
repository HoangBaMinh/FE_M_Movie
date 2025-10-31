import { Link } from "react-router-dom";
import "../../css/AppFooter.css";

const currentYear = new Date().getFullYear();

const quickLinks = [
  { label: "Trang chủ", to: "/" },
  { label: "Phim đang chiếu", to: "#now-showing" },
  { label: "Phim sắp chiếu", to: "#coming-soon" },
  { label: "Khuyến mãi", to: "#promotions" },
];

const supportLinks = [
  { label: "Liên hệ", href: "mailto:support@moviemate.vn" },
  { label: "Hướng dẫn đặt vé", href: "#booking-guide" },
  { label: "Điều khoản sử dụng", href: "#terms" },
  { label: "Chính sách bảo mật", href: "#privacy" },
];

const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M13.5 21v-7.5h2.5l.5-3h-3V8.25c0-.86.28-1.5 1.75-1.5H17V4.14C16.37 4.06 15.23 4 14.92 4c-2.66 0-4.42 1.62-4.42 4.59V10.5H8v3h2.5V21h3z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 3C4.24 3 3 4.24 3 7v10c0 2.76 1.24 4 4 4h10c2.76 0 4-1.24 4-4V7c0-2.76-1.24-4-4-4H7zm0 2h10c1.43 0 2 .57 2 2v10c0 1.43-.57 2-2 2H7c-1.43 0-2-.57-2-2V7c0-1.43.57-2 2-2zm10.25 1.5a1 1 0 100 2 1 1 0 000-2zM12 8a4 4 0 100 8 4 4 0 000-8zm0 2a2 2 0 110 4 2 2 0 010-4z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21.6 7.2c-.2-1.1-1.1-1.9-2.2-2-2-.2-5-.2-7.4-.2s-5.4 0-7.4.2c-1.1.1-2 1-2.2 2C2.2 8.9 2 10.8 2 12s.2 3.1.4 4.8c.2 1.1 1.1 1.9 2.2 2 2 .2 5 .2 7.4.2s5.4 0 7.4-.2c1.1-.1 2-1 2.2-2 .2-1.7.4-3.6.4-4.8s-.2-3.1-.4-4.8zM10 15.5v-7l6 3.5-6 3.5z" />
      </svg>
    ),
  },
];

export default function AppFooter() {
  return (
    <footer className="app-footer">
      <div className="footer-wave" aria-hidden="true" />
      <div className="footer-content">
        <section className="footer-column footer-brand">
          <h2 className="footer-title">MovieMate</h2>
          <p className="footer-tagline">
            Nơi kết nối bạn với những trải nghiệm điện ảnh đỉnh cao.
          </p>
          <div className="footer-contact">
            <a href="tel:+842812345678">Hotline: 0914433666</a>
            <a href="hoangbaminh889@gmail.com">hoangbaminh889@gmail.com</a>
          </div>
          <div className="footer-social" aria-label="Kênh mạng xã hội">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
              >
                {social.icon}
                <span className="sr-only">{social.label}</span>
              </a>
            ))}
          </div>
        </section>

        <section className="footer-column">
          <h3 className="footer-heading">Khám phá</h3>
          <ul className="footer-links">
            {quickLinks.map((link) => (
              <li key={link.label}>
                {link.to.startsWith("#") ? (
                  <a href={link.to}>{link.label}</a>
                ) : (
                  <Link to={link.to}>{link.label}</Link>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="footer-column">
          <h3 className="footer-heading">Hỗ trợ</h3>
          <ul className="footer-links">
            {supportLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </section>

        <section className="footer-column footer-newsletter">
          <h3 className="footer-heading">Nhận bản tin</h3>
          <p>
            Cập nhật sớm nhất các suất chiếu đặc biệt và ưu đãi dành riêng cho
            bạn.
          </p>
          <form className="newsletter-form">
            <label htmlFor="newsletter-email" className="sr-only">
              Địa chỉ email
            </label>
            <input
              id="newsletter-email"
              type="email"
              name="email"
              placeholder="Nhập email của bạn"
              required
            />
            <button type="submit">Đăng ký</button>
          </form>
        </section>
      </div>

      <div className="footer-bottom">
        <p>© {currentYear} MovieMate. Tất cả quyền được bảo lưu.</p>
        <p>
          Thiết kế bởi <span className="footer-highlight">MINHHB</span>
        </p>
      </div>
    </footer>
  );
}
