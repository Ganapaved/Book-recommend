import { useEffect, useState } from "react";
import { authFetch } from "../utils/api";

export default function MyLikes() {
  const [likes, setLikes] = useState([]);

  useEffect(() => {
    authFetch("/users/like")
      .then((res) => res.json())
      .then((data) => {
        console.log("Likes API response:", data);
        // ✅ safe fix
        setLikes(Array.isArray(data.like) ? data.like : []);
      })
      .catch((err) => {
        console.error("Error fetching likes:", err);
        setLikes([]);
      });
  }, []);

  return (
    <div>
      <h2>My Likes</h2>
      <ul>
        {likes.length > 0 ? (
          likes.map((b) => (
            <li key={b._id}>
              <strong>{b.title}</strong> — {b.author}
            </li>
          ))
        ) : (
          <p>No liked books yet.</p>
        )}
      </ul>
    </div>
  );
}
