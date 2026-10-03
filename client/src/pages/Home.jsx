import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, ListChecks, Target, TrendingUp, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { ProgressBar } from '../components/UI.jsx';
import { quoteOfTheDay, todayISO } from '../utils/helpers.js';

// Reference daily targets for the preview card (shown to the user on the card itself)
const TARGETS = { minutes: 45, calories: 400, waterMl: 2000 };
const DEMO = { goal: 72, minutes: 32, calories: 280, waterMl: 1400 };

function Ring({ percent }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  return (
    <svg className="ring" viewBox="0 0 118 118" role="img" aria-label={`Goal completion ${percent} percent`}>
      <circle className="ring-bg" cx="59" cy="59" r={r} fill="none" strokeWidth="11" />
      <circle className="ring-fg" cx="59" cy="59" r={r} fill="none" strokeWidth="11" strokeDasharray={c} strokeDashoffset={c * (1 - percent / 100)} transform="rotate(-90 59 59)" />
      <text className="ring-num" x="59" y="62" textAnchor="middle">{percent}%</text>
      <text className="ring-label" x="59" y="80" textAnchor="middle">of goals</text>
    </svg>
  );
}

function TodayCard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!user) return setData(null);
    api.get(`/progress/summary?today=${todayISO()}`).then(setData).catch(() => setData(null));
  }, [user]);

  const live = user && data;
  const v = live
    ? { goal: data.goalCompletion.percent, minutes: data.today.minutes, calories: data.today.calories, waterMl: data.today.waterMl }
    : DEMO;

  const rows = [
    ['Workout minutes', v.minutes, TARGETS.minutes, `${v.minutes} / ${TARGETS.minutes} min`],
    ['Calories (estimate)', v.calories, TARGETS.calories, `${v.calories} / ${TARGETS.calories} kcal`],
    ['Water intake', v.waterMl, TARGETS.waterMl, `${v.waterMl} / ${TARGETS.waterMl} ml`],
  ];

  return (
    <aside className="today-card" aria-label="Today's activity">
      <div className="today-head">
        <h2>Today’s Activity</h2>
        <span className={`pill ${live ? 'live' : 'demo'}`}>{live ? 'Your data' : 'Demo preview'}</span>
      </div>
      <div className="ring-wrap">
        <Ring percent={v.goal} />
        <p style={{ margin: 0, color: 'var(--grey)', fontSize: '.95rem' }}>
          {live
            ? data.goalCompletion.total === 0 ? 'Create a goal to see your completion here.' : `${data.goalCompletion.completed} of ${data.goalCompletion.total} goals complete.`
            : 'Sample numbers to show how your day looks. Log in to see your own.'}
        </p>
      </div>
      {rows.map(([label, val, target, text]) => (
        <div className="metric" key={label}>
          <div className="metric-top"><span>{label}</span><span>{text}</span></div>
          <ProgressBar percent={(val / target) * 100} label={label} />
        </div>
      ))}
      <p className="today-note">Daily reference targets. Calories are estimates; real energy use varies from person to person.</p>
    </aside>
  );
}

function Quote() {
  const [offset, setOffset] = useState(0);
  return (
    <div className="quote-card">
      <p aria-live="polite">{quoteOfTheDay(offset)}</p>
      <button className="btn btn-ghost btn-sm" onClick={() => setOffset((o) => o + 1)}>
        <RefreshCw size={16} aria-hidden="true" /> Another one
      </button>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    Promise.all([api.get('/workouts'), api.get('/plans')])
      .then(([w, p]) => setCounts({ workouts: w.length, plans: p.length }))
      .catch(() => setCounts(null));
  }, []);

  const features = [
    [Dumbbell, 'Workout library', 'Browse routines by category and difficulty, with clear step-by-step instructions.', '/workouts'],
    [ListChecks, 'Fitness plans', 'Pick a simple weekly plan and keep your current plan in one place.', '/plans'],
    [Target, 'Goals that update themselves', 'Set minutes, sessions or water targets. Progress comes from what you log.', '/goals'],
    [TrendingUp, 'Progress you can read', 'Daily totals, weekly charts and a streak that counts real workout days.', '/progress'],
  ];

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <h1>Build a <span>stronger you.</span></h1>
            <p className="lead">Fit Buddy keeps your workouts simple, your goals clear, and your progress easy to follow.</p>
            <div className="btn-row">
              <Link to="/workouts" className="btn btn-primary">Explore Workouts</Link>
              <Link to="/plans" className="btn btn-ghost">View Plans</Link>
            </div>
            <p className="hero-tag">Stronger Together. Fitter Forever.</p>
          </div>
          <TodayCard />
        </div>
      </section>

      {counts && (
        <section className="section-tight container" aria-label="Library size">
          <div className="grid grid-4">
            <div className="card stat"><div className="stat-num">{counts.workouts}</div><div className="stat-label">workouts in the library</div></div>
            <div className="card stat"><div className="stat-num">{counts.plans}</div><div className="stat-label">fitness plans to choose from</div></div>
            <div className="card stat"><div className="stat-num">5</div><div className="stat-label">workout categories, from core to HIIT</div></div>
          </div>
        </section>
      )}

      <section className="container" style={{ paddingBottom: '3rem' }}>
        <Quote />
      </section>

      <section className="container" style={{ paddingBottom: '4.5rem' }}>
        <h2>Everything you need to keep showing up</h2>
        <div className="grid grid-4">
          {features.map(([Icon, title, text, to]) => (
            <Link key={title} to={to} className="card lift" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Icon color="#137a53" size={30} aria-hidden="true" />
              <h3 style={{ marginTop: '.75rem' }}>{title}</h3>
              <p className="muted" style={{ margin: 0 }}>{text}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="container" style={{ paddingBottom: '5rem' }}>
        <div className="cta-band">
          <h2>Ready to get started?</h2>
          <p>Join a healthier routine and start building stronger habits with Fit Buddy.</p>
          <Link to={user ? '/workouts' : '/register'} className="btn btn-lime">Start Training</Link>
        </div>
      </section>
    </>
  );
}
