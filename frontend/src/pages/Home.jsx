export default function Home({ user }) {
  return (
    <div>
      <h2>Welcome {user ? user.username : "Guest"}</h2>
      <p>Discover books, add your favorites, and get recommendations.</p>
    </div>
  );
}
