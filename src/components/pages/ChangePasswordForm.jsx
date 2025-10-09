// import { useState } from "react";
// import { styles } from "./authStyles";
// import { changePassword as changePasswordApi } from "../../services/authService";

// export default function ChangePasswordForm({ goLogin }) {
//   const [currentPassword, setCurrentPassword] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [msg, setMsg] = useState("");
//   const [loading, setLoading] = useState(false);

//   async function handleSubmit(e) {
//     e.preventDefault();
//     setMsg("");

//     if (newPassword !== confirmPassword) {
//       return setMsg("Mật khẩu mới và xác nhận không khớp.");
//     }

//     if (newPassword.length < 6) {
//       return setMsg("Mật khẩu mới phải có ít nhất 6 ký tự.");
//     }

//     if (currentPassword === newPassword) {
//       return setMsg("Mật khẩu mới phải khác mật khẩu hiện tại.");
//     }

//     try {
//       setLoading(true);
//       const data = await changePasswordApi(
//         currentPassword,
//         newPassword,
//         confirmPassword
//       );
//       setMsg(
//         data?.message || "Đổi mật khẩu thành công. Vui lòng đăng nhập lại."
//       );

//       // Chuyển về trang đăng nhập sau 2 giây
//       setTimeout(() => {
//         goLogin?.();
//       }, 2000);
//     } catch (ex) {
//       setMsg(
//         ex.response?.data?.error ||
//           ex.response?.data?.message ||
//           ex.message ||
//           "Đổi mật khẩu thất bại."
//       );
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div style={styles.form}>
//       <h2 style={styles.title}>Đổi mật khẩu</h2>

//       {msg && (
//         <div
//           style={{
//             ...styles.info,
//             backgroundColor: msg.includes("thành công") ? "#dcfce7" : "#fee2e2",
//             color: msg.includes("thành công") ? "#166534" : "#991b1b",
//           }}
//         >
//           {msg}
//         </div>
//       )}

//       <div style={{ display: "grid", gap: 8 }}>
//         <label style={styles.label}>Mật khẩu hiện tại</label>
//         <input
//           style={styles.input}
//           type="password"
//           value={currentPassword}
//           onChange={(e) => setCurrentPassword(e.target.value)}
//           placeholder="••••••••"
//           required
//         />

//         <label style={styles.label}>Mật khẩu mới</label>
//         <input
//           style={styles.input}
//           type="password"
//           value={newPassword}
//           onChange={(e) => setNewPassword(e.target.value)}
//           placeholder="••••••••"
//           required
//         />

//         <label style={styles.label}>Xác nhận mật khẩu mới</label>
//         <input
//           style={styles.input}
//           type="password"
//           value={confirmPassword}
//           onChange={(e) => setConfirmPassword(e.target.value)}
//           placeholder="••••••••"
//           required
//         />

//         <button
//           disabled={loading}
//           style={styles.primaryBtn}
//           onClick={handleSubmit}
//         >
//           {loading ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
//         </button>
//       </div>

//       <div style={{ textAlign: "center", marginTop: 16 }}>
//         <button type="button" onClick={goLogin} style={styles.linkBtn}>
//           Quay về đăng nhập
//         </button>
//       </div>
//     </div>
//   );
// }

import { useState } from "react";
import { changePassword as changePasswordApi } from "../../services/authService";

// Inline styles (hoặc import từ file styles của bạn)
const styles = {
  form: {
    padding: "24px",
    maxWidth: "400px",
    margin: "0 auto",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "16px",
    textAlign: "center",
  },
  label: {
    fontSize: "14px",
    fontWeight: "500",
    marginTop: "12px",
    marginBottom: "4px",
  },
  input: {
    width: "100%",
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
  },
  primaryBtn: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#e50914",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "16px",
  },
  linkBtn: {
    background: "none",
    border: "none",
    color: "#0066cc",
    textDecoration: "underline",
    cursor: "pointer",
    fontSize: "14px",
  },
  info: {
    padding: "12px",
    borderRadius: "4px",
    marginBottom: "16px",
    fontSize: "14px",
  },
};

export default function ChangePasswordForm({ goLogin, onSuccess }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");

    if (newPassword !== confirmPassword) {
      return setMsg("Mật khẩu mới và xác nhận không khớp.");
    }

    if (newPassword.length < 3) {
      return setMsg("Mật khẩu mới phải có ít nhất 6 ký tự.");
    }

    if (currentPassword === newPassword) {
      return setMsg("Mật khẩu mới phải khác mật khẩu hiện tại.");
    }

    try {
      setLoading(true);
      const data = await changePasswordApi(
        currentPassword,
        newPassword,
        confirmPassword
      );
      setMsg(
        data?.message || "Đổi mật khẩu thành công. Vui lòng đăng nhập lại."
      );

      // Chuyển về trang đăng nhập sau 2 giây
      setTimeout(() => {
        onSuccess?.(); // Notify parent to handle logout
      }, 2000);
    } catch (ex) {
      setMsg(
        ex.response?.data?.error ||
          ex.response?.data?.message ||
          ex.message ||
          "Đổi mật khẩu thất bại."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.form}>
      <h2 style={styles.title}>Đổi mật khẩu</h2>

      {msg && (
        <div
          style={{
            ...styles.info,
            backgroundColor: msg.includes("thành công") ? "#dcfce7" : "#fee2e2",
            color: msg.includes("thành công") ? "#166534" : "#991b1b",
          }}
        >
          {msg}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8 }}>
        <label style={styles.label}>Mật khẩu hiện tại</label>
        <input
          style={styles.input}
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="••••••••"
          required
        />

        <label style={styles.label}>Mật khẩu mới</label>
        <input
          style={styles.input}
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="••••••••"
          required
        />

        <label style={styles.label}>Xác nhận mật khẩu mới</label>
        <input
          style={styles.input}
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          required
        />

        <button type="submit" disabled={loading} style={styles.primaryBtn}>
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
