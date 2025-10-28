import { http } from "../api/http";

/** Tất cả hàm đều cho phép truyền { signal } để abort khi cần **/

export async function getMovies(opts = {}) {
  const res = await http.get("/Movie", { signal: opts.signal });
  return res.data;
}

function normalizeIdentifier(value) {
  if (value == null) return null;
  const raw = typeof value === "string" ? value.trim() : value;
  if (raw === "") return null;
  return raw;
}

function isNumericId(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0;
  }

  if (typeof value === "string") {
    return /^\d+$/.test(value);
  }

  return false;
}

async function fetchMovieBySlug(slug, opts = {}) {
  const searchTerm = String(slug);

  const res = await http.get("/Movie/paged", {
    params: {
      pageNumber: 1,
      pageSize: 1,
      searchTerm,
    },
    signal: opts.signal,
  });

  const items = res?.data?.items ?? res?.data?.Items ?? [];
  if (Array.isArray(items) && items.length > 0) {
    return items[0];
  }

  const error = new Error("Movie not found");
  error.status = 404;
  throw error;
}

export async function getMovieBySlug(slug, opts = {}) {
  const identifier = normalizeIdentifier(slug);

  if (identifier == null) {
    throw new Error("Movie slug is required");
  }

  return fetchMovieBySlug(identifier, opts);
}

export async function getMovieById(idOrSlug, opts = {}) {
  const identifier = normalizeIdentifier(idOrSlug);

  if (identifier == null) {
    throw new Error("Movie id is required");
  }

  if (isNumericId(identifier)) {
    const numericId = Number(identifier);
    const res = await http.get(`/Movie/${numericId}`, {
      signal: opts.signal,
    });

    return res.data;
  }

  return fetchMovieBySlug(identifier, opts);
}

export async function getMoviesByCategory(categoryId, opts = {}) {
  const res = await http.get(`/Movie/by-category/${categoryId}`, {
    signal: opts.signal,
  });
  return res.data;
}

export async function getNowShowingMovies(opts = {}) {
  const res = await http.get("/Movie/now-showing", {
    signal: opts.signal,
  });
  return res.data;
}

export async function getComingSoonMovies(opts = {}) {
  const res = await http.get("/Movie/coming-soon", {
    signal: opts.signal,
  });
  return res.data;
}

export async function getMoviesByCountry(countryId, opts = {}) {
  const res = await http.get(`/Movie/by-country/${countryId}`, {
    signal: opts.signal,
  });
  return res.data;
}

export async function getMoviesByCinema(cinemaId, opts = {}) {
  const res = await http.get(`/Movie/by-cinema/${cinemaId}`, {
    signal: opts.signal,
  });
  return res.data;
}

export async function searchMoviesByName(name, opts = {}) {
  const res = await http.get(`/Movie/by-name/${encodeURIComponent(name)}`, {
    signal: opts.signal,
  });
  return res.data;
}

/**
 * Endpoint filter tổng hợp:
 * GET /api/Movie/filter?categoryId=&countryId=&cinemaId=&q=
 */
export async function getMoviesFiltered(
  { categoryId, countryId, cinemaId, q },
  opts = {}
) {
  const params = {};

  if (categoryId != null) params.categoryId = categoryId;
  if (countryId != null) params.countryId = countryId;
  if (cinemaId != null) params.cinemaId = cinemaId;
  if (q?.trim()) params.q = q.trim();

  const res = await http.get("/Movie/filter", {
    params,
    signal: opts.signal,
  });

  return res.data;
}

/**
 * Endpoint phân trang mới:
 * GET /api/Movie/paged?pageNumber=1&pageSize=12&searchTerm=&sortBy=name&sortDescending=false
 */
export async function getMoviesPaged(
  {
    pageNumber = 1,
    pageSize = 12,
    searchTerm = "",
    sortBy = "name",
    sortDescending = false,
    categoryId,
    countryId,
  },
  opts = {}
) {
  const params = {
    pageNumber,
    pageSize,
    sortBy,
    sortDescending,
  };

  if (searchTerm?.trim()) {
    params.searchTerm = searchTerm.trim();
  }
  if (categoryId != null) {
    params.categoryId = categoryId;
  }
  if (countryId != null) {
    params.countryId = countryId;
  }

  const res = await http.get("/Movie/paged", {
    params,
    signal: opts.signal,
  });

  return res.data;
}
