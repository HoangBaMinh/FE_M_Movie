// import { useEffect, useCallback, useState } from "react";
// import LoginForm from "./pages/LoginForm";
// import RegisterForm from "./pages/RegisterForm";
// import ForgotForm from "./pages/ForgotForm";
// import "../css/AuthModal.css";

// export default function AuthModal({ onClose, onLoginSuccess }) {
//   const [view, setView] = useState("login"); // "login" | "register" | "forgot"

//   // Hàm đóng modal (không báo hiệu login thành công)
//   const handleClose = useCallback(() => {
//     onClose?.();
//   }, [onClose]);

//   // Hàm xử lý khi login thành công
//   const handleLoginSuccess = useCallback(() => {
//     onLoginSuccess?.();
//   }, [onLoginSuccess]);

//   // đóng bằng phím ESC
//   const onKey = useCallback(
//     (e) => {
//       if (e.key === "Escape") {
//         handleClose();
//       }
//     },
//     [handleClose]
//   );

//   useEffect(() => {
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [onKey]);

//   return (
//     <div className="authModal__backdrop" onClick={handleClose}>
//       <div className="authModal__panel" onClick={(e) => e.stopPropagation()}>
//         <button
//           className="authModal__close"
//           onClick={handleClose}
//           aria-label="Đóng"
//         >
//           ✕
//         </button>

//         {view === "login" && (
//           <LoginForm
//             onDone={handleLoginSuccess}
//             goRegister={() => setView("register")}
//             goForgot={() => setView("forgot")}
//           />
//         )}

//         {view === "register" && (
//           <RegisterForm goLogin={() => setView("login")} />
//         )}

//         {view === "forgot" && <ForgotForm goLogin={() => setView("login")} />}
//       </div>
//     </div>
//   );
// }

import { useEffect, useCallback, useState } from "react";
import LoginForm from "./pages/LoginForm";
import RegisterForm from "./pages/RegisterForm";
import ForgotForm from "./pages/ForgotForm";
import ChangePasswordForm from "./pages/ChangePasswordForm";
import "../css/AuthModal.css";

export default function AuthModal({
  onClose,
  onLoginSuccess,
  initialView = "login",
}) {
  const [view, setView] = useState(initialView); // "login" | "register" | "forgot" | "changePassword"

  // Hàm đóng modal (không báo hiệu login thành công)
  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  // Hàm xử lý khi login thành công
  const handleLoginSuccess = useCallback(() => {
    onLoginSuccess?.();
  }, [onLoginSuccess]);

  // Hàm xử lý khi đổi mật khẩu thành công (đăng xuất user)
  const handleChangePasswordSuccess = useCallback(() => {
    // Đổi mật khẩu thành công -> đăng xuất và chuyển về login
    handleClose();
  }, [handleClose]);

  // đóng bằng phím ESC
  const onKey = useCallback(
    (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    },
    [handleClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onKey]);

  return (
    <div className="authModal__backdrop" onClick={handleClose}>
      <div className="authModal__panel" onClick={(e) => e.stopPropagation()}>
        <button
          className="authModal__close"
          onClick={handleClose}
          aria-label="Đóng"
        >
          ✕
        </button>

        {view === "login" && (
          <LoginForm
            onDone={handleLoginSuccess}
            goRegister={() => setView("register")}
            goForgot={() => setView("forgot")}
          />
        )}

        {view === "register" && (
          <RegisterForm goLogin={() => setView("login")} />
        )}

        {view === "forgot" && <ForgotForm goLogin={() => setView("login")} />}

        {view === "changePassword" && (
          <ChangePasswordForm
            goLogin={() => setView("login")}
            onSuccess={handleChangePasswordSuccess}
          />
        )}
      </div>
    </div>
  );
}
