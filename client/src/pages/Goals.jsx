import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { PageHead, Spinner, ErrorMessage, SuccessMessage, EmptyState, Field, ProgressBar } from '../components/UI.jsx';
import { todayISO, formatDate } from '../utils/helpers.js';

const TYPES = [
  ['minutes', 'Exercise minutes', 'min'],
  ['sessions', 'Workout sessions', 'sessions'],
  ['water', 'Water intake', 'ml'],
  ['custom', 'Custom (I update it myself)', ''],
];
const blank = () => ({ title: '', description: '', type: 'minutes', targetValue: '', unit: '', startDate: todayISO(), deadline: '' });

export default function Goals() {
  const [goals, setGoals] = useState(null);
  const [form, setForm] = useState(blank());
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => api.get(`/goals?today=${todayISO()}`).then(setGoals).catch((e) => { setError(e.message); setGoals([]); }), []);
  useEffect(() => { load(); }, [load]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    if (saving) return;
    setSaving(true); setError(''); setMessage(''); setErrors({});
    const body = {
      title: form.title, description: form.description, type: form.type,
      targetValue: form.targetValue === '' ? undefined : Number(form.targetValue),
      unit: form.type === 'custom' ? form.unit || undefined : undefined,
      startDate: form.startDate, deadline: form.deadline || null,
    };
    try {
      if (editingId) await api.patch(`/goals/${editingId}?today=${todayISO()}`, body);
      else await api.post(`/goals?today=${todayISO()}`, body);
      setMessage(editingId ? 'Goal updated.' : 'Goal created. Small wins. Big changes.');
      setForm(blank()); setEditingId(null);
      await load();
    } catch (err) { setError(err.message); setErrors(err.errors || {}); } finally { setSaving(false); }
  }

  function edit(g) {
    setEditingId(g.id);
    setForm({ title: g.title, description: g.description || '', type: g.type, targetValue: g.targetValue, unit: g.type === 'custom' ? g.unit : '', startDate: g.startDate, deadline: g.deadline || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function patch(g, body, ok) {
    setError(''); setMessage('');
    try { await api.patch(`/goals/${g.id}?today=${todayISO()}`, body); if (ok) setMessage(ok); await load(); } catch (e) { setError(e.message); }
  }

  async function remove(g) {
    if (!window.confirm(`Delete the goal “${g.title}”?`)) return;
    try { await api.del(`/goals/${g.id}`); if (editingId === g.id) { setEditingId(null); setForm(blank()); } await load(); } catch (e) { setError(e.message); }
  }

  async function updateManual(g, e) {
    e.preventDefault();
    const v = Number(new FormData(e.target).get('value'));
    if (Number.isNaN(v) || v < 0) return setError('Enter a value of 0 or more.');
    patch(g, { manualValue: v }, 'Progress updated.');
  }

  const statusTag = (s) => (s === 'completed' ? <span className="tag dark">Completed</span> : s === 'overdue' ? <span className="tag orange">Overdue</span> : <span className="tag">In progress</span>);

  return (
    <>
      <PageHead title="Your goals">Set a target you can measure. Minutes, sessions and water update automatically from your logged activity.</PageHead>
      <div className="container" style={{ paddingBottom: '4rem' }}>
        <div className="two-col">
          <section aria-labelledby="goals-h">
            <h2 id="goals-h">Current goals</h2>
            <ErrorMessage>{error}</ErrorMessage>
            <SuccessMessage>{message}</SuccessMessage>
            {goals === null ? <Spinner /> : goals.length === 0 ? (
              <EmptyState title="No goals yet">Create your first goal with the form. Start where you are.</EmptyState>
            ) : (
              <div className="grid">
                {goals.map((g) => (
                  <article className="card" key={g.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '.5rem', flexWrap: 'wrap' }}>
                      <h3>{g.title}</h3>{statusTag(g.status)}
                    </div>
                    {g.description && <p className="muted">{g.description}</p>}
                    <p style={{ margin: '.25rem 0' }}><b>{g.currentValue}</b> of {g.targetValue} {g.unit} ({g.percent}%)</p>
                    <ProgressBar percent={g.percent} label={`${g.title} progress`} tone={g.status === 'completed' ? 'done' : g.status === 'overdue' ? 'orange' : ''} />
                    <p className="muted small" style={{ marginTop: '.5rem' }}>From {formatDate(g.startDate)}{g.deadline && ` · due ${formatDate(g.deadline)}`}{g.type !== 'custom' && ' · tracked from your activity log'}</p>
                    {g.type === 'custom' && !g.completedAt && (
                      <form onSubmit={(e) => updateManual(g, e)} className="btn-row" style={{ alignItems: 'end', marginBottom: '.75rem' }}>
                        <div className="field" style={{ margin: 0, flex: '0 1 140px' }}><label htmlFor={`v-${g.id}`}>Current value</label><input id={`v-${g.id}`} name="value" type="number" min="0" defaultValue={g.manualValue} /></div>
                        <button className="btn btn-ghost btn-sm">Update progress</button>
                      </form>
                    )}
                    <div className="btn-row">
                      {g.completedAt
                        ? <button className="btn btn-ghost btn-sm" onClick={() => patch(g, { completed: false })}>Reopen</button>
                        : <button className="btn btn-primary btn-sm" onClick={() => patch(g, { completed: true }, 'Goal marked complete. Every rep counts!')}>Mark complete</button>}
                      <button className="btn btn-ghost btn-sm" onClick={() => edit(g)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => remove(g)}>Delete</button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="card" aria-labelledby="form-h" style={{ position: 'sticky', top: '84px' }}>
            <h3 id="form-h">{editingId ? 'Edit goal' : 'New goal'}</h3>
            <form onSubmit={submit} noValidate>
              <Field label="Title" id="g-title" error={errors.title}><input id="g-title" value={form.title} onChange={set('title')} maxLength={80} aria-invalid={!!errors.title} placeholder="150 minutes this week" /></Field>
              <Field label="What are you tracking?" id="g-type"><select id="g-type" value={form.type} onChange={set('type')}>{TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
              <div className="form-row">
                <Field label="Target" id="g-target" error={errors.targetValue}><input id="g-target" type="number" min="1" value={form.targetValue} onChange={set('targetValue')} aria-invalid={!!errors.targetValue} /></Field>
                {form.type === 'custom'
                  ? <Field label="Unit" id="g-unit" error={errors.unit}><input id="g-unit" value={form.unit} onChange={set('unit')} maxLength={20} placeholder="km, kg, pages…" /></Field>
                  : <Field label="Unit" id="g-unit-ro"><input id="g-unit-ro" value={TYPES.find((t) => t[0] === form.type)[2]} readOnly /></Field>}
              </div>
              <div className="form-row">
                <Field label="Start date" id="g-start" error={errors.startDate}><input id="g-start" type="date" value={form.startDate} onChange={set('startDate')} /></Field>
                <Field label="Deadline (optional)" id="g-dead" error={errors.deadline}><input id="g-dead" type="date" value={form.deadline} min={form.startDate} onChange={set('deadline')} aria-invalid={!!errors.deadline} /></Field>
              </div>
              <Field label="Notes (optional)" id="g-desc" error={errors.description}><textarea id="g-desc" rows={2} maxLength={300} value={form.description} onChange={set('description')} /></Field>
              <div className="btn-row">
                <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : editingId ? 'Save changes' : 'Create goal'}</button>
                {editingId && <button type="button" className="btn btn-ghost" onClick={() => { setEditingId(null); setForm(blank()); }}>Cancel</button>}
              </div>
            </form>
          </section>
        </div>
      </div>
    </>
  );
}
