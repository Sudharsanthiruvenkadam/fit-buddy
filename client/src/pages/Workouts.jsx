import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { api } from '../services/api.js';
import { PageHead, Spinner, ErrorMessage, EmptyState } from '../components/UI.jsx';

const CATEGORIES = ['Strength', 'Cardio', 'HIIT', 'Core', 'Flexibility'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export default function Workouts() {
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (category) params.set('category', category);
    if (difficulty) params.set('difficulty', difficulty);
    const t = setTimeout(() => {
      setError('');
      api.get(`/workouts?${params}`).then(setItems).catch((e) => { setError(e.message); setItems([]); });
    }, 250); // wait for the user to stop typing
    return () => clearTimeout(t);
  }, [q, category, difficulty]);

  const clear = () => { setQ(''); setCategory(''); setDifficulty(''); };
  const filtered = q || category || difficulty;

  return (
    <>
      <PageHead title="Workouts">Pick a routine that fits your level and your time. Every workout can be scaled up or down — start where you are.</PageHead>
      <div className="container" style={{ paddingBottom: '4rem' }}>
        <div className="filters" role="search">
          <div className="field"><label htmlFor="q">Search by name</label><input id="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. HIIT, dumbbell" maxLength={50} /></div>
          <div className="field"><label htmlFor="cat">Category</label>
            <select id="cat" value={category} onChange={(e) => setCategory(e.target.value)}><option value="">All categories</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div>
          <div className="field"><label htmlFor="lvl">Difficulty</label>
            <select id="lvl" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}><option value="">All levels</option>{LEVELS.map((c) => <option key={c}>{c}</option>)}</select></div>
          {filtered && <button className="btn btn-ghost btn-sm" style={{ marginBottom: '1rem' }} onClick={clear}>Clear filters</button>}
        </div>

        <ErrorMessage>{error}</ErrorMessage>
        {items === null ? <Spinner /> : items.length === 0 && !error ? (
          <EmptyState title="No workouts match" actionLabel="Clear filters" onAction={clear}>
            Try a different search or remove a filter. If the library is empty, run <code>npm run seed</code> in the server folder.
          </EmptyState>
        ) : (
          <div className="grid grid-3">
            {items.map((w) => (
              <Link to={`/workouts/${w._id}`} key={w._id} className="card lift" style={{ textDecoration: 'none', color: 'inherit' }}>
                <h3>{w.name}</h3>
                <div className="card-meta">
                  <span className="tag">{w.category}</span>
                  <span className="tag orange">{w.difficulty}</span>
                  <span className="tag"><Clock size={12} aria-hidden="true" /> {w.durationMinutes} min</span>
                </div>
                <p className="muted" style={{ margin: 0 }}>{w.description}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
