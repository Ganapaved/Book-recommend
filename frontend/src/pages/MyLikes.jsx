import { useEffect, useState } from "react";
import { authFetch } from "../utils/api";
import {Link} from 'react-router-dom';

export default function MyLikes() {
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch("/users/like")
      .then((res) => res.json())
      .then((data) => {
        console.log("Likes API response:", data);
        // ✅ safe fix
        setLikes(Array.isArray(data.like) ? data.like : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching likes:", err);
        setLikes([]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="my-likes-container">
      <h2>My Liked Books</h2>
      
      {loading ? (
        // A simple loading indicator
        <p className="loading-message">Loading your liked books...</p>
      ) : likes.length > 0 ? (
        <div className="book-grid">
          {likes.map((b) => (
            <div className="book-card" key={b._id}>
              <Link to={`/book/${b._id}`}>
                <img
                  src={`data:image/jpeg;base64,${b.photo}` || "https://via.placeholder.com/150"} // Use a placeholder if no image exists
                  alt={`Cover for ${b.title}`}
                  className="book-cover"
                />
              </Link>
              <div className="book-info">
                <h3 className="book-title">{b.title}</h3>
                <p className="book-author">{b.author}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-message">No liked books yet. Go find some to like!</p>
      )}
    </div>
  );
}
