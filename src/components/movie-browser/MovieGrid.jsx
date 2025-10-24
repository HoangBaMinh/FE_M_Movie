const POSTER_FIELDS = ["posterUrl"]

function pickPoster(movie = {}) {
  for (const field of POSTER_FIELDS) {
    const value = movie?.[field];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  if (Array.isArray(movie?.images)) {
    const poster = movie.images.find((item) => typeof item === "string");
    if (poster) {
      return poster;
    }

    const posterObj = movie.images.find(
      (item) => item && typeof item.url === "string"
    );

    if (posterObj) {
      return posterObj.url;
    }
  }

  return null;
}

export default function MovieGrid({ movies = [] }) {
  if (!movies.length) {
    return null;
  }

  return (
    <div className="movies-grid">
      {movies.map((movie = {}) => {
        const poster = pickPoster(movie);
        const cardKey = movie.id || movie.movieId || movie.name;
        const duration = movie.duration || movie.length || movie.runtime;

        return (
          <div key={cardKey} className="movie-card">
            <div className={`movie-poster ${poster ? "has-image" : ""}`.trim()}>
              {poster ? (
                <img
                  src={poster}
                  alt={movie.name ? `Poster phim ${movie.name}` : ""}
                  loading="lazy"
                />
              ) : null}
              {movie.ageRating ? (
                <div className="quality-badge">{movie.ageRating}</div>
              ) : null}
            </div>
            <div className="movie-info">
              <h4>{movie.name}</h4>
              {duration ? (
                <p className="movie-runtime">Thời lượng: {duration} phút</p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
