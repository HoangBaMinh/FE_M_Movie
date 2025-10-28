import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAccessToken, logout as clearTokens } from "../../api/http";
import HeaderBar from "../header/HeaderBar";
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
import {
  extractActors,
  extractCountries,
  extractDirectors,
  formatCategories,
  formatReleaseYear,
  formatRuntime,
  getTrailerLink,
  groupShowtimesByCinema,
  pickAverageRating,
  pickReviewCount,
  resolveTrailerEmbedUrl,
  sortDateKeys,
} from "../../services/movieDetailService";
import MovieDetailHero from "./MovieDetailHero";
import MovieShowtimes from "./MovieShowtimes";
import MovieReviews from "./MovieReviews";
import MovieDetailSidebar from "./MovieDetailSidebar";
import MovieTrailerModal from "./MovieTrailerModal";
import "../../css/MovieDetailPage.css";

export default function MovieDetailPage() {
  const { movieSlug } = useParams();
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
  const [isTrailerOpen, setTrailerOpen] = useState(false);

  const routeParam = useMemo(() => {
    if (!movieSlug) return null;
    const trimmed = String(movieSlug).trim();
    return trimmed.length ? trimmed : null;
  }, [movieSlug]);

  const movieLookupKey = useMemo(() => {
    if (!routeParam) return null;
    const numeric = Number(routeParam);
    if (Number.isFinite(numeric) && numeric > 0) {
      return numeric;
    }
    return routeParam;
  }, [routeParam]);

  const movieInternalId = useMemo(() => {
    if (!movie) return null;
    const candidates = [movie.id, movie.movieId, movie.movieID];
    const found = candidates.find((value) => value != null && value !== "");
    return found ?? null;
  }, [movie]);

  const movieNumericId = useMemo(() => {
    const candidates = [movieInternalId, movieLookupKey];

    for (const candidate of candidates) {
      if (candidate == null || candidate === "") continue;
      const numeric = Number(candidate);
      if (Number.isFinite(numeric) && numeric > 0) {
        return numeric;
      }
    }

    if (typeof movieLookupKey === "number") {
      return movieLookupKey;
    }

    return null;
  }, [movieInternalId, movieLookupKey]);

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
      showtimes: cinema.showtimes.slice().sort((a, b) => {
        if (!a.startDate || !b.startDate) return 0;
        return a.startDate.getTime() - b.startDate.getTime();
      }),
    }));
  }, [groupedShowtimes, activeDate]);

  useEffect(() => {
    const controller = new AbortController();

    if (!movieLookupKey) {
      setMovie(null);
      setMovieError("Không tìm thấy mã phim hợp lệ.");
      setMovieLoading(false);
      return () => controller.abort();
    }

    async function fetchMovieDetails() {
      setMovieLoading(true);
      setMovieError("");
      setMovie(null);

      try {
        const data = await getMovieById(movieLookupKey, {
          signal: controller.signal,
        });
        if (!controller.signal.aborted) {
          setMovie(data || null);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Fetch movie detail error", error);
          const status = error?.status ?? error?.response?.status;
          if (status === 404) {
            setMovieError("Không tìm thấy phim bạn yêu cầu.");
          } else {
            setMovieError("Không tải được thông tin phim. Vui lòng thử lại.");
          }
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
  }, [movieLookupKey]);

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
          const status = error?.status ?? error?.response?.status;
          if (status === 404) {
            setShowtimes([]);
            setShowtimeError("");
          } else {
            console.error("Fetch showtimes error", error);
            setShowtimeError("Không tải được lịch chiếu. Vui lòng thử lại.");
            setShowtimes([]);
          }
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

    if (!movieInternalId) {
      setReviewStats(null);
      return () => controller.abort();
    }

    async function fetchStats() {
      try {
        const data = await getMovieReviewStats(movieInternalId, {
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
  }, [movieInternalId]);

  const loadReviews = useCallback(
    (pageNumber = 1) => {
      if (!movieInternalId) return;

      reviewAbortRef.current?.abort?.();
      const controller = new AbortController();
      reviewAbortRef.current = controller;

      setReviewLoading(true);
      setReviewError("");

      getReviewsByMovie(
        movieInternalId,
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
    [movieInternalId, reviewPageSize]
  );

  useEffect(() => {
    if (!movieInternalId) {
      setReviews([]);
      setReviewHasMore(false);
      setReviewLoading(false);
      return undefined;
    }
    loadReviews(1);
    return () => {
      reviewAbortRef.current?.abort?.();
    };
  }, [movieInternalId, loadReviews]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchRelated() {
      try {
        const [nowShowing, comingSoon] = await Promise.all([
          getNowShowingMovies({ signal: controller.signal }),
          getComingSoonMovies({ signal: controller.signal }),
        ]);

        if (!controller.signal.aborted) {
          setRelatedNowShowing(
            Array.isArray(nowShowing) ? nowShowing.slice(0, 8) : []
          );
          setRelatedComingSoon(
            Array.isArray(comingSoon) ? comingSoon.slice(0, 8) : []
          );
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
    alert(
      "Tính năng đơn hàng hiện khả dụng tại trang chủ. Hệ thống sẽ chuyển bạn về trang chủ."
    );
    navigate("/");
  }, [navigate]);

  const handleChat = useCallback(() => {
    if (!isLoggedIn) {
      alert("Bạn cần đăng nhập để sử dụng trợ lý AI. Chuyển về trang chủ.");
    }
    navigate("/");
  }, [navigate, isLoggedIn]);

  const safeMovie = movie || {};
  const averageRating = pickAverageRating(safeMovie, reviewStats);
  const reviewCount = pickReviewCount(safeMovie, reviewStats);
  const runtime = formatRuntime(
    safeMovie?.duration || safeMovie?.runtime || safeMovie?.length
  );
  const categories = formatCategories(safeMovie);
  const releaseYear = formatReleaseYear(safeMovie);
  const trailerLink = getTrailerLink(safeMovie);
  const trailerEmbedUrl = useMemo(
    () => resolveTrailerEmbedUrl(trailerLink),
    [trailerLink]
  );
  const actors = extractActors(safeMovie);
  const directors = extractDirectors(safeMovie);
  const countries = extractCountries(safeMovie);

  const handleOpenTrailer = useCallback(() => {
    if (trailerEmbedUrl) {
      setTrailerOpen(true);
      return;
    }

    if (trailerLink && typeof window !== "undefined") {
      window.open(trailerLink, "_blank", "noopener,noreferrer");
    }
  }, [trailerEmbedUrl, trailerLink]);

  const handleCloseTrailer = useCallback(() => {
    setTrailerOpen(false);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    if (!isTrailerOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setTrailerOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isTrailerOpen]);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    if (!isTrailerOpen) return undefined;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    return () => {
      body.style.overflow = previousOverflow;
    };
  }, [isTrailerOpen]);

  useEffect(() => {
    setTrailerOpen(false);
  }, [movieLookupKey]);

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
          <button
            type="button"
            className="movie-detail-back"
            onClick={handleBack}
          >
            ← Quay lại
          </button>

          <MovieDetailHero
            movie={movie}
            loading={movieLoading}
            error={movieError}
            averageRating={averageRating}
            reviewCount={reviewCount}
            releaseYear={releaseYear}
            runtime={runtime}
            categories={categories}
            countries={countries}
            directors={directors}
            actors={actors}
            trailerLink={trailerLink}
            onOpenTrailer={handleOpenTrailer}
          />

          <MovieShowtimes
            movie={movie}
            movieError={movieError}
            showtimeLoading={showtimeLoading}
            showtimeError={showtimeError}
            dateOptions={dateOptions}
            activeDate={activeDate}
            onSelectDate={setActiveDate}
            showtimesForActiveDate={showtimesForActiveDate}
          />

          <MovieReviews
            movie={movie}
            movieError={movieError}
            averageRating={averageRating}
            reviewCount={reviewCount}
            reviewLoading={reviewLoading}
            reviews={reviews}
            reviewHasMore={reviewHasMore}
            onLoadMore={handleLoadMoreReviews}
            reviewError={reviewError}
          />
        </div>

        <MovieDetailSidebar
          nowShowing={relatedNowShowing}
          comingSoon={relatedComingSoon}
        />
      </main>

      <MovieTrailerModal
        isOpen={isTrailerOpen}
        embedUrl={trailerEmbedUrl}
        title={`Trailer ${movie?.name || movie?.title || "phim"}`}
        onClose={handleCloseTrailer}
      />
    </div>
  );
}
