import { http } from "../api/http";

export async function getReviewsByMovie(movieId, query = {}, opts = {}) {
  if (movieId == null || movieId === "") {
    throw new Error("Movie id is required to fetch reviews");
  }

  const params = {};
  if (query.pageNumber != null) params.pageNumber = query.pageNumber;
  if (query.pageSize != null) params.pageSize = query.pageSize;
  if (query.sorting) params.sorting = query.sorting;
  if (query.filter) params.filter = query.filter;

  const res = await http.get(`/Review/movie/${movieId}`, {
    params,
    signal: opts.signal,
  });

  return res.data;
}

export async function getMovieReviewStats(movieId, opts = {}) {
  if (movieId == null || movieId === "") {
    throw new Error("Movie id is required to fetch review stats");
  }

  const res = await http.get(`/Review/movie/${movieId}/stats`, {
    signal: opts.signal,
  });

  return res.data;
}
