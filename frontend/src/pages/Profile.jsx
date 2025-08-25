import { useEffect, useState } from "react";
import { authFetch } from "../utils/api";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [users, setUsers] = useState([]);
  const [following, setFollowing] = useState([]);

  useEffect(() => {
    // Fetch my profile
    authFetch("/users/profile")
      .then(res => res.json())
      .then(data => {
        setProfile(data.user);
        setFollowing(data.user.following || []);
      });

    // Fetch all users
    authFetch("/users/all")
      .then(res => res.json())
      .then(data => setUsers(data.users || []));
  }, []);

  const toggleFollow = async (userId, isFollowing) => {
    const url = isFollowing
      ? `/users/${userId}/unfollow`
      : `/users/${userId}/follow`;

    await authFetch(url, { method: "POST" });

    setFollowing(prev =>
      isFollowing ? prev.filter(f => f !== userId) : [...prev, userId]
    );
  };

  if (!profile) return <div style={{ textAlign: "center", marginTop: "2rem", fontSize: "1.2rem" }}>Loading profile...</div>;

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ textAlign: "center", marginBottom: "1.5rem", color: "#333" }}>My Profile</h2>

      <div style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "1rem", marginBottom: "2rem", background: "#f9f9f9" }}>
        <p><strong>Username:</strong> {profile.username}</p>
        <p><strong>Email:</strong> {profile.email}</p>
      </div>

      <h3 style={{ color: "#444", marginBottom: "0.5rem" }}>Other Users</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {users.map(u => {
          const isFollowing = following.includes(u._id);
          return (
            <li key={u._id} style={{ marginBottom: "0.8rem", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f1f1f1", padding: "0.6rem 1rem", borderRadius: "6px" }}>
              <span>{u.username}</span>
              {isFollowing ? (
                <div style={{ position: "relative" }}>
                  <button style={{ background: "#4caf50", color: "white", border: "none", padding: "0.4rem 0.8rem", borderRadius: "5px", cursor: "pointer" }}>
                    Following ⬇
                  </button>
                  <div style={{ position: "absolute", top: "120%", right: 0, background: "white", border: "1px solid #ddd", borderRadius: "5px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)", zIndex: 10 }}>
                    <button 
                      onClick={() => toggleFollow(u._id, true)} 
                      style={{ background: "white", border: "none", padding: "0.5rem 1rem", cursor: "pointer", width: "100%" }}
                    >
                      Unfollow
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => toggleFollow(u._id, false)} 
                  style={{ background: "#2196f3", color: "white", border: "none", padding: "0.4rem 0.8rem", borderRadius: "5px", cursor: "pointer" }}
                >
                  Follow
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <h3 style={{ marginTop: "2rem", color: "#444" }}>Following</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {users
          .filter(u => following.includes(u._id))
          .map(u => (
            <li key={u._id} style={{ padding: "0.4rem 0.8rem", background: "#e8f5e9", marginBottom: "0.5rem", borderRadius: "5px" }}>
              {u.username}
            </li>
          ))}
      </ul>
    </div>
  );
}
