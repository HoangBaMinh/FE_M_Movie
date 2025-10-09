import { useState } from "react";
import { styles } from "./authStyles";
import { register as registerAccount } from "../../services/authService";

export default function RegisterForm({ goLogin }) {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");

    if (pwd !== confirm) return setMsg("Mật khẩu và xác nhận không khớp.");
    if (!email.includes("@")) return setMsg("Email không hợp lệ.");

    try {
      setLoading(true);
      // authService.register trả về res.data
      const data = await registerAccount(email, pwd, confirm);
      setMsg(data?.message || "Đăng ký thành công!");
    } catch (ex) {
      setMsg(
        ex.response?.data?.message ||
          ex.response?.data?.title ||
          ex.message ||
          "Đăng ký thất bại."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={styles.form}>
      {msg && <div style={styles.info}>{msg}</div>}

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

      <label style={styles.label}>Xác nhận mật khẩu</label>
      <input
        style={styles.input}
        type="password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder="••••••••"
        required
      />

      <button
        disabled={loading || !email || !pwd || pwd !== confirm}
        style={styles.primaryBtn}
        type="submit"
      >
        {loading ? "Đang đăng ký..." : "Tạo tài khoản"}
      </button>

      <div style={{ textAlign: "center" }}>
        <button type="button" onClick={goLogin} style={styles.linkBtn}>
          Đã có tài khoản? Đăng nhập
        </button>
      </div>
    </form>
  );
}
