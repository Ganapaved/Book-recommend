import { useEffect, useState } from "react";
import { authFetch } from "../utils/api";
import {Link} from 'react-router-dom';

export default function Recommendations() {
  const [books, setBooks] = useState([]);
  const [likedSet, setLikedSet] = useState(new Set());

  // fetch recommendations + user likes
  useEffect(() => {
    const loadData = async () => {
      try {
        const recRes = await authFetch("/recommend");
        const recData = await recRes.json();
        const recs = recData.recommendations || [];
        setBooks(recs);

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
  <div className="recommend-container">
    <h2>Recommended Books</h2>
    <div className="recommend-list">
      {books.map((b) => (
        <div className="recommend-card" key={b._id}>
          <Link to={`/book/${b._id}`}>
            <img
              className="recommend-img"
              src={`data:image/jpeg;base64,${b.photo}`}
              alt='image'
            />
          </Link>
          <div className="recommend-info">
            <div className="recommend-title">{b.title}</div>
            <div className="recommend-author">by {b.author}</div>
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

import '../App.css'
