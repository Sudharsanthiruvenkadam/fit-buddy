import { useState } from 'react';
import { api } from '../services/api.js';
import { PageHead, ErrorMessage, SuccessMessage, Field } from '../components/UI.jsx';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setSaving(true); setError(''); setErrors({});
    try {
      await api.post('/contact', form);
      setSent(true); setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) { setError(err.message); setErrors(err.errors || {}); } finally { setSaving(false); }
  }

  return (
    <>
      <PageHead title="Contact">Questions or feedback about Fit Buddy? Send us a note.</PageHead>
      <div className="container" style={{ paddingBottom: '4rem', maxWidth: '680px' }}>
        <div className="card">
          <ErrorMessage>{error}</ErrorMessage>
          {sent && <SuccessMessage>Your message was received and saved. (It is stored in our database — it is not emailed, so replies are not guaranteed.)</SuccessMessage>}
          <form onSubmit={submit} noValidate>
            <Field label="Your name" id="c-name" error={errors.name}><input id="c-name" value={form.name} onChange={set('name')} maxLength={80} autoComplete="name" aria-invalid={!!errors.name} /></Field>
            <Field label="Email" id="c-email" error={errors.email}><input id="c-email" type="email" value={form.email} onChange={set('email')} maxLength={254} autoComplete="email" aria-invalid={!!errors.email} /></Field>
            <Field label="Subject (optional)" id="c-sub" error={errors.subject}><input id="c-sub" value={form.subject} onChange={set('subject')} maxLength={120} /></Field>
            <Field label="Message" id="c-msg" error={errors.message} hint={`${form.message.length}/2000`}><textarea id="c-msg" rows={6} value={form.message} onChange={set('message')} maxLength={2000} aria-invalid={!!errors.message} /></Field>
            <button className="btn btn-primary" disabled={saving}>{saving ? 'Sending…' : 'Send message'}</button>
          </form>
        </div>
      </div>
    </>
  );
}
