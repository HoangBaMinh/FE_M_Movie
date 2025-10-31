import "../../css/PaymentStatusBanner.css";

const STATUS_ICONS = {
  success: "✔",
  error: "✖",
  info: "ℹ",
};

export default function PaymentStatusBanner({
  status = "info",
  message = "",
  onClose,
}) {
  if (!message) {
    return null;
  }

  const icon = STATUS_ICONS[status] || STATUS_ICONS.info;

  return (
    <div
      className={`payment-banner payment-banner--${status}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="payment-banner__content">
        <span className="payment-banner__icon" aria-hidden="true">
          {icon}
        </span>
        <span className="payment-banner__message">{message}</span>
      </div>
      <button
        type="button"
        className="payment-banner__close"
        onClick={onClose}
        aria-label="Đóng thông báo"
      >
        ×
      </button>
    </div>
  );
}
