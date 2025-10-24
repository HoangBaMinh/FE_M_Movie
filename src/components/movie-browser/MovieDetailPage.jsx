import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getAccessToken, logout as clearTokens } from "../../api/http";
import HeaderBar from "../HeaderBar";
import {
  getComingSoonMovies,
  getMovieById,
  getNowShowingMovies,
} from "../../services/movieService";
import { getShowtimesByMovie } from "../../services/showtimeService";
import {
  getMovieReviewStats,
  getReviewsByMovie,
} from "../../services/reviewService";
import { logout as logoutApi } from "../../services/authService";
import "../../css/MovieDetailPage.css";

const FALLBACK_POSTER =
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80";

function pickPoster(movie = {}) {
  if (typeof movie.posterUrl === "string" && movie.posterUrl.trim()) {
    return movie.posterUrl.trim();
  }

  if (Array.isArray(movie.images)) {
    const image = movie.images.find((item) => typeof item === "string");
    if (image) return image;

    const objectImage = movie.images.find(
      (item) => item && typeof item.url === "string"
    );
    if (objectImage) return objectImage.url;
  }

  if (typeof movie.backdropUrl === "string" && movie.backdropUrl.trim()) {
    return movie.backdropUrl.trim();
  }

  return FALLBACK_POSTER;
}

function formatRuntime(value) {
  if (value == null) return "";
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return "";
  return `${numeric} phút`;
}

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function formatReleaseYear(movie = {}) {
  const date =
    parseDate(movie.releaseDate) || parseDate(movie.publishedAt) || null;
  if (!date) return "";
  return `${date.getFullYear()}`;
}

function formatCategories(movie = {}) {
  if (Array.isArray(movie.categoryNames) && movie.categoryNames.length) {
    return movie.categoryNames.join(", ");
  }

  if (Array.isArray(movie.categories) && movie.categories.length) {
    return movie.categories
      .map((item) =>
        typeof item === "string"
          ? item
          : item?.name || item?.categoryName || item?.CategoryName || null
      )
      .filter(Boolean)
      .join(", ");
  }

  if (typeof movie.category === "string") return movie.category;
  return "";
}

function normalizeShowtime(showtime = {}) {
  const startValue =
    showtime.startTime ||
    showtime.startAt ||
    showtime.showTime ||
    showtime.showtime ||
    showtime.beginTime ||
    showtime.start;
  const fallbackDate = showtime.date || showtime.showDate || showtime.playDate;

  const startDate = parseDate(startValue) || parseDate(fallbackDate);
  const dateKey = startDate
    ? `${startDate.getFullYear()}-${`${startDate.getMonth() + 1}`.padStart(
        2,
        "0"
      )}-${`${startDate.getDate()}`.padStart(2, "0")}`
    : null;

  const timeLabel = startDate
    ? startDate.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : showtime.startTimeText || showtime.startTimeDisplay || showtime.time;

  return {
    id: showtime.id || showtime.showtimeId || showtime.showTimeId || null,
    cinemaId: showtime.cinemaId ?? showtime.cinema?.id ?? null,
    cinemaName:
      showtime.cinemaName ||
      showtime.cinema?.name ||
      showtime.cinema?.cinemaName ||
      "Rạp chưa rõ",
    cinemaAddress:
      showtime.cinemaAddress ||
      showtime.cinema?.address ||
      showtime.address ||
      "",
    roomName: showtime.roomName || showtime.room?.name || null,
    format:
      showtime.format ||
      showtime.dimension ||
      showtime.version ||
      showtime.type ||
      null,
    price:
      showtime.price ??
      showtime.ticketPrice ??
      showtime.priceInVnd ??
      showtime.cost ??
      null,
    startDate,
    timeLabel,
    dateKey,
  };
}

function formatDateLabel(dateKey) {
  if (!dateKey) return { label: "", weekday: "", day: "", month: "" };
  const date = parseDate(`${dateKey}T00:00:00`);
  if (!date) return { label: dateKey, weekday: dateKey, day: "", month: "" };

  const weekday = date
    .toLocaleDateString("vi-VN", { weekday: "short" })
    .replace(".", "");
  const day = `${date.getDate()}`.padStart(2, "0");
  const month = date
    .toLocaleDateString("vi-VN", { month: "short" })
    .replace(".", "");

  return {
    label: `${weekday} ${day}/${`${date.getMonth() + 1}`.padStart(2, "0")}`,
    weekday,
    day,
    month,
  };
}

