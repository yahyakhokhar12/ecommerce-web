import React from 'react';

const Home = () => {
  return (
    <div className="page">
      <div className="container">
        <section className="hero">
          <span className="badge">New season arrivals</span>
          <h1 className="hero__title">Welcome to MyShop</h1>
          <p className="hero__subtitle">
            Your one-stop shop for standout essentials. Curated products, fast delivery,
            and a checkout experience built for every device.
          </p>
          <div className="filters__row">
            <button className="btn btn--primary">Shop now</button>
            <button className="btn btn--secondary">Browse collections</button>
          </div>
        </section>

        <section className="feature-grid">
          <div className="feature-card">
            <h3>About Us</h3>
            <p className="muted">
              We launched in 2024 with a simple mission: make online shopping feel
              effortless, trustworthy, and beautiful on every screen.
            </p>
          </div>
          <div className="feature-card">
            <h3>Why Choose Us?</h3>
            <div className="grid-list">
              <span>âœ“ Premium, handpicked products</span>
              <span>âœ“ Lightning-fast fulfillment</span>
              <span>âœ“ 24/7 customer care</span>
              <span>âœ“ Easy returns, no stress</span>
            </div>
          </div>
          <div className="feature-card">
            <h3>Secure Checkout</h3>
            <p className="muted">
              Your data stays protected with modern security practices and a seamless
              checkout flow built for speed.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
