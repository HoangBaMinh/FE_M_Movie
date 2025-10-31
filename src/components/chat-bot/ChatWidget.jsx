import { useEffect, useMemo, useRef, useState } from "react";
import useChatbot from "../../hooks/useChatbot";
import { fmtLocal, fmtLocalTime, toLocalDayjs } from "../../utils/datetime.js";
import "../../css/ChatWidget.css";

export default function ChatWidget({ isOpen, onClose, isLoggedIn }) {
  const [draft, setDraft] = useState("");
  const messageListRef = useRef(null);
  const inputRef = useRef(null);

  const {
    messages,
    hasMessages,
    loadingHistory,
    sending,
    error,
    statistics,
    sendMessage,
    clearHistory,
    refreshHistory,
  } = useChatbot({ enabled: isOpen && isLoggedIn });

  useEffect(() => {
    if (!isOpen) {
      setDraft("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const container = messageListRef.current;
    if (!container) return;

    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }, [messages, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      inputRef.current?.focus?.();
    }, 150);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const statisticsSummary = useMemo(() => {
    if (!statistics) return null;

    const total =
      statistics.totalMessages ||
      statistics.totalInteractions ||
      statistics.count ||
      0;
    const lastInteractionRaw =
      statistics.lastInteraction ||
      statistics.lastMessageAt ||
      statistics.updatedAt;

    const lastInteraction = lastInteractionRaw
      ? toLocalDayjs(lastInteractionRaw)
      : null;

    return { total, lastInteraction };
  }, [statistics]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!draft.trim() || sending) {
      return;
    }

    const currentDraft = draft;
    setDraft("");
    const result = await sendMessage(currentDraft);
    if (!result?.success) {
      setDraft((prev) => (prev ? prev : currentDraft));
      inputRef.current?.focus?.();
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  const handleClear = async () => {
    const confirmed = window.confirm(
      "Bạn có chắc muốn xóa toàn bộ lịch sử chat?"
    );
    if (!confirmed) return;
    await clearHistory();
  };

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="chat-widget"
      role="dialog"
      aria-modal="true"
      onClick={handleOverlayClick}
    >
      <div className="chat-widget__panel">
        <header className="chat-widget__header">
          <div>
            <h2 className="chat-widget__title">Trợ lý AI</h2>
            {statisticsSummary ? (
              <p className="chat-widget__subtitle">
                Tổng tin nhắn: {statisticsSummary.total}
                {statisticsSummary.lastInteraction && (
                  <>
                    {" "}
                    | Lần cuối:{" "}
                    {fmtLocal(
                      statisticsSummary.lastInteraction,
                      "DD/MM/YYYY HH:mm"
                    )}
                  </>
                )}
              </p>
            ) : (
              <p className="chat-widget__subtitle">
                Hỏi tôi về lịch chiếu, phim và nhiều hơn nữa.
              </p>
            )}
          </div>
          <div className="chat-widget__headerActions">
            <button
              type="button"
              className="chat-widget__iconButton"
              onClick={refreshHistory}
              title="Tải lại lịch sử"
              disabled={loadingHistory}
            >
              ⟳
            </button>
            <button
              type="button"
              className="chat-widget__iconButton"
              onClick={handleClear}
              title="Xóa lịch sử"
              disabled={loadingHistory || sending}
            >
              ✕
            </button>
            <button
              type="button"
              className="chat-widget__close"
              onClick={onClose}
              aria-label="Đóng chatbot"
            >
              ×
            </button>
          </div>
        </header>

        <section className="chat-widget__body">
          {loadingHistory ? (
            <div className="chat-widget__placeholder">
              Đang tải lịch sử trò chuyện...
            </div>
          ) : !hasMessages ? (
            <div className="chat-widget__placeholder">
              Hãy bắt đầu cuộc trò chuyện bằng cách nhập câu hỏi bên dưới.
            </div>
          ) : null}

          {error && <div className="chat-widget__error">{error}</div>}

          <div className="chat-widget__messages" ref={messageListRef}>
            {messages.map((item) => (
              <article
                key={item.id}
                className={`chat-widget__message chat-widget__message--${item.role}`}
              >
                <div className="chat-widget__avatar" aria-hidden="true">
                  {item.role === "user"
                    ? "Bạn"
                    : item.role === "system"
                    ? "!"
                    : "AI"}
                </div>
                <div className="chat-widget__content">
                  <div className="chat-widget__bubble">{item.content}</div>
                  {item.timestamp && (
                    <time
                      className="chat-widget__time"
                      dateTime={item.timestamp}
                    >
                      {fmtLocalTime(item.timestamp, "HH:mm")}
                    </time>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <form className="chat-widget__form" onSubmit={handleSubmit}>
          <textarea
            ref={inputRef}
            className="chat-widget__input"
            placeholder="Nhập câu hỏi của bạn..."
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
          />
          <button
            type="submit"
            className="chat-widget__submit"
            disabled={sending || !draft.trim()}
          >
            {sending ? "Đang gửi..." : "Gửi"}
          </button>
        </form>
      </div>
    </div>
  );
}
