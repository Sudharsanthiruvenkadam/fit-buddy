
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Protected from './components/Protected.jsx';

import Home from './pages/Home.jsx';
import Workouts from './pages/Workouts.jsx';
import WorkoutDetail from './pages/WorkoutDetail.jsx';
import Plans from './pages/Plans.jsx';
import Progress from './pages/Progress.jsx';
import Goals from './pages/Goals.jsx';
import Contact from './pages/Contact.jsx';
import { Login, Register } from './pages/Auth.jsx';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function NotFound() {
  return (
    <div
      className="container section"
      style={{ textAlign: 'center' }}
    >
      <h1>Page not found</h1>
      <p className="muted">
        That page does not exist. Let’s get you back on track.
      </p>

      <Link className="btn btn-primary" to="/">
        Go to Home
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <ScrollToTop />

      <Navbar />

      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/workouts" element={<Workouts />} />

          <Route
            path="/workouts/:id"
            element={<WorkoutDetail />}
          />

          <Route path="/plans" element={<Plans />} />

          <Route
            path="/progress"
            element={
              <Protected>
                <Progress />
              </Protected>
            }
          />

          <Route
            path="/goals"
            element={
              <Protected>
                <Goals />
              </Protected>
            }
          />

          <Route path="/contact" element={<Contact />} />

          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </>
  );
}