function formatCurrency(value) {
  if (value == null) return "";
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "";
  return numeric.toLocaleString("vi-VN");
}

function pickAverageRating(movie = {}, stats = null) {
  if (stats && typeof stats.averageRating === "number") {
    return stats.averageRating;
  }

  const rating =
    movie.averageRating ??
    movie.avgRating ??
    movie.rating ??
    movie.imdbRating ??
    null;

  if (rating == null) return null;
  const numeric = Number(rating);
  if (!Number.isFinite(numeric)) return null;
  return Number(numeric.toFixed(1));
}

function pickReviewCount(movie = {}, stats = null) {
  if (stats && typeof stats.totalReviews === "number") {
    return stats.totalReviews;
  }

  if (typeof movie.totalReviews === "number") {
    return movie.totalReviews;
  }

  if (typeof movie.reviewCount === "number") {
    return movie.reviewCount;
  }

  return null;
}

function extractActors(movie = {}) {
  if (Array.isArray(movie.actors) && movie.actors.length) {
    return movie.actors
      .map((actor) =>
        typeof actor === "string"
          ? actor
          : actor?.name || actor?.actorName || actor?.fullName || null
      )
      .filter(Boolean);
  }

  if (typeof movie.actor === "string") {
    return [movie.actor];
  }

  return [];
}

function extractDirectors(movie = {}) {
  if (Array.isArray(movie.directors) && movie.directors.length) {
    return movie.directors
      .map((director) =>
        typeof director === "string"
          ? director
          : director?.name || director?.directorName || director?.fullName || null
      )
      .filter(Boolean);
  }

  if (typeof movie.director === "string") {
    return [movie.director];
  }

  return [];
}

function extractCountries(movie = {}) {
  if (Array.isArray(movie.countryNames) && movie.countryNames.length) {
    return movie.countryNames;
  }

  if (Array.isArray(movie.countries) && movie.countries.length) {
    return movie.countries
      .map((item) =>
        typeof item === "string"
          ? item
          : item?.name || item?.countryName || item?.CountryName || null
      )
      .filter(Boolean);
  }

  if (typeof movie.country === "string") {
    return [movie.country];
  }

  return [];
}

function groupShowtimesByCinema(items = []) {
  const grouped = new Map();

  items.forEach((item) => {
    const normalized = normalizeShowtime(item);
    if (!normalized?.dateKey) return;

    const cinemaKey = normalized.cinemaId || normalized.cinemaName;
    if (!grouped.has(normalized.dateKey)) {
      grouped.set(normalized.dateKey, new Map());
    }

    const dateMap = grouped.get(normalized.dateKey);
    if (!dateMap.has(cinemaKey)) {
      dateMap.set(cinemaKey, {
        cinemaId: normalized.cinemaId,
        cinemaName: normalized.cinemaName,
        cinemaAddress: normalized.cinemaAddress,
        showtimes: [],
      });
    }

    dateMap.get(cinemaKey).showtimes.push(normalized);
  });

  return grouped;
}

function sortDateKeys(keys = []) {
  return keys
    .slice()
    .sort((a, b) => {
      const da = parseDate(`${a}T00:00:00`);
      const db = parseDate(`${b}T00:00:00`);
      if (!da || !db) return a.localeCompare(b);
      return da.getTime() - db.getTime();
    });
}

function getTrailerLink(movie = {}) {
  const links = [
    movie.trailerUrl,
    movie.trailer,
    movie.trailerLink,
    movie.youtubeTrailer,
  ];

  return links.find((link) => typeof link === "string" && link.trim()) || "";
}

