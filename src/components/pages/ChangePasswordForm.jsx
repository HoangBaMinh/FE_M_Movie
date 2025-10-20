import { useState } from "react";
import { changePassword as changePasswordApi } from "../../services/authService";
import { styles } from "./authStyles";

export default function ChangePasswordForm({ goLogin, onSuccess }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const showMessage = (text) => {
    setMessage(text);
  };

  async function handleSubmit(event) {
    event.preventDefault();
    showMessage("");

    if (newPassword !== confirmPassword) {
      return showMessage("Mật khẩu mới và xác nhận không khớp.");
    }

    if (newPassword.length < 6) {
      return showMessage("Mật khẩu mới phải có ít nhất 6 ký tự.");
    }

    if (currentPassword === newPassword) {
      return showMessage("Mật khẩu mới phải khác mật khẩu hiện tại.");
    }

    try {
      setLoading(true);
      const data = await changePasswordApi(
        currentPassword,
        newPassword,
        confirmPassword
      );

      showMessage(
        data?.message || "Đổi mật khẩu thành công. Vui lòng đăng nhập lại."
      );

      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (error) {
      showMessage(
        error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Đổi mật khẩu thất bại."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.form}>
      {message && (
        <div
          style={{
            ...styles.info,
            backgroundColor: message.includes("thành công")
              ? "#dcfce7"
              : "#fee2e2",
            color: message.includes("thành công") ? "#166534" : "#991b1b",
          }}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8 }}>
        <label style={styles.label}>Mật khẩu hiện tại</label>
        <input
          style={styles.input}
          type="password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          placeholder="••••••••"
          required
        />

        <label style={styles.label}>Mật khẩu mới</label>
        <input
          style={styles.input}
          type="password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          placeholder="••••••••"
          required
        />

        <label style={styles.label}>Xác nhận mật khẩu mới</label>
        <input
          style={styles.input}
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="••••••••"
          required
        />

        <button disabled={loading} style={styles.primaryBtn} type="submit">
          {loading ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
        </button>
      </form>

      <div style={{ textAlign: "center", marginTop: 16 }}>
        <button type="button" onClick={goLogin} style={styles.linkBtn}>
          Hủy
        </button>
      </div>
    </div>
  );
}
