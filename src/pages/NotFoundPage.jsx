import React from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--mc-bg)', padding: '2rem', textAlign: 'center' }}>
      <Stethoscope size={48} color="var(--mc-accent)" style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
      <h1 style={{ fontFamily: 'var(--mc-font-heading)', fontSize: '5rem', fontWeight: 900, color: 'var(--mc-accent)', lineHeight: 1, marginBottom: '0.5rem' }}>404</h1>
      <h3 style={{ fontFamily: 'var(--mc-font-heading)', fontWeight: 700, marginBottom: '1rem' }}>Page Not Found</h3>
      <p style={{ color: 'var(--mc-text-muted)', marginBottom: '2rem' }}>The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="btn btn-primary px-5">Go Home</Link>
    </div>
  );
}
