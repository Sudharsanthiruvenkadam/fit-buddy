import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { PageHead, Spinner, ErrorMessage, SuccessMessage, EmptyState } from '../components/UI.jsx';

export default function Plans() {
  const { user } = useAuth();
  const [plans, setPlans] = useState(null);
  const [currentId, setCurrentId] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get('/plans').then(setPlans).catch((e) => { setError(e.message); setPlans([]); });
  }, []);

  useEffect(() => {
    if (!user) return setCurrentId(null);
    api.get('/users/me/plan').then((p) => setCurrentId(p?._id || null)).catch(() => {});
  }, [user]);

  async function choose(planId) {
    setBusy(true); setError(''); setMessage('');
    try {
      await api.put('/users/me/plan', { planId });
      setCurrentId(planId);
      setMessage(planId ? 'Plan selected. It’s now your current plan.' : 'Plan removed.');
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }

  return (
    <>
      <PageHead title="Fitness plans">Simple weekly structures to follow. They are general guides, not individual medical or coaching advice — adjust them to suit you.</PageHead>
      <div className="container" style={{ paddingBottom: '4rem' }}>
        <ErrorMessage>{error}</ErrorMessage>
        <SuccessMessage>{message}</SuccessMessage>
        {plans === null ? <Spinner /> : plans.length === 0 && !error ? (
          <EmptyState title="No plans yet">Run <code>npm run seed</code> in the server folder to load the starter plans.</EmptyState>
        ) : (
          <div className="grid grid-3">
            {plans.map((p) => {
              const isCurrent = currentId === p._id;
              const open = openId === p._id;
              return (
                <article key={p._id} className="card">
                  <h3>{p.name} {isCurrent && <span className="tag dark">Current plan</span>}</h3>
                  <div className="card-meta">
                    <span className="tag orange">{p.difficulty}</span>
                    <span className="tag">{p.durationWeeks} weeks</span>
                    <span className="tag">{p.sessionsPerWeek} sessions/week</span>
                  </div>
                  <p><b>Aim:</b> {p.goal}. {p.description}</p>
                  {open && (
                    <ul className="schedule">
                      {p.schedule.map((s) => (
                        <li key={s.day}><b>{s.day}</b><span>{s.title}{s.workout && <> — <Link to={`/workouts/${s.workout._id}`}>{s.workout.name}</Link></>}</span></li>
                      ))}
                    </ul>
                  )}
                  <div className="btn-row" style={{ marginTop: '1rem' }}>
                    <button className="btn btn-ghost btn-sm" aria-expanded={open} onClick={() => setOpenId(open ? null : p._id)}>{open ? 'Hide schedule' : 'View schedule'}</button>
                    {user ? (
                      isCurrent
                        ? <button className="btn btn-danger btn-sm" disabled={busy} onClick={() => choose(null)}>Remove plan</button>
                        : <button className="btn btn-primary btn-sm" disabled={busy} onClick={() => choose(p._id)}>Select plan</button>
                    ) : <Link to="/login" state={{ from: '/plans' }} className="btn btn-primary btn-sm">Log in to select</Link>}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
