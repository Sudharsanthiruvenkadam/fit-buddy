import { Link } from 'react-router-dom';

export function LogoMark({ className = 'logo-mark' }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="#0B0D10" />
      <g fill="#C6FF00">
        <rect x="8" y="24" width="7" height="16" rx="2" />
        <rect x="17" y="19" width="7" height="26" rx="2" />
        <rect x="40" y="19" width="7" height="26" rx="2" />
        <rect x="49" y="24" width="7" height="16" rx="2" />
        <rect x="24" y="30" width="16" height="4" rx="2" />
      </g>
    </svg>
  );
}

export default function Logo({ onDark = false }) {
  return (
    <Link to="/" className={`logo ${onDark ? 'on-dark' : ''}`} aria-label="Fit Buddy home">
      <LogoMark />
      <span>FIT <b>BUDDY</b></span>
    </Link>
  );
}
