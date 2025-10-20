import { useState } from "react";
import { styles } from "./authStyles";
import { login } from "../../services/authService";

export default function LoginForm({ onDone, goRegister, goForgot }) {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function pickErrorMessage(ex) {
    if (!ex.response)
      return "Không kết nối được máy chủ. Kiểm tra URL/CORS/HTTPS.";

    const { status, data } = ex.response;

    if (status === 400 || status === 401) {
      const msg =
        data?.detail ||
        data?.message ||
        data?.title ||
        (Array.isArray(data?.errors) ? data.errors.join("; ") : null) ||
        (data?.errors ? Object.values(data.errors).flat().join("; ") : null);

      return msg || "Email hoặc mật khẩu không đúng.";
    }

    const generic = data?.detail || data?.message || data?.title || ex.message;
    return generic || `Lỗi ${status}.`;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");
    setError("");

    try {
      setLoading(true);

      // authService.login() đã tự set token (access/refresh) trong http.js
      const data = await login(email, pwd);

      setMsg("Đăng nhập thành công!");
      setTimeout(() => onDone?.(data), 400);
    } catch (ex) {
      console.log("AXIOS ERROR >>>", ex?.code, ex?.message, ex?.response);
      setError(pickErrorMessage(ex));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={styles.form}>
      {msg && <div style={styles.info}>{msg}</div>}
      {error && <div style={styles.infoError}>{error}</div>}

      <label style={styles.label}>Email</label>
      <input
        style={styles.input}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
      />

      <label style={styles.label}>Mật khẩu</label>
      <input
        style={styles.input}
        type="password"
        value={pwd}
        onChange={(e) => setPwd(e.target.value)}
        placeholder="••••••••"
        required
      />

      <button disabled={loading} style={styles.primaryBtn} type="submit">
        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>

      <div style={styles.rowBetween}>
        <button type="button" onClick={goRegister} style={styles.linkBtn}>
          Tạo tài khoản
        </button>
        <button type="button" onClick={goForgot} style={styles.linkBtn}>
          Quên mật khẩu?
        </button>
      </div>
    </form>
  );
}
