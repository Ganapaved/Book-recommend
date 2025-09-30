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
  <div className="profile-container">
    <h2 className="profile-title">My Profile</h2>

    <div className="profile-card">
      <p><strong>Username:</strong> {profile.username}</p>
      <p><strong>Email:</strong> {profile.email}</p>
    </div>

    <h3 className="profile-subtitle">Other Users</h3>
    <ul className="profile-user-list">
      {users.map(u => {
        const isFollowing = following.includes(u._id);
        return (
          <li className="profile-user-item" key={u._id}>
            <span>{u.username}</span>
            <button
              className={`profile-follow-btn ${isFollowing ? "following" : ""}`}
              onClick={() => toggleFollow(u._id, isFollowing)}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
          </li>
        );
      })}
    </ul>

    <h3 className="profile-subtitle" style={{ marginTop: "2rem" }}>Following</h3>
    <ul className="profile-following-list">
      {users
        .filter(u => following.includes(u._id))
        .map(u => (
          <li className="profile-following-item" key={u._id}>
            {u.username}
          </li>
        ))}
    </ul>
  </div>
);
}
