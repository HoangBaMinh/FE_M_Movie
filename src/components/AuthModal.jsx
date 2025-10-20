import { useCallback, useEffect, useState } from "react";
import LoginForm from "./pages/LoginForm";
import RegisterForm from "./pages/RegisterForm";
import ForgotForm from "./pages/ForgotForm";
import ChangePasswordForm from "./pages/ChangePasswordForm";
import "../css/AuthModal.css";

const VIEWS = {
  LOGIN: "login",
  REGISTER: "register",
  FORGOT: "forgot",
  CHANGE_PASSWORD: "changePassword",
};

export default function AuthModal({
  onClose,
  onLoginSuccess,
  onChangePasswordSuccess,
  initialView = VIEWS.LOGIN,
}) {
  const [view, setView] = useState(initialView);

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const handleLoginSuccess = useCallback(() => {
    onLoginSuccess?.();
  }, [onLoginSuccess]);

  const handleChangePasswordSuccess = useCallback(() => {
    onChangePasswordSuccess?.();
    handleClose();
  }, [onChangePasswordSuccess, handleClose]);

  const onKeyDown = useCallback(
    (event) => {
      if (event.key === "Escape") {
        handleClose();
      }
    },
    [handleClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  return (
    <div className="authModal__backdrop" onClick={handleClose}>
      <div
        className="authModal__panel"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="authModal__close"
          onClick={handleClose}
          aria-label="Đóng"
        >
          ✕
        </button>

        {view === VIEWS.LOGIN && (
          <LoginForm
            onDone={handleLoginSuccess}
            goRegister={() => setView(VIEWS.REGISTER)}
            goForgot={() => setView(VIEWS.FORGOT)}
          />
        )}

        {view === VIEWS.REGISTER && (
          <RegisterForm goLogin={() => setView(VIEWS.LOGIN)} />
        )}

        {view === VIEWS.FORGOT && (
          <ForgotForm goLogin={() => setView(VIEWS.LOGIN)} />
        )}

        {view === VIEWS.CHANGE_PASSWORD && (
          <ChangePasswordForm
            goLogin={() => setView(VIEWS.LOGIN)}
            onSuccess={handleChangePasswordSuccess}
          />
        )}
      </div>
    </div>
  );
}
