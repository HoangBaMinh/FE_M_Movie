import { useEffect, useMemo } from "react";
import "../../css/OrdersModal.css";

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "medium",
  timeStyle: "short",
});

function getValueAtPath(obj, path) {
  if (!obj || !path) return undefined;
  const segments = path.split(".");
  let current = obj;

  for (const segment of segments) {
    if (current == null) return undefined;

    if (Object.prototype.hasOwnProperty.call(current, segment)) {
      current = current[segment];
      continue;
    }

    const lowerEntries = Object.keys(current).reduce((acc, key) => {
      acc[key.toLowerCase()] = key;
      return acc;
    }, {});
    const mapped = lowerEntries[segment.toLowerCase()];
    if (mapped) {
      current = current[mapped];
    } else {
      return undefined;
    }
  }

  return current;
}

function pickField(order, paths) {
  for (const path of paths) {
    const value = getValueAtPath(order, path);
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }
  return null;
}

function pickArray(order, paths) {
  for (const path of paths) {
    const value = getValueAtPath(order, path);
    if (Array.isArray(value) && value.length) return value;
  }
  for (const path of paths) {
    const value = getValueAtPath(order, path);
    if (Array.isArray(value)) return value;
  }
  return [];
}

function formatCurrency(value) {
  if (value === undefined || value === null || value === "") return "";

  const raw =
    typeof value === "string"
      ? value
          .replace(/[^0-9.,-]/g, "")
          .replace(/(,)(?=.*,)/g, "")
          .replace(/\.(?=.*\.)/g, "")
      : value;

  const number = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(number)) return String(value);

  try {
    return currencyFormatter.format(number);
  } catch (error) {
    console.warn("formatCurrency error", error);
    return String(value);
  }
}

function formatDate(value) {
  if (!value && value !== 0) return "";

  let date;
  if (value instanceof Date) {
    date = value;
  } else if (typeof value === "number") {
    date = new Date(value > 1e12 ? value : value * 1000);
  } else {
    const numeric = Number(value);
    if (Number.isFinite(numeric) && numeric > 0) {
      date = new Date(numeric > 1e12 ? numeric : numeric * 1000);
    } else {
      date = new Date(value);
    }
  }

  if (!date || Number.isNaN(date.getTime())) {
    return String(value);
  }

  try {
    return dateFormatter.format(date);
  } catch (error) {
    console.warn("formatDate error", error);
    return date.toLocaleString("vi-VN");
  }
}

