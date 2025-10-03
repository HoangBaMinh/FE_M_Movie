import { http } from "../api/http";

export async function getMovies() {
  const res = await http.get("/Movie");
  return res.data; // List<MovieDto>
}

export async function getMoviesByCategory(categoryId) {
  const res = await http.get(`/Movie/by-category/${categoryId}`); // nếu có endpoint
  return res.data;
}

export async function searchMoviesByName(name) {
  const res = await http.get(`/Movie/by-name/${encodeURIComponent(name)}`);
  return res.data;
}


