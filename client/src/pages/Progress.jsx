import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Timer, Dumbbell, Target, Trash2 } from 'lucide-react';
import { api } from '../services/api.js';
import { PageHead, Spinner, ErrorMessage, SuccessMessage, EmptyState, Field } from '../components/UI.jsx';
import { todayISO, formatDate, quoteOfTheDay } from '../utils/helpers.js';

function Chart({ data, metric }) {
  const max = Math.max(1, ...data.map((d) => d[metric]));
  return (
    <div className={`chart ${data.length > 14 ? 'dense' : ''}`} role="img" aria-label={`Bar chart of daily ${metric}`}>
      {data.map((d) => (
        <div className="col" key={d.date} title={`${formatDate(d.date)}: ${d[metric]}`}>
          <i className={d[metric] === 0 ? 'zero' : ''} style={{ height: `${(d[metric] / max) * 100}%` }} />
          <span>{new Date(`${d.date}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short' })}</span>
        </div>
      ))}
    </div>
  );
}

const emptyForm = { title: '', minutes: '', calories: '', waterMl: '', date: todayISO() };

export default function Progress() {
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState(null);
  const [days, setDays] = useState(7);
  const [metric, setMetric] = useState('minutes');
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    const today = todayISO();
    try {
      const [s, h, a] = await Promise.all([
        api.get(`/progress/summary?today=${today}`),
        api.get(`/progress/history?days=${days}&today=${today}`),
        api.get('/activities?limit=30'),
      ]);
      setSummary(s); setHistory(h); setItems(a);
    } catch (e) { setError(e.message); }
  }, [days]);

  useEffect(() => { load(); }, [load]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const numOrUndef = (v) => (v === '' ? undefined : Number(v));

  async function submit(e) {
    e.preventDefault();
    if (saving) return;
    setError(''); setMessage(''); setFieldErrors({});
    setSaving(true);
    try {
      await api.post('/activities', {
        date: form.date,
        title: form.title.trim() || undefined,
        minutes: numOrUndef(form.minutes),
        calories: numOrUndef(form.calories),
        waterMl: numOrUndef(form.waterMl),
        clientRequestId: crypto.randomUUID(),
      });
      setForm({ ...emptyForm, date: form.date });
      setMessage(`Activity added. ${quoteOfTheDay(5)}`);
      await load();
    } catch (err) {
      setError(err.message); setFieldErrors(err.errors || {});
    } finally { setSaving(false); }
  }

  async function remove(id) {
    if (!window.confirm('Delete this activity? This cannot be undone.')) return;
    try { await api.del(`/activities/${id}`); await load(); } catch (e) { setError(e.message); }
  }

  if (!summary && !error) return <Spinner />;
  const noData = summary && summary.total.sessions === 0 && summary.total.waterMl === 0;

  return (
    <>
      <PageHead title="Your progress">Log what you did today and watch the picture build up. Progress over perfection.</PageHead>
      <div className="container" style={{ paddingBottom: '4rem' }}>
        <ErrorMessage>{error}</ErrorMessage>
        {summary && (
          <div className="grid grid-4" style={{ marginBottom: '2rem' }}>
            <div className="card stat"><Dumbbell className="icon" aria-hidden="true" /><div className="stat-num">{summary.total.sessions}</div><div className="stat-label">workouts completed</div></div>
            <div className="card stat"><Timer className="icon" aria-hidden="true" /><div className="stat-num">{summary.total.minutes}</div><div className="stat-label">total workout minutes</div></div>
            <div className="card stat"><Flame className="icon" aria-hidden="true" /><div className="stat-num">{summary.streak}</div><div className="stat-label">day streak (workout days in a row)</div></div>
            <div className="card stat"><Target className="icon" aria-hidden="true" /><div className="stat-num">{summary.goalCompletion.percent}%</div><div className="stat-label">average goal completion — <Link to="/goals">goals</Link></div></div>
          </div>
        )}

        <div className="two-col">
          <section className="card" aria-labelledby="add-h">
            <h3 id="add-h">Add activity</h3>
            <SuccessMessage>{message}</SuccessMessage>
            <form onSubmit={submit} noValidate>
              <Field label="Date" id="date" error={fieldErrors.date}><input id="date" type="date" value={form.date} max={todayISO()} onChange={set('date')} required /></Field>
              <Field label="Name (optional)" id="title" error={fieldErrors.title}><input id="title" value={form.title} onChange={set('title')} maxLength={80} placeholder="Evening run" /></Field>
              <div className="form-row">
                <Field label="Workout minutes" id="minutes" error={fieldErrors.minutes}><input id="minutes" type="number" min="0" max="600" inputMode="numeric" value={form.minutes} onChange={set('minutes')} aria-invalid={!!fieldErrors.minutes} /></Field>
                <Field label="Water (ml)" id="water" error={fieldErrors.waterMl}><input id="water" type="number" min="0" max="10000" step="50" inputMode="numeric" value={form.waterMl} onChange={set('waterMl')} aria-invalid={!!fieldErrors.waterMl} /></Field>
              </div>
              <Field label="Calories (optional estimate)" id="cal" error={fieldErrors.calories} hint="Estimates only. Real energy use varies."><input id="cal" type="number" min="0" max="5000" inputMode="numeric" value={form.calories} onChange={set('calories')} /></Field>
              <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Add activity'}</button>
            </form>
          </section>

          <section className="card" aria-labelledby="chart-h">
            <h3 id="chart-h">Activity over time</h3>
            <div className="btn-row" style={{ marginBottom: '.5rem' }}>
              <div className="seg" role="group" aria-label="Date range">
                {[7, 30, 90].map((d) => <button key={d} aria-pressed={days === d} onClick={() => setDays(d)}>{d} days</button>)}
              </div>
              <div className="seg" role="group" aria-label="Metric">
                {[['minutes', 'Minutes'], ['waterMl', 'Water'], ['calories', 'Calories']].map(([k, l]) => <button key={k} aria-pressed={metric === k} onClick={() => setMetric(k)}>{l}</button>)}
              </div>
            </div>
            {history && <Chart data={history} metric={metric} />}
            <p className="muted small">{metric === 'minutes' ? 'Workout minutes per day.' : metric === 'waterMl' ? 'Millilitres of water per day.' : 'Estimated calories per day.'} Week so far: {summary?.week.minutes ?? 0} min over {summary?.week.sessions ?? 0} workouts.</p>
          </section>
        </div>

        <section style={{ marginTop: '2rem' }} aria-labelledby="hist-h">
          <h2 id="hist-h">History</h2>
          {noData || (items && items.length === 0) ? (
            <EmptyState title="Nothing logged yet" actionTo="/workouts" actionLabel="Browse workouts">Your first entry starts the story. Add an activity above or complete a workout. {quoteOfTheDay(1)}</EmptyState>
          ) : items && (
            <div className="card">
              <ul className="history">
                {items.map((a) => (
                  <li key={a.id}>
                    <div><b>{a.title}</b><div className="muted small">{formatDate(a.date)}</div></div>
                    <div className="muted">{a.minutes > 0 && `${a.minutes} min`}{a.waterMl > 0 && ` ${a.minutes > 0 ? '· ' : ''}${a.waterMl} ml water`}{a.calories > 0 && ` · ~${a.calories} kcal`}</div>
                    <button className="btn btn-danger btn-sm" onClick={() => remove(a.id)} aria-label={`Delete ${a.title} on ${formatDate(a.date)}`}><Trash2 size={14} aria-hidden="true" /> Delete</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
