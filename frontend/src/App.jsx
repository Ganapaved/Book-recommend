import { Routes, Route, useNavigate,Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Search from "./pages/Search";
import MyLikes from "./pages/MyLikes";
import AddBook from "./pages/AddBook";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Recommendations from "./pages/Recommendations";
import Profile from "./pages/Profile";
import Bookpreview from './pages/Bookpreview'
import BookChatbot from "./pages/Bookchatbot";
import { authFetch } from "./utils/api";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch user if token exists
  useEffect(() => {
    if (token) {
      authFetch("/users")
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setUser(data.user);
          } else {
            localStorage.removeItem("token");
            setToken(null);
          }
        })
        .catch(() => {
          localStorage.removeItem("token");
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const onLogin = (u, t) => {
    localStorage.setItem("token", t);
    setToken(t);
    setUser(u);
    navigate("/");
  };

  const onSignup = (u, t) => {
  localStorage.setItem("token", t);
  setToken(t);
  setUser(u);
  navigate("/"); // go home after signup
};

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    alert("Logged out successfully!");
    navigate("/login");
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={token ? <Home user={user} /> : <Navigate to='/login' replace />} />
        <Route path="/search" element={<Search />} />
        <Route path="/likes" element={token ? <MyLikes /> : <Navigate to='/login' replace />} />
        <Route path="/add" element={token ? <AddBook /> : <Navigate to='/login' replace />} />
        <Route path="/signup" element={<Signup onSignup={onSignup}/>} />
        <Route path="/login" element={<Login onLogin={onLogin} />} />
        <Route path="/recommend" element={<Recommendations />} />
        <Route path="/profile" element ={token ? <Profile/> : <Navigate to='/login' replace />}/>
        <Route path="/book/:id" element={token ? <Bookpreview/> : <Navigate to='/login' replace />}/>
        <Route path="/bookai/:title" element ={<BookChatbot/>}></Route>
      </Routes>
    </div>
  );
}

import './App.css';