import { Link } from "react-router-dom";

export default function Navbar({ user, onLogout }) {
  return (
    <nav className="navbar">
      <Link to="/">📚 BookRec</Link>
      <div>
        <Link to="/search">Search 🔎</Link>
        {user ? (
          <>
            <Link to="/recommend">Recommendations</Link>
            <Link to="/likes">My Likes</Link>
            <Link to="/add">Add Book</Link>
            <Link to="/profile">{user.username}</Link>
            <span>Hi, {user.username}</span>
            <button onClick={onLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/signup">Signup</Link>
            <Link to="/login">Login</Link>
          </>
        )}
      </div>
    </nav>
  );
}
import './Navbar.css'; // Assuming you have a Navbar.css for styling