export default function MovieDetailPage() {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(getAccessToken()));

  const [movie, setMovie] = useState(null);
  const [movieLoading, setMovieLoading] = useState(true);
  const [movieError, setMovieError] = useState("");

  const [showtimes, setShowtimes] = useState([]);
  const [showtimeLoading, setShowtimeLoading] = useState(true);
  const [showtimeError, setShowtimeError] = useState("");

  const [reviewStats, setReviewStats] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewPageSize] = useState(5);
  const [reviewHasMore, setReviewHasMore] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [reviewError, setReviewError] = useState("");

  const reviewAbortRef = useRef(null);

  const [relatedNowShowing, setRelatedNowShowing] = useState([]);
  const [relatedComingSoon, setRelatedComingSoon] = useState([]);

  const movieNumericId = useMemo(() => {
    if (!movieId) return null;
    const numeric = Number(movieId);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : movieId;
  }, [movieId]);

  const groupedShowtimes = useMemo(
    () => groupShowtimesByCinema(Array.isArray(showtimes) ? showtimes : []),
    [showtimes]
  );

  const dateOptions = useMemo(
    () => sortDateKeys(Array.from(groupedShowtimes.keys())),
    [groupedShowtimes]
  );

  const [activeDate, setActiveDate] = useState(null);

  useEffect(() => {
    if (dateOptions.length === 0) {
      setActiveDate(null);
    } else if (!activeDate || !dateOptions.includes(activeDate)) {
      setActiveDate(dateOptions[0]);
    }
  }, [dateOptions, activeDate]);

  const showtimesForActiveDate = useMemo(() => {
    if (!activeDate) return [];
    const dateGroup = groupedShowtimes.get(activeDate);
    if (!dateGroup) return [];
    return Array.from(dateGroup.values()).map((cinema) => ({
      ...cinema,
      showtimes: cinema.showtimes
        .slice()
        .sort((a, b) => {
          if (!a.startDate || !b.startDate) return 0;
          return a.startDate.getTime() - b.startDate.getTime();
        }),
    }));
  }, [groupedShowtimes, activeDate]);

  useEffect(() => {
    const controller = new AbortController();

    if (!movieNumericId) {
      setMovie(null);
      setMovieError("Không tìm thấy mã phim hợp lệ.");
      setMovieLoading(false);
      return () => controller.abort();
    }

    async function fetchMovieDetails() {
      setMovieLoading(true);
      setMovieError("");

      try {
        const data = await getMovieById(movieNumericId, {
          signal: controller.signal,
        });
        if (!controller.signal.aborted) {
          setMovie(data || null);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Fetch movie detail error", error);
          setMovieError("Không tải được thông tin phim. Vui lòng thử lại.");
          setMovie(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setMovieLoading(false);
        }
      }
    }

    fetchMovieDetails();

    return () => controller.abort();
  }, [movieNumericId]);

  useEffect(() => {
    const controller = new AbortController();

    if (!movieNumericId) {
      setShowtimeLoading(false);
      setShowtimeError("");
      setShowtimes([]);
      return () => controller.abort();
    }

    async function fetchShowtimes() {
      setShowtimeLoading(true);
      setShowtimeError("");
      try {
        const data = await getShowtimesByMovie(movieNumericId, {
          signal: controller.signal,
        });
        if (!controller.signal.aborted) {
          setShowtimes(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Fetch showtimes error", error);
          setShowtimeError("Không tải được lịch chiếu. Vui lòng thử lại.");
          setShowtimes([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setShowtimeLoading(false);
        }
      }
    }

    fetchShowtimes();

    return () => controller.abort();
  }, [movieNumericId]);

  useEffect(() => {
    const controller = new AbortController();

    if (!movieNumericId) {
      setReviewStats(null);
      return () => controller.abort();
    }

    async function fetchStats() {
      try {
        const data = await getMovieReviewStats(movieNumericId, {
          signal: controller.signal,
        });
        if (!controller.signal.aborted) {
          setReviewStats(data || null);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Fetch review stats error", error);
          setReviewStats(null);
        }
      }
    }

    fetchStats();

    return () => controller.abort();
  }, [movieNumericId]);

  const loadReviews = useCallback(
    (pageNumber = 1) => {
      if (!movieNumericId) return;

      reviewAbortRef.current?.abort?.();
      const controller = new AbortController();
      reviewAbortRef.current = controller;

      setReviewLoading(true);
      setReviewError("");

      getReviewsByMovie(
        movieNumericId,
        {
          pageNumber,
          pageSize: reviewPageSize,
        },
        { signal: controller.signal }
      )
        .then((data) => {
          if (controller.signal.aborted) return;

          const items = Array.isArray(data?.items) ? data.items : [];
          setReviews((prev) =>
            pageNumber === 1 ? items : [...prev, ...items]
          );
          setReviewHasMore(
            Boolean(
              data?.hasNextPage ??
                (data?.totalPages
                  ? pageNumber < data.totalPages
                  : items.length === reviewPageSize)
            )
          );
          setReviewPage(pageNumber);
        })
        .catch((error) => {
          if (controller.signal.aborted) return;
          console.error("Fetch reviews error", error);
          setReviewError("Không tải được bình luận. Vui lòng thử lại.");
          if (pageNumber === 1) {
            setReviews([]);
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setReviewLoading(false);
          }
          if (reviewAbortRef.current === controller) {
            reviewAbortRef.current = null;
          }
        });
    },
    [movieNumericId, reviewPageSize]
  );

  useEffect(() => {
    if (!movieNumericId) {
      setReviews([]);
      setReviewHasMore(false);
      setReviewLoading(false);
      return undefined;
    }
    loadReviews(1);
    return () => {
      reviewAbortRef.current?.abort?.();
    };
  }, [movieNumericId, loadReviews]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchRelated() {
      try {
        const [nowShowing, comingSoon] = await Promise.all([
          getNowShowingMovies({ signal: controller.signal }),
          getComingSoonMovies({ signal: controller.signal }),
        ]);

        if (!controller.signal.aborted) {
          setRelatedNowShowing(Array.isArray(nowShowing) ? nowShowing.slice(0, 8) : []);
          setRelatedComingSoon(Array.isArray(comingSoon) ? comingSoon.slice(0, 8) : []);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Fetch related movies error", error);
          setRelatedNowShowing([]);
          setRelatedComingSoon([]);
        }
      }
    }

    fetchRelated();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    setIsLoggedIn(Boolean(getAccessToken()));
  }, []);

  const handleLoadMoreReviews = () => {
    const nextPage = reviewPage + 1;
    loadReviews(nextPage);
  };

  const handleNavigateHome = useCallback(() => {
    navigate("/");
  }, [navigate]);

  const handleLogout = useCallback(async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearTokens();
      setIsLoggedIn(false);
      navigate("/");
    }
  }, [navigate]);

  const handleChangePassword = useCallback(() => {
    alert("Vui lòng thực hiện đổi mật khẩu tại trang chủ.");
    navigate("/");
  }, [navigate]);

  const handleOrders = useCallback(() => {
    alert("Tính năng đơn hàng hiện khả dụng tại trang chủ. Hệ thống sẽ chuyển bạn về trang chủ.");
    navigate("/");
  }, [navigate]);

  const handleChat = useCallback(() => {
    if (!isLoggedIn) {
      alert("Bạn cần đăng nhập để sử dụng trợ lý AI. Chuyển về trang chủ.");
    }
    navigate("/");
  }, [navigate, isLoggedIn]);

  const averageRating = pickAverageRating(movie, reviewStats);
  const reviewCount = pickReviewCount(movie, reviewStats);
  const runtime = formatRuntime(movie?.duration || movie?.runtime || movie?.length);
  const categories = formatCategories(movie);
  const releaseYear = formatReleaseYear(movie);
  const trailerLink = getTrailerLink(movie);
  const actors = extractActors(movie);
  const directors = extractDirectors(movie);
  const countries = extractCountries(movie);

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="movie-detail-page">
      <HeaderBar
        query={query}
        onQueryChange={setQuery}
        onLogin={handleNavigateHome}
        onLogout={handleLogout}
        onChangePassword={handleChangePassword}
        onOrders={handleOrders}
        onChat={handleChat}
        isLoggedIn={isLoggedIn}
        showSearch={false}
      />

      <main className="movie-detail-content">
        <div className="movie-detail-container">
          <button type="button" className="movie-detail-back" onClick={handleBack}>
            ← Quay lại
          </button>

          {movieLoading ? (
            <section className="movie-detail-hero movie-detail-hero--loading">
              <div className="movie-detail-state">Đang tải thông tin phim...</div>
            </section>
          ) : movieError ? (
            <section className="movie-detail-hero movie-detail-hero--error">
              <div className="movie-detail-state">{movieError}</div>
            </section>
          ) : !movie ? (
            <section className="movie-detail-hero movie-detail-hero--empty">
              <div className="movie-detail-state">
                Không tìm thấy thông tin phim theo yêu cầu.
              </div>
            </section>
          ) : (
            <section className="movie-detail-hero">
              <div className="movie-detail-poster">
                <img
                  src={pickPoster(movie)}
                  alt={movie?.name || movie?.title || "Poster phim"}
                />
              </div>
              <div className="movie-detail-info">
                <h1 className="movie-detail-title">
                  {movie?.name || movie?.title || "Thông tin phim"}
                </h1>
                <div className="movie-detail-meta">
                  {averageRating != null ? (
                    <div className="movie-detail-rating">
                      <span className="movie-detail-rating-value">
                        {averageRating}
                      </span>
                      <span className="movie-detail-rating-label">/10</span>
                    </div>
                  ) : null}
                  {reviewCount != null ? (
                    <span className="movie-detail-meta-item">
                      {reviewCount.toLocaleString("vi-VN")} đánh giá
                    </span>
                  ) : null}
                  {releaseYear ? (
                    <span className="movie-detail-meta-item">{releaseYear}</span>
                  ) : null}
                  {runtime ? (
                    <span className="movie-detail-meta-item">{runtime}</span>
                  ) : null}
                </div>

                {categories ? (
                  <p className="movie-detail-genres">Thể loại: {categories}</p>
                ) : null}

                {countries.length ? (
                  <p className="movie-detail-genres">
                    Quốc gia: {countries.join(", ")}
                  </p>
                ) : null}

                {directors.length ? (
                  <p className="movie-detail-genres">
                    Đạo diễn: {directors.join(", ")}
                  </p>
                ) : null}

                {actors.length ? (
                  <p className="movie-detail-genres">
                    Diễn viên: {actors.join(", ")}
                  </p>
                ) : null}

                {movie?.description || movie?.content || movie?.synopsis ? (
                  <p className="movie-detail-description">
                    {movie.description || movie.content || movie.synopsis}
                  </p>
                ) : null}

                <div className="movie-detail-actions">
                  {trailerLink ? (
                    <a
                      className="movie-detail-action primary"
                      href={trailerLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Xem trailer
                    </a>
                  ) : null}
                  <a className="movie-detail-action" href="#showtimes">
                    Xem lịch chiếu
                  </a>
                </div>
              </div>
            </section>
          )}

          <section className="movie-detail-section" id="showtimes">
            <div className="section-header">
              <h2>Lịch chiếu</h2>
              {showtimeError ? (
                <span className="section-error">{showtimeError}</span>
              ) : null}
            </div>

            {!movie || movieError ? (
              <div className="movie-detail-state">
                Vui lòng chọn phim hợp lệ để xem lịch chiếu.
              </div>
            ) : showtimeLoading ? (
              <div className="movie-detail-state">Đang tải lịch chiếu...</div>
            ) : dateOptions.length === 0 ? (
              <div className="movie-detail-state">
                Hiện chưa có lịch chiếu cho phim này.
              </div>
            ) : (
              <>
                <div className="movie-detail-date-picker">
                  {dateOptions.map((dateKey) => {
                    const dateLabel = formatDateLabel(dateKey);
                    const isActive = activeDate === dateKey;
                    return (
                      <button
                        key={dateKey}
                        type="button"
                        className={`movie-detail-date ${isActive ? "active" : ""}`}
                        onClick={() => setActiveDate(dateKey)}
                      >
                        <span className="movie-detail-date-weekday">{dateLabel.weekday}</span>
                        <span className="movie-detail-date-day">{dateLabel.day}</span>
                        <span className="movie-detail-date-month">{dateLabel.month}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="movie-detail-showtimes">
                  {showtimesForActiveDate.length === 0 ? (
                    <div className="movie-detail-state">
                      Không có lịch chiếu trong ngày này.
                    </div>
                  ) : (
                    showtimesForActiveDate.map((cinema) => (
                      <div
                        key={cinema.cinemaId || cinema.cinemaName}
                        className="movie-detail-cinema"
                      >
                        <div className="movie-detail-cinema-header">
                          <h3>{cinema.cinemaName}</h3>
                          {cinema.cinemaAddress ? <p>{cinema.cinemaAddress}</p> : null}
                        </div>
                        <div className="movie-detail-showtime-grid">
                          {cinema.showtimes.map((item) => (
                            <button
                              key={`${cinema.cinemaId || cinema.cinemaName}-${item.id || item.timeLabel}`}
                              type="button"
                              className="movie-detail-showtime"
                            >
                              <span className="movie-detail-showtime-time">
                                {item.timeLabel || "--:--"}
                              </span>
                              {item.format ? (
                                <span className="movie-detail-showtime-format">{item.format}</span>
                              ) : null}
                              {item.price != null ? (
                                <span className="movie-detail-showtime-price">
                                  {formatCurrency(item.price)} đ
                                </span>
                              ) : null}
                              {item.roomName ? (
                                <span className="movie-detail-showtime-room">
                                  Phòng {item.roomName}
                                </span>
                              ) : null}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </section>

          <section className="movie-detail-section" id="reviews">
            <div className="section-header">
              <h2>Bình luận</h2>
              {reviewError ? (
                <span className="section-error">{reviewError}</span>
              ) : null}
            </div>

            {!movie || movieError ? (
              <div className="movie-detail-state">
                Vui lòng chọn phim hợp lệ để xem bình luận.
              </div>
            ) : (
              <>
                <div className="movie-detail-review-summary">
                  {averageRating != null ? (
                    <div className="movie-detail-review-score">
                      <span className="movie-detail-review-score-value">{averageRating}</span>
                      <span className="movie-detail-review-score-max">/10</span>
                    </div>
                  ) : (
                    <div className="movie-detail-review-score movie-detail-review-score--empty">
                      Chưa có đánh giá
                    </div>
                  )}
                  <div className="movie-detail-review-meta">
                    {reviewCount != null ? (
                      <span>{reviewCount.toLocaleString("vi-VN")} lượt đánh giá</span>
                    ) : (
                      <span>Hãy là người đầu tiên đánh giá!</span>
                    )}
                  </div>
                </div>

                {reviewLoading && reviews.length === 0 ? (
                  <div className="movie-detail-state">Đang tải bình luận...</div>
                ) : reviews.length === 0 ? (
                  <div className="movie-detail-state">
                    Chưa có bình luận nào cho phim này.
                  </div>
                ) : (
                  <ul className="movie-detail-review-list">
                    {reviews.map((review) => (
                      <li
                        key={
                          review.id ||
                          `${review.userId || "user"}-${
                            review.createdAt || review.createdDate
                          }`
                        }
                        className="movie-detail-review-item"
                      >
                        <div className="movie-detail-review-header">
                          <div className="movie-detail-review-author">
                            <span className="movie-detail-review-name">
                              {review.userName ||
                                review.authorName ||
                                review.createdByName ||
                                "Người dùng ẩn danh"}
                            </span>
                            {review.createdAt || review.createdDate ? (
                              <span className="movie-detail-review-date">
                                {new Date(
                                  review.createdAt || review.createdDate
                                ).toLocaleDateString("vi-VN")}
                              </span>
                            ) : null}
                          </div>
                          {review.rating != null ? (
                            <span className="movie-detail-review-rating">
                              {Number(review.rating).toFixed(1)} / 10
                            </span>
                          ) : null}
                        </div>
                        {review.title ? (
                          <p className="movie-detail-review-title">{review.title}</p>
                        ) : null}
                        <p className="movie-detail-review-body">
                          {review.content || review.comment || review.body}
                        </p>
                        {review.likes != null || review.helpfulCount != null ? (
                          <div className="movie-detail-review-footer">
                            <span>
                              Hữu ích: {(
                                review.helpfulCount ?? review.likes ?? 0
                              ).toLocaleString("vi-VN")}
                            </span>
                          </div>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}

                {reviewHasMore ? (
                  <div className="movie-detail-review-actions">
                    <button
                      type="button"
                      className="movie-detail-action primary"
                      onClick={handleLoadMoreReviews}
                      disabled={reviewLoading}
                    >
                      {reviewLoading ? "Đang tải..." : "Xem thêm bình luận"}
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </section>
        </div>

        <aside className="movie-detail-sidebar">
          <div className="movie-detail-sidebar-section">
            <h3>Phim đang chiếu</h3>
            <ul>
              {relatedNowShowing.map((item) => (
                <li key={item.id || item.movieId || item.name}>
                  <Link to={`/movies/${item.id || item.movieId}`} className="movie-detail-sidebar-link">
                    <span className="movie-detail-sidebar-name">
                      {item.name || item.title}
                    </span>
                    {item.averageRating ? (
                      <span className="movie-detail-sidebar-rating">
                        {Number(item.averageRating).toFixed(1)}
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="movie-detail-sidebar-section">
            <h3>Phim sắp chiếu</h3>
            <ul>
              {relatedComingSoon.map((item) => (
                <li key={item.id || item.movieId || item.name}>
                  <Link to={`/movies/${item.id || item.movieId}`} className="movie-detail-sidebar-link">
                    <span className="movie-detail-sidebar-name">
                      {item.name || item.title}
                    </span>
                    {item.releaseDate ? (
                      <span className="movie-detail-sidebar-date">
                        {new Date(item.releaseDate).toLocaleDateString("vi-VN")}
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
}