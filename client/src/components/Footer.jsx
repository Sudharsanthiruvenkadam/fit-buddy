import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Logo onDark />
            <p style={{ marginTop: '1rem', maxWidth: '42ch' }}>
              Fit Buddy keeps your workouts simple, your goals clear, and your progress easy to follow.
            </p>
          </div>
          <div>
            <h3>Explore</h3>
            <ul>
              <li><Link to="/workouts">Workouts</Link></li>
              <li><Link to="/plans">Plans</Link></li>
              <li><Link to="/progress">Progress</Link></li>
              <li><Link to="/goals">Goals</Link></li>
            </ul>
          </div>
          <div>
            <h3>Help</h3>
            <ul>
              <li><Link to="/contact">Contact us</Link></li>
              <li><Link to="/register">Create an account</Link></li>
              <li><Link to="/login">Log in</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-base">
          Stronger Together. Fitter Forever. Fit Buddy offers general fitness information, not medical advice. Check with a health professional before starting a new exercise programme.
        </div>
      </div>
    </footer>
  );
}
