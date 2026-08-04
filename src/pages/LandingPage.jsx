import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Stethoscope, Calendar, FileText, Bell, Shield, Users,
  ChevronRight, Star, CheckCircle, ArrowRight, Heart,
  Clock, Activity, Award, Menu, X
} from 'lucide-react';
import { useState } from 'react';

/* ── Tiny intersection observer hook for scroll animations ── */
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

/* ── Animated counter ── */
function Counter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const [ref, visible] = useReveal();
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [visible, target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

const FEATURES = [
  { icon: Calendar,  color: '#8B1E1E', title: 'Smart Scheduling',      desc: 'Book appointments with real-time availability. Doctors set their slots, patients pick their time.' },
  { icon: FileText,  color: '#1d4ed8', title: 'Digital Records',       desc: 'All consultation notes, prescriptions, and diagnoses stored securely in one place.' },
  { icon: Bell,      color: '#b45309', title: 'Instant Notifications',  desc: 'Appointment reminders, approval alerts, and updates delivered automatically.' },
  { icon: Shield,    color: '#15803d', title: 'Secure & Private',       desc: 'Role-based access, encrypted sessions, and HIPAA-inspired data handling.' },
  { icon: Users,     color: '#7e22ce', title: 'Multi-Role Platform',    desc: 'Built for Administrators, Doctors, and Patients — each with a tailored experience.' },
  { icon: Activity,  color: '#0891b2', title: 'Analytics & Reports',    desc: 'Admins get rich reports on appointments, consultations, departments, and more.' },
];

const STEPS = [
  { step: '01', title: 'Register',             desc: 'Create your account as a Patient or Doctor in under 2 minutes.' },
  { step: '02', title: 'Choose a Specialist',  desc: 'Browse departments, select a doctor, and see their real-time availability.' },
  { step: '03', title: 'Book Your Slot',        desc: 'Pick a date and time, add your reason, and confirm instantly.' },
  { step: '04', title: 'Get Your Consultation', desc: 'Attend your appointment and receive digital notes, prescriptions, and follow-up care.' },
];

const TESTIMONIALS = [
  { name: 'Sarah Mensah',       role: 'Patient',            avatar: 'SM', text: 'Booking an appointment used to take 30 minutes on the phone. Now it takes 30 seconds. Absolutely brilliant.' },
  { name: 'Dr. Kwame Asante',   role: 'Cardiologist',       avatar: 'KA', text: "My schedule is organised, patient records are at my fingertips, and I can focus on what matters — my patients." },
  { name: 'Abena Osei-Bonsu',   role: 'Patient',            avatar: 'AO', text: 'The consultation history feature is a game changer. I can see every prescription I\'ve ever received.' },
  { name: 'Dr. Ama Frimpong',   role: 'General Practitioner',avatar: 'AF', text: 'The schedule management is incredibly intuitive. I\'ve cut administrative work by half since switching.' },
];

const STATS = [
  { value: 5000,  suffix: '+', label: 'Patients Registered' },
  { value: 320,   suffix: '+', label: 'Qualified Doctors' },
  { value: 28,    suffix: '',  label: 'Specialisations' },
  { value: 99,    suffix: '%', label: 'Satisfaction Rate' },
];

export default function LandingPage() {
  const [navOpen, setNavOpen] = useState(false);
  const [heroRef, heroVisible] = useReveal();
  const [featRef, featVisible] = useReveal();
  const [stepsRef, stepsVisible] = useReveal();
  const [testRef, testVisible] = useReveal();
  
  useEffect(() => {
    document.title = `Home - ${import.meta.env.VITE_APP_NAME}`;
  }, [])

  return (
    <div style={{ background: 'var(--mc-bg)', color: 'var(--mc-text)', overflowX: 'hidden' }}>

      {/* ── Navbar ── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--mc-border)', padding: '0.85rem 0' }}>
        <div className="container d-flex align-items-center justify-content-between">
          <Link to="/" className="text-decoration-none d-flex align-items-center gap-2">
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--mc-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Stethoscope size={18} color="#fff" />
            </div>
            <span style={{ fontFamily: 'var(--mc-font-heading)', fontWeight: 700, fontSize: '1.15rem', color: 'var(--mc-text)' }}>Mediconnect</span>
          </Link>

          {/* Desktop nav */}
          <div className="d-none d-md-flex align-items-center gap-4">
            <a href="#features"    style={{ color: 'var(--mc-text-secondary)', fontSize: '0.88rem', fontWeight: 500, textDecoration: 'none' }}>Features</a>
            <a href="#how-it-works" style={{ color: 'var(--mc-text-secondary)', fontSize: '0.88rem', fontWeight: 500, textDecoration: 'none' }}>How It Works</a>
            <a href="#testimonials" style={{ color: 'var(--mc-text-secondary)', fontSize: '0.88rem', fontWeight: 500, textDecoration: 'none' }}>Testimonials</a>
            <Link to="/login" className="btn btn-outline-primary btn-sm px-4">Sign In</Link>
            <Link to="/register" className="btn btn-primary btn-sm px-4">Get Started</Link>
          </div>

          {/* Mobile hamburger */}
          <button className="d-md-none" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }} onClick={() => setNavOpen(p => !p)}>
            {navOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {navOpen && (
          <div className="container d-md-none pt-3 pb-2">
            <div className="d-flex flex-column gap-2">
              <a href="#features"     className="py-2" style={{ color: 'var(--mc-text)', fontSize: '0.9rem', textDecoration: 'none' }} onClick={() => setNavOpen(false)}>Features</a>
              <a href="#how-it-works" className="py-2" style={{ color: 'var(--mc-text)', fontSize: '0.9rem', textDecoration: 'none' }} onClick={() => setNavOpen(false)}>How It Works</a>
              <a href="#testimonials" className="py-2" style={{ color: 'var(--mc-text)', fontSize: '0.9rem', textDecoration: 'none' }} onClick={() => setNavOpen(false)}>Testimonials</a>
              <Link to="/login"    className="btn btn-outline-primary btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight: '100vh', paddingTop: '80px', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: '-15%', right: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,30,30,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '-8%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(29,78,216,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="container py-5">
          <div className="row align-items-center g-5">
            {/* Copy */}
            <div className="col-12 col-lg-6" ref={heroRef} style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'none' : 'translateY(32px)', transition: 'opacity .7s ease, transform .7s ease' }}>
              <div className="d-inline-flex align-items-center gap-2 mb-4 px-3 py-2" style={{ background: 'var(--mc-accent-light)', borderRadius: 100, border: '1px solid rgba(139,30,30,0.15)' }}>
                <Heart size={14} color="var(--mc-accent)" />
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--mc-accent)', letterSpacing: '0.04em' }}>Healthcare, Reimagined</span>
              </div>

              <h1 style={{ fontFamily: 'var(--mc-font-heading)', fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.25rem', color: 'var(--mc-text)' }}>
                Your Health,<br />
                <span style={{ color: 'var(--mc-accent)', fontStyle: 'italic' }}>One Platform.</span>
              </h1>

              <p style={{ fontSize: '1.05rem', color: 'var(--mc-text-secondary)', lineHeight: 1.8, maxWidth: 480, marginBottom: '2rem' }}>
                Mediconnect brings together patients, doctors, and administrators in one seamless system — from booking to consultation, all in minutes.
              </p>

              <div className="d-flex flex-wrap gap-3 mb-4">
                <Link to="/register" className="btn btn-primary px-5 py-3 d-inline-flex align-items-center gap-2" style={{ fontSize: '0.95rem', borderRadius: 12 }}>
                  Get Started Free <ArrowRight size={16} />
                </Link>
                <a href="#how-it-works" className="btn btn-outline-primary px-5 py-3 d-inline-flex align-items-center gap-2" style={{ fontSize: '0.95rem', borderRadius: 12 }}>
                  How It Works
                </a>
              </div>

              <div className="d-flex flex-wrap gap-4" style={{ fontSize: '0.82rem', color: 'var(--mc-text-muted)' }}>
                {['Free to register', 'No credit card needed', 'Secure & private'].map(t => (
                  <span key={t} className="d-flex align-items-center gap-1">
                    <CheckCircle size={13} color="var(--mc-success)" /> {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Hero visual */}
            <div className="col-12 col-lg-6 d-flex justify-content-center" style={{ opacity: heroVisible ? 1 : 0, transition: 'opacity 1s ease .3s' }}>
              <HeroCard />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAND ── */}
      <section style={{ background: 'var(--mc-primary)', padding: '3rem 0', color: '#fff' }}>
        <div className="container">
          <div className="row g-4 text-center">
            {STATS.map(({ value, suffix, label }) => (
              <div key={label} className="col-6 col-md-3">
                <p style={{ fontFamily: 'var(--mc-font-heading)', fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 900, margin: '0 0 4px', color: '#fff' }}>
                  <Counter target={value} suffix={suffix} />
                </p>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '6rem 0' }}>
        <div className="container">
          <div className="text-center mb-5" ref={featRef} style={{ opacity: featVisible ? 1 : 0, transform: featVisible ? 'none' : 'translateY(24px)', transition: 'opacity .6s ease, transform .6s ease' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--mc-accent)' }}>Why Mediconnect</span>
            <h2 style={{ fontFamily: 'var(--mc-font-heading)', fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', margin: '0.5rem 0' }}>Everything you need,<br />nothing you don't</h2>
            <p style={{ color: 'var(--mc-text-secondary)', maxWidth: 520, margin: '0 auto', fontSize: '0.95rem' }}>Purpose-built features for modern healthcare management.</p>
          </div>

          <div className="row g-4">
            {FEATURES.map(({ icon: Icon, color, title, desc }, i) => (
              <FeatureCard key={title} Icon={Icon} color={color} title={title} desc={desc} delay={i * 80} />
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ padding: '6rem 0', background: 'var(--mc-muted)' }}>
        <div className="container">
          <div className="text-center mb-5" ref={stepsRef} style={{ opacity: stepsVisible ? 1 : 0, transition: 'opacity .6s ease' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--mc-accent)' }}>Simple Process</span>
            <h2 style={{ fontFamily: 'var(--mc-font-heading)', fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', margin: '0.5rem 0' }}>From registration<br />to consultation in 4 steps</h2>
          </div>

          <div className="row g-4">
            {STEPS.map(({ step, title, desc }, i) => (
              <div key={step} className="col-12 col-sm-6 col-lg-3" style={{ opacity: stepsVisible ? 1 : 0, transform: stepsVisible ? 'none' : 'translateY(20px)', transition: `opacity .5s ease ${i * 100}ms, transform .5s ease ${i * 100}ms` }}>
                <div className="card p-4 h-100 text-center" style={{ borderTop: `3px solid ${i % 2 === 0 ? 'var(--mc-accent)' : 'var(--mc-primary)'}` }}>
                  <div style={{ fontFamily: 'var(--mc-font-heading)', fontSize: '3rem', fontWeight: 900, color: 'var(--mc-border)', lineHeight: 1, marginBottom: '1rem' }}>{step}</div>
                  <h5 style={{ fontFamily: 'var(--mc-font-heading)', fontWeight: 700, marginBottom: '0.5rem' }}>{title}</h5>
                  <p style={{ fontSize: '0.85rem', color: 'var(--mc-text-secondary)', margin: 0 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" style={{ padding: '6rem 0' }}>
        <div className="container">
          <div className="text-center mb-5" ref={testRef} style={{ opacity: testVisible ? 1 : 0, transition: 'opacity .6s ease' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--mc-accent)' }}>Testimonials</span>
            <h2 style={{ fontFamily: 'var(--mc-font-heading)', fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', margin: '0.5rem 0' }}>Trusted by patients<br />and clinicians alike</h2>
          </div>

          <div className="row g-4">
            {TESTIMONIALS.map(({ name, role, avatar, text }, i) => (
              <div key={name} className="col-12 col-md-6" style={{ opacity: testVisible ? 1 : 0, transform: testVisible ? 'none' : 'translateY(20px)', transition: `opacity .5s ease ${i * 100}ms, transform .5s ease ${i * 100}ms` }}>
                <div className="card p-4 h-100">
                  <div className="d-flex gap-1 mb-3">
                    {[1,2,3,4,5].map(s => <Star key={s} size={13} fill="var(--mc-warning)" color="var(--mc-warning)" />)}
                  </div>
                  <p style={{ fontSize: '0.92rem', color: 'var(--mc-text-secondary)', fontStyle: 'italic', lineHeight: 1.7, marginBottom: '1.25rem' }}>"{text}"</p>
                  <div className="d-flex align-items-center gap-3 mt-auto">
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--mc-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.82rem' }}>{avatar}</span>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '0.88rem' }}>{name}</p>
                      <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--mc-text-muted)' }}>{role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ padding: '5rem 0', background: 'var(--mc-primary)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-50%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'rgba(139,30,30,0.35)', pointerEvents: 'none' }} />
        <div className="container text-center" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--mc-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Stethoscope size={28} color="#fff" />
          </div>
          <h2 style={{ fontFamily: 'var(--mc-font-heading)', fontSize: 'clamp(1.8rem, 4vw, 3rem)', color: '#fff', marginBottom: '1rem', fontStyle: 'italic' }}>
            Ready to modernise your healthcare?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', maxWidth: 460, margin: '0 auto 2rem' }}>
            Join thousands of patients and doctors who've already made the switch to smarter, faster care.
          </p>
          <div className="d-flex flex-wrap gap-3 justify-content-center">
            <Link to="/register" className="btn px-5 py-3 d-inline-flex align-items-center gap-2" style={{ background: '#fff', color: 'var(--mc-accent)', fontWeight: 700, borderRadius: 12, fontSize: '0.95rem' }}>
              Create Free Account <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="btn px-5 py-3" style={{ background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.35)', borderRadius: 12, fontWeight: 600, fontSize: '0.95rem' }}>
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0a0a0b', color: 'rgba(255,255,255,0.55)', padding: '3rem 0 2rem' }}>
        <div className="container">
          <div className="row g-4 mb-4">
            <div className="col-12 col-md-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--mc-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Stethoscope size={14} color="#fff" />
                </div>
                <span style={{ fontFamily: 'var(--mc-font-heading)', fontWeight: 700, color: '#fff', fontSize: '1rem' }}>Mediconnect</span>
              </div>
              <p style={{ fontSize: '0.82rem', maxWidth: 260, lineHeight: 1.7 }}>Electronic Patient Appointment and Consultation Management System. Built as a Final Year Project.</p>
            </div>
            <div className="col-6 col-md-2">
              <p style={{ color: '#fff', fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.75rem' }}>Platform</p>
              {['Features', 'How It Works', 'Testimonials'].map(l => (
                <a key={l} href="#" style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: 6, textDecoration: 'none' }}>{l}</a>
              ))}
            </div>
            <div className="col-6 col-md-2">
              <p style={{ color: '#fff', fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.75rem' }}>Account</p>
              {[['Register', '/register'], ['Sign In', '/login'], ['Forgot Password', '/forgot-password']].map(([l, to]) => (
                <Link key={l} to={to} style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: 6, textDecoration: 'none' }}>{l}</Link>
              ))}
            </div>
            <div className="col-12 col-md-4">
              <p style={{ color: '#fff', fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.75rem' }}>Quick Access</p>
              <div className="d-flex flex-wrap gap-2">
                <Link to="/register" className="btn btn-sm px-3 py-1" style={{ background: 'var(--mc-accent)', color: '#fff', borderRadius: 8, fontSize: '0.78rem' }}>Patient Portal</Link>
                <Link to="/register" className="btn btn-sm px-3 py-1" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: 8, fontSize: '0.78rem', border: '1px solid rgba(255,255,255,0.15)' }}>Doctor Portal</Link>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', textAlign: 'center', fontSize: '0.78rem' }}>
            © {new Date().getFullYear()} Mediconnect. Built with React + PHP for Final Year Project.
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── Hero Card visual component ── */
function HeroCard() {
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 420 }}>
      {/* Main card */}
      <div className="card p-4" style={{ boxShadow: 'var(--mc-shadow-lg)', borderRadius: 20, border: '1px solid var(--mc-border)' }}>
        <div className="d-flex align-items-center gap-3 mb-4">
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--mc-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={22} color="#fff" />
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>Upcoming Appointment</p>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--mc-text-muted)' }}>Today, 2:30 PM</p>
          </div>
          <span className="ms-auto badge" style={{ background: 'var(--mc-success-bg)', color: 'var(--mc-success)', padding: '5px 10px' }}>Confirmed</span>
        </div>

        <div style={{ background: 'var(--mc-muted)', borderRadius: 12, padding: '1rem', marginBottom: '1rem' }}>
          <div className="d-flex align-items-center gap-3">
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--mc-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.8rem' }}>KA</span>
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.88rem' }}>Dr. Kwame Asante</p>
              <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--mc-text-muted)' }}>Cardiologist · City Medical Centre</p>
            </div>
          </div>
        </div>

        {/* Mini stat row */}
        <div className="row g-2">
          {[
            { icon: Clock,    label: 'Next Visit', val: 'Today 2:30' },
            { icon: Activity, label: 'Consultations', val: '12 Total' },
          ].map(({ icon: Icon, label, val }) => (
            <div key={label} className="col-6">
              <div style={{ background: 'var(--mc-surface)', border: '1px solid var(--mc-border)', borderRadius: 10, padding: '0.75rem', textAlign: 'center' }}>
                <Icon size={16} color="var(--mc-accent)" style={{ marginBottom: 4 }} />
                <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--mc-text-muted)' }}>{label}</p>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.82rem' }}>{val}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating notification */}
      <div style={{ position: 'absolute', top: -18, right: -18, background: '#fff', borderRadius: 12, padding: '0.6rem 0.9rem', boxShadow: 'var(--mc-shadow)', border: '1px solid var(--mc-border)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--mc-success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircle size={14} color="var(--mc-success)" />
        </div>
        <div>
          <p style={{ margin: 0, fontSize: '0.72rem', fontWeight: 600 }}>Appointment Confirmed</p>
          <p style={{ margin: 0, fontSize: '0.66rem', color: 'var(--mc-text-muted)' }}>2 mins ago</p>
        </div>
      </div>

      {/* Floating badge bottom-left */}
      <div style={{ position: 'absolute', bottom: -14, left: -14, background: 'var(--mc-accent)', borderRadius: 12, padding: '0.6rem 0.9rem', boxShadow: 'var(--mc-shadow)' }}>
        <div className="d-flex align-items-center gap-2">
          <Users size={14} color="#fff" />
          <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.78rem' }}>5,200+ Patients</span>
        </div>
      </div>
    </div>
  );
}

/* ── Feature Card with scroll reveal ── */
function FeatureCard({ Icon, color, title, desc, delay }) {
  const [ref, visible] = useReveal();
  return (
    <div className="col-12 col-sm-6 col-lg-4" ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(24px)', transition: `opacity .5s ease ${delay}ms, transform .5s ease ${delay}ms` }}>
      <div className="card p-4 h-100" style={{ cursor: 'default' }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: color + '14', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
          <Icon size={22} color={color} strokeWidth={1.8} />
        </div>
        <h5 style={{ fontFamily: 'var(--mc-font-heading)', fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>{title}</h5>
        <p style={{ fontSize: '0.85rem', color: 'var(--mc-text-secondary)', margin: 0, lineHeight: 1.7 }}>{desc}</p>
      </div>
    </div>
  );
}
