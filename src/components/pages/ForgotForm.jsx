import { useState } from "react";
import { styles } from "./authStyles";
import {
  requestReset,
  resetWithOtp as resetWithOtpApi,
} from "../../services/authService";

export default function ForgotForm({ goLogin }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function requestOtp(e) {
    e.preventDefault();
    setMsg("");
    if (!email.includes("@")) return setMsg("Email không hợp lệ.");
    try {
      setLoading(true);
      // service trả res.data
      const data = await requestReset(email);
      setMsg(data?.message || "Nếu email tồn tại, OTP đã được gửi.");
      setStep(2);
    } catch (ex) {
      setMsg(
        ex.response?.data?.message ||
          ex.response?.data?.title ||
          ex.message ||
          "Gửi OTP thất bại."
      );
    } finally {
      setLoading(false);
    }
  }

  async function resetWithOtp(e) {
    e.preventDefault();
    setMsg("");
    if (newPwd !== confirm) return setMsg("Mật khẩu và xác nhận không khớp.");
    if (!otp?.trim()) return setMsg("Vui lòng nhập mã OTP.");
    try {
      setLoading(true);
      const data = await resetWithOtpApi(email, otp, newPwd, confirm);
      setMsg(data?.message || "Đổi mật khẩu thành công. Vui lòng đăng nhập.");
    } catch (ex) {
      setMsg(
        ex.response?.data?.message ||
          ex.response?.data?.title ||
          ex.message ||
          "Đổi mật khẩu thất bại."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.form}>
      {msg && <div style={styles.info}>{msg}</div>}

      {step === 1 && (
        <form onSubmit={requestOtp} style={styles.formStack}>
          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <button disabled={loading} style={styles.primaryBtn} type="submit">
            {loading ? "Đang gửi..." : "Gửi OTP"}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={resetWithOtp} style={styles.formStack}>
          <div style={styles.noteBox}>
            Nhập OTP đã gửi tới email: <b>{email}</b>
          </div>

          <label style={styles.label}>Mã OTP</label>
          <input
            style={styles.input}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="6 số"
            required
          />

          <label style={styles.label}>Mật khẩu mới</label>
          <input
            style={styles.input}
            type="password"
            value={newPwd}
            onChange={(e) => setNewPwd(e.target.value)}
            placeholder="••••••••"
            required
          />

          <label style={styles.label}>Xác nhận mật khẩu mới</label>
          <input
            style={styles.input}
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
            required
          />

          <button disabled={loading} style={styles.primaryBtn} type="submit">
            {loading ? "Đang đặt lại..." : "Đổi mật khẩu"}
          </button>
        </form>
      )}

      <div style={styles.centeredRowTight}>
        <button type="button" onClick={goLogin} style={styles.linkBtn}>
          Quay về đăng nhập
        </button>
      </div>
    </div>
  );
}
