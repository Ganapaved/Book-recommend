import { useState } from "react";
import { authFetch } from "../utils/api";

export default function Search() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    const res = await authFetch(`/book?search=${q}`); // ✅ matches backend
    const data = await res.json();
    setResults(data.books || []);
  };

  return (
    <div>
      <h2>Search Books</h2>
      <form onSubmit={handleSearch}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search..."
        />
        <button type="submit">Go</button>
      </form>

      <ul>
        {results.map((b) => (
          <li key={b._id}>{b.title} — {b.author}</li>
        ))}
      </ul>
    </div>
  );
}
