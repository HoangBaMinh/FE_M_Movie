import { http } from "../api/http";

export async function getShowtimeById(id, opts = {}) {
  if (id == null || id === "") {
    throw new Error("Showtime id is required");
  }

  const res = await http.get(`/Showtime/${id}`, {
    signal: opts.signal,
  });

  return res.data;
}

export async function getShowtimesByMovie(movieId, opts = {}) {
  if (movieId == null || movieId === "") {
    throw new Error("Movie id is required to fetch showtimes");
  }

  const params = {};
  if (opts.date) {
    params.date = opts.date;
  }

  const res = await http.get(`/Showtime/by-movie/${movieId}`, {
    params,
    signal: opts.signal,
  });

  return res.data;
}

export async function getShowtimesByCinema(cinemaId, opts = {}) {
  if (cinemaId == null || cinemaId === "") {
    throw new Error("Cinema id is required to fetch showtimes");
  }

  const params = {};
  if (opts.date) {
    params.date = opts.date;
  }

  const res = await http.get(`/Showtime/by-cinema/${cinemaId}`, {
    params,
    signal: opts.signal,
  });

  return res.data;
}