function normalizeStatus(status) {
  if (!status) return "";
  const text = String(status).trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function getStatusVariant(status) {
  if (!status) return "neutral";
  const normalized = String(status).toLowerCase();
  if (
    normalized.includes("success") ||
    normalized.includes("paid") ||
    normalized.includes("hoàn") ||
    normalized.includes("thanh") ||
    normalized.includes("completed") ||
    normalized.includes("đã thanh toán")
  ) {
    return "success";
  }

  if (
    normalized.includes("pending") ||
    normalized.includes("chờ") ||
    normalized.includes("processing") ||
    normalized.includes("đang")
  ) {
    return "pending";
  }

  if (
    normalized.includes("cancel") ||
    normalized.includes("failed") ||
    normalized.includes("hủy") ||
    normalized.includes("refuse") ||
    normalized.includes("error") ||
    normalized.includes("reject")
  ) {
    return "danger";
  }

  return "neutral";
}

function OrderItem({ item, index, fallbackRoom }) {
  const seat = pickField(item, ["seatLabel"]);
  const ticketType = pickField(item, ["tier"]);
  const price = pickField(item, ["price", "amount", "total", "cost", "value"]);
  const room = pickField(item, ["roomName"]) ?? fallbackRoom;

  return (
    <li className="ordersModal__item">
      <div className="ordersModal__itemMain">
        <span className="ordersModal__itemSeat">
          {seat || ticketType || `Vé ${index + 1}`}
        </span>
        {ticketType && seat && (
          <span className="ordersModal__itemType">{ticketType}</span>
        )}
      </div>
      <div className="ordersModal__itemMeta">
        {room && <span className="ordersModal__itemTag">Phòng: {room}</span>}
        {price !== null && price !== undefined && price !== "" && (
          <span className="ordersModal__itemPrice">
            {formatCurrency(price) || String(price)}
          </span>
        )}
      </div>
    </li>
  );
}

function OrderCard({ order, index }) {
  const orderId =
    pickField(order, ["orderCode", "orderId"]) || `Đơn hàng #${index + 1}`;
  const status = pickField(order, ["status"]);
  const total = pickField(order, ["totalAmount"]);
  const createdAt = pickField(order, ["createdAt"]);
  const movie = pickField(order, ["movieName"]);
  const cinema = pickField(order, ["cinemaName"]);
  const room = pickField(order, ["roomName"]);
  const showTime = pickField(order, ["showTimeStart"]);
  const paymentMethod = pickField(order, ["paymentType"]);
  const quantity = pickField(order, ["quantity"]);
  const buyer = pickField(order, ["userName"]);
  const email = pickField(order, ["userEmail"]);
  const phone = pickField(order, ["phoneNumber"]);

  const items = pickArray(order, ["tickets"]);

  const computedQuantity =
    quantity ?? (Array.isArray(items) ? items.length : undefined);

  return (
    <article className="ordersModal__order">
      <header className="ordersModal__orderHeader">
        <div>
          <h3 className="ordersModal__orderId">{orderId}</h3>
          {createdAt && (
            <p className="ordersModal__orderDate">{formatDate(createdAt)}</p>
          )}
        </div>
        {status && (
          <span
            className={`ordersModal__status ordersModal__status--${getStatusVariant(
              status
            )}`}
          >
            {normalizeStatus(status)}
          </span>
        )}
      </header>

      <dl className="ordersModal__meta">
        <div>
          <dt>Số lượng vé</dt>
          <dd>{computedQuantity ?? "—"}</dd>
        </div>
        {movie && (
          <div>
            <dt>Phim</dt>
            <dd>{movie}</dd>
          </div>
        )}
        {cinema && (
          <div>
            <dt>Rạp</dt>
            <dd>{cinema}</dd>
          </div>
        )}
        {showTime && (
          <div>
            <dt>Suất chiếu</dt>
            <dd>{formatDate(showTime) || String(showTime)}</dd>
          </div>
        )}
        {paymentMethod && (
          <div>
            <dt>Phương thức</dt>
            <dd>
              <dd>{normalizeStatus(paymentMethod) ?? "VNPay"}</dd>
            </dd>
          </div>
        )}
        {buyer && (
          <div>
            <dt>Người mua</dt>
            <dd>{buyer}</dd>
          </div>
        )}
        {email && (
          <div>
            <dt>Email</dt>
            <dd>{email}</dd>
          </div>
        )}
        {phone && (
          <div>
            <dt>Điện thoại</dt>
            <dd>{phone}</dd>
          </div>
        )}
        <div>
          <dt>Tổng tiền</dt>
          <dd>{formatCurrency(total) || (total ? String(total) : "—")}</dd>
        </div>
      </dl>

      {Array.isArray(items) && items.length > 0 && (
        <section className="ordersModal__itemSection">
          <h4>Vé đã đặt</h4>
          <ul className="ordersModal__itemList">
            {items.map((item, idx) => (
              <OrderItem
                key={idx}
                item={item}
                index={idx}
                fallbackRoom={room}
              />
            ))}
          </ul>
        </section>
      )}

      {/* <details className="ordersModal__details">
        <summary>Chi tiết JSON</summary>
        <pre className="ordersModal__json">
          {JSON.stringify(order, null, 2)}
        </pre>
      </details> */}
    </article>
  );
}

export default function OrdersModal({
  onClose,
  onReload,
  orders = [],
  loading = false,
  error = "",
  isLoggedIn = false,
}) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const hasOrders = Array.isArray(orders) && orders.length > 0;

  const infoMessage = useMemo(() => {
    if (!isLoggedIn) {
      return "Vui lòng đăng nhập để xem thông tin đơn hàng.";
    }
    if (loading) {
      return "Đang tải dữ liệu đơn hàng...";
    }
    if (error) {
      return error;
    }
    if (!hasOrders) {
      return "Bạn chưa có đơn hàng nào được ghi nhận.";
    }
    return "";
  }, [isLoggedIn, loading, error, hasOrders]);

  return (
    <div className="ordersModal__backdrop" onClick={onClose}>
      <div
        className="ordersModal__panel"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="ordersModal__header">
          <div>
            <h2 className="ordersModal__title">Đơn hàng của bạn</h2>
            <p className="ordersModal__subtitle">
              Thông tin chi tiết về các đơn hàng của bạn sẽ hiển thị tại đây.
            </p>
          </div>
          <div className="ordersModal__headerActions">
            {onReload && (
              <button
                type="button"
                className="ordersModal__iconBtn ordersModal__iconBtn--ghost"
                onClick={onReload}
                disabled={loading}
              >
                {loading ? "Đang tải..." : "Tải lại"}
              </button>
            )}
            <button
              type="button"
              className="ordersModal__iconBtn ordersModal__iconBtn--primary"
              onClick={onClose}
            >
              Đóng
            </button>
          </div>
        </header>

        <div className="ordersModal__content">
          {infoMessage && (
            <div
              className={`ordersModal__info ${
                error ? "ordersModal__info--error" : ""
              }`}
            >
              {infoMessage}
            </div>
          )}

          {hasOrders && !loading && !error && (
            <div className="ordersModal__list">
              {orders.map((order, index) => (
                <OrderCard key={index} order={order} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
