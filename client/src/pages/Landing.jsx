import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import LandingHero from '../components/LandingHero';
import LandingDiscovery from '../components/LandingDiscovery';
import LandingFeatures from '../components/LandingFeatures';

export default function Landing() {
  const { user } = useContext(AuthContext);
  const [gamesData, setGamesData] = useState({ popular: [], newReleases: [], highlyRated: [] });
  const [activity, setActivity] = useState([]);
  const [recommended, setRecommended] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gamesRes, activityRes] = await Promise.all([
          axios.get('http://localhost:5005/api/games/landing'),
          axios.get('http://localhost:5005/api/games/activity')
        ]);
        setGamesData(gamesRes.data);
        setActivity(activityRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (user) {
      const fetchRecommended = async () => {
        try {
          const res = await axios.get('http://localhost:5005/api/games/recommended');
          if (res.data.games && res.data.games.length > 0) {
            setRecommended(res.data);
          }
        } catch (err) {
          console.error(err);
        }
      };
      fetchRecommended();
    }
  }, [user]);

  // Only popular + highest rated games for hero collage
  const bgGames = [
    ...gamesData.popular,
    ...gamesData.highlyRated
  ].filter((game, index, self) => 
    game.cover_url && self.findIndex(g => g.id === game.id) === index
  );

  return (
    <div style={{ width: '100%' }}>
      <LandingHero 
        user={user} 
        loading={loading} 
        bgGames={bgGames} 
      />
      <LandingDiscovery 
        loading={loading} 
        recommended={recommended} 
        gamesData={gamesData} 
        activity={activity} 
      />
      <LandingFeatures />
    </div>
  );
}
