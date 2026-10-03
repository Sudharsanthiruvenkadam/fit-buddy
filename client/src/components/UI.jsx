import { Link } from 'react-router-dom';

export function ProgressBar({ percent, label, tone = '' }) {
  const p = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div className={`bar ${tone}`} role="progressbar" aria-valuenow={p} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <span style={{ width: `${p}%` }} />
    </div>
  );
}

export const Spinner = () => <div className="spinner" role="status" aria-label="Loading" />;

export const ErrorMessage = ({ children }) => (children ? <div className="alert alert-error" role="alert">{children}</div> : null);
export const SuccessMessage = ({ children }) => (children ? <div className="alert alert-success celebrate" role="status">{children}</div> : null);

export function EmptyState({ title, children, actionTo, actionLabel, onAction }) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      <p className="muted">{children}</p>
      {actionTo && <Link to={actionTo} className="btn btn-primary">{actionLabel}</Link>}
      {onAction && <button className="btn btn-primary" onClick={onAction}>{actionLabel}</button>}
    </div>
  );
}

export function Field({ label, id, error, children, hint }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && <span className="muted small">{hint}</span>}
      {error && <span className="err" id={`${id}-err`}>{error}</span>}
    </div>
  );
}

export const PageHead = ({ title, children }) => (
  <div className="page-head container">
    <h1 style={{ fontSize: 'clamp(2.4rem,6vw,4rem)' }}>{title}</h1>
    {children && <p>{children}</p>}
  </div>
);
