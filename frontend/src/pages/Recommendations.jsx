import { useEffect, useState } from "react";
import { authFetch } from "../utils/api";

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
    <div>
      <h2>Recommended Books</h2>
      <ul>
        {books.map((b) => (
          <li key={b._id} style={{ marginBottom: "1rem" }}>
            <span>{b.title} by {b.author}</span>
            <button
              onClick={() => toggleLike(b._id)}
              style={{ marginLeft: "1rem" }}
            >
              {likedSet.has(b._id) ? "❤️ Liked" : "🤍 Like"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
