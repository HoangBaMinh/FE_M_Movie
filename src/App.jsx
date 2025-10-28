import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import MovieBrowser from "./components/movie-browser/MovieBrowser";
import MovieDetailPage from "./components/movie-detail/MovieDetailPage";
function App() {
  return (
    <Routes>
      <Route path="/" element={<MovieBrowser />} />
      <Route path="/movies/:movieSlug" element={<MovieDetailPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
