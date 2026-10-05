import { useState } from 'react';
import { ArrowRight, Boxes, Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { login, register, errorMessage } from '../api.js';

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setNotice(''); setBusy(true);
    try {
      if (mode === 'register') {
        await register(form);
        setNotice('Account created. You can now log in.');
        setMode('login');
      } else {
        onLogin(await login(form.username, form.password));
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-visual">
        <img className="auth-photo" src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1800&q=85" alt="Organized warehouse shelves and inventory" />
        <div className="visual-topline"><a className="brand brand-light" href="#"><span className="brand-mark"><Boxes size={21} /></span>Northstar <span className="visual-brand-tail">/ Stockroom</span></a><span className="visual-live"><span className="live-dot" /> STOCKROOM ACCESS</span></div>
        <div className="visual-copy"><span className="visual-index">01 — INVENTORY, IN FOCUS</span><h1>Good operations<br />start with a clear view.</h1><p>One calm place to check what’s in stock, spot what needs attention, and keep your catalog moving.</p></div>
        <div className="visual-bottom"><span>PRODUCT OPERATIONS</span><span>PHILIPPINES <i /> EST. 2026</span></div>
      </section>

      <section className="auth-panel">
        <div className="mobile-brand"><span className="brand-mark"><Boxes size={20} /></span>Northstar <span>/ Stockroom</span></div>
        <div className="auth-content">
          <div className="auth-kicker"><LockKeyhole size={15} /> SECURE WORKSPACE</div>
          <h2>{mode === 'login' ? 'Welcome back.' : 'Create your account.'}</h2>
          <p className="auth-intro">{mode === 'login' ? 'Sign in to continue to your inventory.' : 'Set up access to the product stockroom.'}</p>

          {error && <div className="alert error">{error}</div>}
          {notice && <div className="alert success">{notice}</div>}

          <form className="auth-form" onSubmit={submit}>
            <label>Username
              <input value={form.username} onChange={set('username')} required autoFocus autoComplete="username" placeholder="Your username" />
            </label>
            {mode === 'register' && (
              <label>Email address
                <input type="email" value={form.email} onChange={set('email')} required autoComplete="email" placeholder="you@example.com" />
              </label>
            )}
            <label>Password
              <span className="password-wrap"><input type={showPassword ? 'text' : 'password'} value={form.password} onChange={set('password')} required minLength={6} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder="At least 6 characters" /><button type="button" className="password-toggle" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span>
            </label>
            <button className="auth-submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? <>Sign in <ArrowRight size={17} /></> : <>Create account <ArrowRight size={17} /></>}</button>
          </form>

          <p className="auth-switch">{mode === 'login' ? 'New to the stockroom?' : 'Already have access?'} <button onClick={() => { setError(''); setNotice(''); setShowPassword(false); setMode(mode === 'login' ? 'register' : 'login'); }}>{mode === 'login' ? 'Create an account' : 'Sign in'}</button></p>
        </div>
        <footer className="auth-footer"><span>© 2026 NORTHSTAR</span><span>INVENTORY MANAGEMENT</span></footer>
      </section>
    </main>
  );
}
