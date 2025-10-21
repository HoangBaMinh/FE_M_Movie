import { http } from "../api/http";

/** Tất cả hàm đều cho phép truyền { signal } để abort khi cần **/

export async function getMovies(opts = {}) {
  const res = await http.get("/Movie", { signal: opts.signal });
  return res.data;
}

export async function getMoviesByCategory(categoryId, opts = {}) {
  const res = await http.get(`/Movie/by-category/${categoryId}`, {
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
