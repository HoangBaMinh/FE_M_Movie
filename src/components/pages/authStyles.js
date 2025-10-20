// src/components/pages/authStyles.js
export const styles = {
  // Khung form trung tâm, đẹp trên dark theme hiện tại
  form: {
    width: "100%",
    maxWidth: 420,
    margin: "32px auto",
    padding: 20,
    background: "#1f1f1f",
    border: "1px solid #2b2b2b",
    borderRadius: 12,
    display: "grid",
    gap: 10,
    boxShadow: "0 6px 24px rgba(0,0,0,0.25)",
  },

  // Label gọn, dễ đọc
  label: {
    fontSize: 14,
    color: "#cfcfcf",
    marginTop: 4,
  },

  // Ô input đồng nhất
  input: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #333",
    background: "#141414",
    color: "#eee",
    outline: "none",
    transition: "border-color .15s ease, box-shadow .15s ease",
  },

  // Nút chính (submit)
  primaryBtn: {
    marginTop: 8,
    padding: "10px 14px",
    border: "none",
    borderRadius: 10,
    backgroundColor: "#2563eb",
    backgroundImage:
      "linear-gradient(180deg, rgba(59,130,246,1) 0%, rgba(37,99,235,1) 100%)",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
    transition: "transform .06s ease, opacity .2s ease",
  },

  // Nút dạng link
  linkBtn: {
    background: "transparent",
    color: "#9ab4ff",
    border: "none",
    padding: 6,
    cursor: "pointer",
    textDecoration: "underline",
  },

  // Hàng chia 2 bên (Login page)
  rowBetween: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },

  // Hộp thông báo (success / error tùy bạn đổi màu)
  info: {
    padding: "8px 10px",
    borderRadius: 8,
    background: "#0f1a2a",
    color: "#b9d7ff",
    border: "1px solid #1f3a5c",
    marginBottom: 6,
    fontSize: 14,
  },

  infoSuccess: {
    padding: "8px 10px",
    borderRadius: 8,
    background: "#123524",
    color: "#bff2ce",
    border: "1px solid #1f7a4d",
    marginBottom: 6,
    fontSize: 14,
  },

  infoError: {
    padding: "8px 10px",
    borderRadius: 8,
    background: "#2a1111",
    color: "#ffb4b4",
    border: "1px solid #7a1f1f",
    marginBottom: 6,
    fontSize: 14,
  },

  formTitle: {
    margin: 0,
    textAlign: "center",
    color: "#fff",
  },

  formActions: {
    textAlign: "center",
    marginTop: 12,
  },

  centeredRow: {
    textAlign: "center",
  },

  centeredRowTight: {
    textAlign: "center",
    marginTop: 10,
  },

  formStack: {
    display: "grid",
    gap: 8,
  },

  // Hộp ghi chú (Forgot OTP)
  noteBox: {
    padding: "8px 10px",
    borderRadius: 8,
    background: "#1a1a1a",
    border: "1px dashed #3a3a3a",
    color: "#cfcfcf",
    fontSize: 14,
  },
};

/* ---------- Hover/focus/disabled tinh chỉnh ----------
  Vì đang dùng inline-style object nên không attach pseudo-class trực tiếp.
  Bạn có thể thêm một ít JS vào component:

  <input
    style={{
      ...styles.input,
      ...(isFocused ? { borderColor: "#6f8cff", boxShadow: "0 0 0 3px rgba(111,140,255,.15)" } : {})
    }}
    onFocus={() => setIsFocused(true)}
    onBlur={() => setIsFocused(false)}
  />

  Hoặc nếu muốn thuần CSS class, mình để sẵn bản CSS thuần bên dưới.
*/
