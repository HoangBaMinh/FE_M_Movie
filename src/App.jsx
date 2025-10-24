import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import MovieBrowser from "./components/MovieBrowser";
import MovieDetailPage from "./components/movie-browser/MovieDetailPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MovieBrowser />} />
      <Route path="/movies/:movieId" element={<MovieDetailPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
