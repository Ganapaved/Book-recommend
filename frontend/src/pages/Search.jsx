import { useEffect,useState } from "react";
import { authFetch } from "../utils/api";
import {Link} from 'react-router-dom';

export default function Search() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [likedSet, setLikedSet] = useState(new Set());

  useEffect(() => {
      const loadData = async () => {
        try {
          // fetch my likes
          const likeRes = await authFetch("/users/like");
          const likeData = await likeRes.json();
          const ids = (likeData.like || []).map((b) => b._id);
          setLikedSet(new Set(ids));
        } catch (err) {
          console.error("Error loading data", err);
        }
      };
      loadData();
    }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    const res = await authFetch(`/book?search=${q}`); // ✅ matches backend
    const data = await res.json();
    setResults(data.books || []);
  };

  // toggle like/unlike
  const toggleLike = async (bookId) => {
    try {
      const res = await authFetch(`/users/like/${bookId}`, { method: "POST" });
      const data = await res.json();

      setLikedSet((prev) => {
        const newSet = new Set(prev);
        if (data.liked) {
          newSet.add(bookId);   // mark as liked
        } else {
          newSet.delete(bookId); // mark as unliked
        }
        return newSet;
      });
    } catch (err) {
      console.error("Error toggling like", err);
    }
  };

return (
  <div className="search-container">
    <h2 className="search-title">Search Books</h2>
    <form className="search-form" onSubmit={handleSearch}>
      <input
        className="search-input"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search..."
      />
      <button className="search-btn" type="submit">Go</button>
    </form>

    <div className="search-results">
      {results.length === 0 && q && (
        <div className="search-empty">No results found.</div>
      )}
      {results.map((b) => (
        <div className="search-card" key={b._id}>
          <Link to={`/book/${b._id}`}>
            <img
              className="search-img"
              src={`data:image/jpeg;base64,${b.photo}`}
              alt={b.title}
            />
          </Link>
          <div className="search-info">
            <div className="search-book-title">{b.title}</div>
            <div className="search-book-author">{b.author}</div>
            <button
              className={`recommend-like ${likedSet.has(b._id) ? "liked" : ""}`}
              onClick={() => toggleLike(b._id)}
            >
              {likedSet.has(b._id) ? "❤️ Liked" : "🤍 Like"}
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);
}


