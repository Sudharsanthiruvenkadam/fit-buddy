import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Spinner, ErrorMessage, SuccessMessage } from '../components/UI.jsx';
import { todayISO, quoteOfTheDay } from '../utils/helpers.js';

export default function WorkoutDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const location = useLocation();
  const [w, setW] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const requestId = useRef(crypto.randomUUID()); // same id on retries => server won't double-count

  useEffect(() => {
    api.get(`/workouts/${id}`).then(setW).catch((e) => setError(e.message));
  }, [id]);

  async function complete() {
    setSaving(true);
    setError('');
    try {
      await api.post('/activities', { date: todayISO(), workout: w._id, minutes: w.durationMinutes, clientRequestId: requestId.current });
      setDone(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (error && !w) return <div className="container section"><ErrorMessage>{error}</ErrorMessage><Link to="/workouts">Back to workouts</Link></div>;
  if (!w) return <Spinner />;

  return (
    <div className="container section">
      <Link to="/workouts">← All workouts</Link>
      <h1 style={{ fontSize: 'clamp(2.4rem,6vw,4rem)', marginTop: '.5rem' }}>{w.name}</h1>
      <div className="card-meta">
        <span className="tag">{w.category}</span><span className="tag orange">{w.difficulty}</span><span className="tag">{w.durationMinutes} min</span>
      </div>
      <div className="two-col">
        <div>
          <p>{w.description}</p>
          <h3>How to do it</h3>
          <ol className="steps">{w.instructions.map((s, i) => <li key={i}>{s}</li>)}</ol>
          <p className="muted small">Move at your own pace and stop if something hurts. This is general information, not advice tailored to you.</p>
        </div>
        <aside className="card">
          <h3>Details</h3>
          <p><b>Equipment:</b> {w.equipment.join(', ') || 'None'}</p>
          <p><b>Muscles worked:</b> {w.muscleGroups.join(', ')}</p>
          <p className="muted small">Estimated burn: about {Math.round(w.caloriesPerMinute * w.durationMinutes)} kcal. This is a rough estimate — actual use varies.</p>
          <ErrorMessage>{error}</ErrorMessage>
          {done ? (
            <SuccessMessage><CheckCircle2 size={16} aria-hidden="true" /> Workout logged. {quoteOfTheDay(3)} <Link to="/progress">See progress</Link></SuccessMessage>
          ) : user ? (
            <button className="btn btn-primary" onClick={complete} disabled={saving}>{saving ? 'Saving…' : 'Mark as completed'}</button>
          ) : (
            <Link className="btn btn-primary" to="/login" state={{ from: location.pathname }}>Log in to record this workout</Link>
          )}
        </aside>
      </div>
    </div>
  );
}
