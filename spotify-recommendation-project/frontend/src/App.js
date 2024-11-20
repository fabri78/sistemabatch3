import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [genres, setGenres] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  const availableGenres = [
    'rock', 'pop', 'jazz', 'hip-hop', 'electronic', 'classical'
  ]; // Ejemplo de géneros disponibles

  const handleGenreChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setGenres([...genres, value]);
    } else {
      setGenres(genres.filter((genre) => genre !== value));
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await axios.post('http://localhost:3001/generate-recommendations', {
        genres,
      });
      setRecommendations(response.data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Victorify - Music Recommendations</h1>
      </header>
      <main className="main-content">
        <section className="genres-selection">
          <h2>Select Your Favorite Genres</h2>
          {availableGenres.map((genre) => (
            <label key={genre}>
              <input
                type="checkbox"
                value={genre}
                onChange={handleGenreChange}
              />
              {genre}
            </label>
          ))}
          <button onClick={fetchRecommendations}>Get Recommendations</button>
        </section>
        <section className="recommendations">
          <h2>Your Recommendations</h2>
          {recommendations.length > 0 ? (
            <ul>
              {recommendations.map((rec, index) => (
                <li key={index}>
                  <img src={rec.album_cover} alt={rec.album_name} style={{ width: '100px', height: '100px' }} />
                  <div>
                    <h3>{rec.album_name}</h3>
                    <p>{rec.artist_name}</p>
                    <p>Released: {rec.release_year}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No recommendations available. Select some genres and click "Get Recommendations".</p>
          )}
        </section>
      </main>
      <footer className="app-footer">
        <p>&copy; 2024 Music App | All rights reserved</p>
      </footer>
    </div>
  );
}

export default App;
