import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Search from './pages/Search';
import GameDetail from './pages/GameDetail';
import Library from './pages/Library';
import Dashboard from './pages/Dashboard';
import Recommend from './pages/Recommend';
import Community from './pages/Community';
import Lists from './pages/Lists';
import ListDetail from './pages/ListDetail';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/search" element={<Search />} />
            <Route path="/game/:id" element={<GameDetail />} />
            <Route path="/library" element={<Library />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/recommend" element={<Recommend />} />
            <Route path="/community" element={<Community />} />
            <Route path="/lists" element={<Lists />} />
            <Route path="/list/:id" element={<ListDetail />} />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;
