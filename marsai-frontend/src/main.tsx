import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import Header from "./components/Header.tsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Agenda from "./pages/Agenda.tsx";
import SubmitMovie from "./pages/SubmitMovie.tsx";
import EventDetails from "./components/EventDetails.tsx";
import NotFound from "./pages/NotFound.tsx";
import Register from "./components/Dashboard/Register.tsx";
import Login from "./pages/Login.tsx";
import "./i18next";
import { AuthProvider } from "./context/AuthContext.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import MovieDetails from "./pages/MovieDetails.tsx";
import Galery from "./pages/Movies.tsx";
import MoviesJury from "./pages/MoviesJury.tsx";
import UnsubscribeSuccess from "./pages/UnsubscribeSuccess.tsx";
import UnbookEventSuccess from "./pages/UnbookEventSuccess.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename="/">
      <AuthProvider>
        <picture className="fixed inset-0 h-full w-full object-cover pointer-events-none">
          <source
            srcSet="/Scifi-Room.avif"
            media="(min-width: 0px)"
            type="image/avif"
          />
          <source
            srcSet="/Scifi-Room.webp"
            media="(min-width: 0px)"
            type="image/webp"
          />
          <img
            src="/Scifi-Room.png"
            alt="Vue d'une chambre d'hotel futuriste avec une femme, un chat et un taxi aérien"
            className="w-full h-full object-cover"
          />
        </picture>
        <div className="relative z-10 min-h-screen">
          <Header />
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/event/:id" element={<EventDetails />} />
            <Route path="/movies" element={<Galery />} />

            {/* Routes réservées au jury et aux administrateurs */}
            <Route element={<ProtectedRoute allowedRoles={["ADMIN", "JURY"]} />}>
              <Route path="/movies/jury" element={<MoviesJury />} />
              <Route path="/submit" element={<SubmitMovie />} />
            </Route>

            <Route path="/movies/:id" element={<MovieDetails />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

            {/* Routes réservées aux administrateurs */}
            <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>

            <Route
              path="/unsubscribed-success"
              element={<UnsubscribeSuccess />}
            />
            <Route path="/unbooked-success" element={<UnbookEventSuccess />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
