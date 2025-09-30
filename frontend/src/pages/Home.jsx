import { Link } from "react-router-dom";
export default function Home({ user }) {
return (
  <div className="home-container">
    <div className="home-hero">
      <h2>
        Welcome {user ? user.username : "Guest"} 👋
      </h2>
      <p>
        Discover new books, add your favorites, and get personalized recommendations.
      </p>
      {!user && (
        <div className="home-actions">
          <a className="home-btn" href="/signup">Get Started</a>
          <a className="home-btn secondary" href="/login">Login</a>
        </div>
      )}
    </div>

    <div className="home-features">
      <Link to='/search' className="home-feature-card-link">
        <div className="home-feature-card">
          <span role="img" aria-label="search" className="home-feature-icon">🔎</span>
          <h3>Search Books</h3>
          <p>Find books by title, author, or genre from our vast collection.</p>
        </div>
      </Link>
      <Link to='/add' className="home-feature-card-link">
        <div className="home-feature-card">
          <span role="img" aria-label="add" className="home-feature-icon">➕</span>
          <h3>Add Your Favorites</h3>
          <p>Share your favorite books with the community and build your personal library.</p>
        </div>
      </Link>
      <Link to='/recommend' className="home-feature-card-link">
        <div className="home-feature-card">
          <span role="img" aria-label="recommend" className="home-feature-icon">✨</span>
          <h3>Get Recommendations</h3>
          <p>Receive book suggestions tailored to your interests and likes.</p>
        </div>
      </Link>
    </div>
  </div>
);

}
