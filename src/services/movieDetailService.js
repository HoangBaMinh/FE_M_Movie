const FALLBACK_POSTER =
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80";

export function pickPoster(movie = {}) {
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

export function formatRuntime(value) {
  if (value == null) return "";
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return "";
  return `${numeric} phút`;
}

export function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export function formatReleaseYear(movie = {}) {
  const date =
    parseDate(movie.releaseDate) || parseDate(movie.publishedAt) || null;
  if (!date) return "";
  return `${date.getFullYear()}`;
}

export function formatCategories(movie = {}) {
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

export function normalizeShowtime(showtime = {}) {
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

export function formatDateLabel(dateKey) {
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

export function formatCurrency(value) {
  if (value == null) return "";
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "";
  return numeric.toLocaleString("vi-VN");
}

export function pickAverageRating(movie = {}, stats = null) {
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

export function pickReviewCount(movie = {}, stats = null) {
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

export function extractActors(movie = {}) {
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

export function extractDirectors(movie = {}) {
  if (Array.isArray(movie.directors) && movie.directors.length) {
    return movie.directors
      .map((director) =>
        typeof director === "string"
          ? director
          : director?.name ||
            director?.directorName ||
            director?.fullName ||
            null
      )
      .filter(Boolean);
  }

  if (typeof movie.director === "string") {
    return [movie.director];
  }

  return [];
}

export function extractCountries(movie = {}) {
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

export function groupShowtimesByCinema(items = []) {
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

export function sortDateKeys(keys = []) {
  return keys.slice().sort((a, b) => {
    const da = parseDate(`${a}T00:00:00`);
    const db = parseDate(`${b}T00:00:00`);
    if (!da || !db) return a.localeCompare(b);
    return da.getTime() - db.getTime();
  });
}

export function getTrailerLink(movie = {}) {
  const links = [
    movie.trailerUrl,
    movie.trailer,
    movie.trailerLink,
    movie.youtubeTrailer,
  ];

  return links.find((link) => typeof link === "string" && link.trim()) || "";
}

export function resolveTrailerEmbedUrl(url) {
  if (typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed) return "";

  let parsedUrl;
  try {
    parsedUrl = new URL(trimmed);
  } catch {
    return "";
  }

  const hostname = parsedUrl.hostname.replace(/^www\./i, "");
  let videoId = "";

  if (hostname === "youtu.be") {
    videoId = parsedUrl.pathname.split("/").filter(Boolean)[0] || "";
  } else if (
    hostname.endsWith("youtube.com") ||
    hostname.endsWith("youtube-nocookie.com")
  ) {
    if (parsedUrl.searchParams.has("v")) {
      videoId = parsedUrl.searchParams.get("v") || "";
    } else if (parsedUrl.pathname.startsWith("/embed/")) {
      videoId = parsedUrl.pathname.split("/")[2] || "";
    } else if (parsedUrl.pathname.startsWith("/shorts/")) {
      videoId = parsedUrl.pathname.split("/")[2] || "";
    }
  }

  if (!videoId) return "";

  const embedUrl = new URL(`https://www.youtube.com/embed/${videoId}`);
  embedUrl.searchParams.set("autoplay", "1");
  embedUrl.searchParams.set("rel", "0");
  return embedUrl.toString();
}

export function resolvePosterMeta(movie) {
  const posterUrlCandidate = movie?.posterUrl;

  const posterUrl =
    typeof posterUrlCandidate === "string"
      ? posterUrlCandidate.trim()
      : posterUrlCandidate;

  if (posterUrl) {
    return {
      hasImage: true,
      src: posterUrl,
    };
  }

  const label = (movie?.name || movie?.title || "?").toString().trim();

  return {
    hasImage: false,
    text: label.slice(0, 1).toUpperCase() || "?",
  };
}

export function resolveMovieLink(movie) {
  if (!movie || typeof movie !== "object") return "/movies";

  const identifier =
    movie.id || movie.movieId || movie.slug || movie.Slug || movie.movieSlug;

  if (!identifier) return "/movies";

  return `/movies/${identifier}`;
}

export { FALLBACK_POSTER };
