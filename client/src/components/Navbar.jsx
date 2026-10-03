import { useEffect, useState } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Logo from './Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const links = [
  ['/', 'Home'],
  ['/workouts', 'Workouts'],
  ['/plans', 'Plans'],
  ['/progress', 'Progress'],
  ['/goals', 'Goals'],
  ['/contact', 'Contact'],
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => setOpen(false), [location.pathname]);

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <header className="nav">
      <nav className="container nav-inner" aria-label="Main">
        <Logo />
        <button className="nav-toggle" aria-expanded={open} aria-controls="nav-links" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((o) => !o)}>
          {open ? <X /> : <Menu />}
        </button>
        <ul id="nav-links" className={`nav-links ${open ? 'open' : ''}`}>
          {links.map(([to, label]) => (
            <li key={to}>
              <NavLink to={to} end={to === '/'} className={({ isActive }) => (isActive ? 'active' : '')}>{label}</NavLink>
            </li>
          ))}
          {user ? (
            <>
              <li className="nav-user">Hi, {user.name.split(' ')[0]}</li>
              <li><button className="btn btn-ghost btn-sm" onClick={handleLogout}>Log out</button></li>
            </>
          ) : (
            <>
              <li><Link to="/login" className="btn btn-ghost btn-sm">Log in</Link></li>
              <li><Link to="/register" className="btn btn-primary btn-sm">Get Started</Link></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}
