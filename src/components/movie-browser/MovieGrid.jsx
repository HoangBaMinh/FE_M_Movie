export default function MovieGrid({ movies = [] }) {
  if (!movies.length) {
    return null;
  }

  return (
    <div className="movies-grid">
      {movies.map((movie) => (
        <div key={movie.id} className="movie-card">
          <div className="movie-poster">
            <div className="quality-badge">{movie.quality || "HD"}</div>
          </div>
          <div className="movie-info">
            <h4>{movie.name}</h4>
            <p>{movie.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
