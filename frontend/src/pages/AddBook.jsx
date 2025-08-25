import { useState } from "react";
import { authFetch } from "../utils/api";

export default function AddBook() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genres, setGenres] = useState("");
  const [description , setDescription] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await authFetch("/book/add", {
      method: "POST",
      body: JSON.stringify({
        title,
        author,
        genres: genres.split(",").map((g) => g.trim()),
        description,
      }),
    });
    const data = await res.json();
    if (data.error) alert(data.error);
    else alert("Book added!");
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Book</h2>
      <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <input placeholder="Author" value={author} onChange={(e) => setAuthor(e.target.value)} />
      <input placeholder="Genres (comma separated)"
             value={genres} onChange={(e) => setGenres(e.target.value)} />
      <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      <button type="submit">Add</button>
    </form>
  );
}
