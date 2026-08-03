import React from 'react';
import Header from '../Components/Header';
import Footer from '../Components/footer';
import './About.css';

const values = [
  {
    icon: '◈',
    title: 'Uncompromising Quality',
    desc: 'Every piece in our catalogue is sourced from artisans who share our belief that quality is never accidental — it is the result of intelligent effort.',
  },
  {
    icon: '✦',
    title: 'Timeless Design',
    desc: 'We curate for longevity. Each selection is chosen to transcend seasonal trends and remain relevant for years to come.',
  },
  {
    icon: '❖',
    title: 'Sustainable Practice',
    desc: 'From materials to packaging, we make deliberate choices that reduce our footprint without compromising the experience.',
  },
  {
    icon: '◉',
    title: 'Customer First',
    desc: 'A seamless experience — from discovery to delivery — is the standard we hold ourselves to, every single day.',
  },
];

const team = [
  {
    name: 'Alexandra Reid',
    role: 'Founder & Creative Director',
    img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
  },
  {
    name: 'Marcus Chen',
    role: 'Head of Curation',
    img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
  },
  {
    name: 'Isabelle Fontaine',
    role: 'Brand & Experience',
    img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
  },
];

const About = ({ user, onLogout }) => (
  <div className="page-wrapper">
    <Header user={user} onLogout={onLogout} />

    <main>
      {/* ── Page Hero ── */}
      <section className="page-hero about-hero">
        <div className="page-hero-overlay" aria-hidden="true" />
        <div className="container page-hero-content">
          <p className="page-hero-eyebrow">Our Story</p>
          <h1 className="page-hero-title">Redefining<br />Modern Living</h1>
          <p className="page-hero-sub">
            Founded in 2024, Timekey was built on a single belief — that beautiful things,
            thoughtfully made, deserve to be discovered.
          </p>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="about-mission">
        <div className="container about-mission-grid">
          <div className="about-mission-img-wrap">
            <img
              src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop"
              alt="Our studio"
              className="about-mission-img"
            />
          </div>
          <div className="about-mission-text">
            <p className="about-section-eyebrow">What We Do</p>
            <h2 className="about-section-title">Curated with intention,<br />delivered with care.</h2>
            <p className="about-body">
              Timekey is a premium lifestyle destination for those who appreciate the art of
              living well. We partner exclusively with makers who share our obsession with
              materials, process, and purpose.
            </p>
            <p className="about-body">
              Every product on our platform passes through a rigorous selection process — not
              just for quality, but for the story behind it. We believe that knowing where
              something comes from makes it more meaningful.
            </p>
            <div className="about-stats">
              {[
                { value: '10+', label: 'Years in business' },
                { value: '200+', label: 'Artisan partners' },
                { value: '50K+', label: 'Happy customers' },
              ].map((s) => (
                <div key={s.label} className="about-stat">
                  <p className="about-stat-value">{s.value}</p>
                  <p className="about-stat-label">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="about-values">
        <div className="container">
          <div className="about-values-header">
            <p className="about-section-eyebrow">What We Stand For</p>
            <h2 className="about-section-title about-section-title--light">Our Core Values</h2>
          </div>
          <div className="about-values-grid">
            {values.map((v) => (
              <div key={v.title} className="about-value-card">
                <div className="about-value-icon">{v.icon}</div>
                <h3 className="about-value-title">{v.title}</h3>
                <p className="about-value-desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="about-team">
        <div className="container">
          <div className="about-team-header">
            <p className="about-section-eyebrow">The People</p>
            <h2 className="about-section-title">Behind Timekey</h2>
          </div>
          <div className="about-team-grid">
            {team.map((m) => (
              <div key={m.name} className="about-team-card">
                <div className="about-team-img-wrap">
                  <img src={m.img} alt={m.name} className="about-team-img" />
                </div>
                <p className="about-team-name">{m.name}</p>
                <p className="about-team-role">{m.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>

    <Footer />
  </div>
);

export default About;
