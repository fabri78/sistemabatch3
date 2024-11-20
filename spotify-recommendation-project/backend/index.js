import express from 'express';
import axios from 'axios';
import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const port = 3001; // Puedes cambiarlo si quieres evitar posibles conflictos

// Configurar CORS
app.use(cors({
  origin: 'http://localhost:3000', // Asegúrate de que tu frontend esté corriendo en el puerto 3000
}));
app.use(express.json()); // Middleware para parsear JSON

// Conexión a PostgreSQL
const pgClient = new Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DB,
  password: process.env.PG_PASSWORD,
  port: 5432,
});

pgClient.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch((err) => {
    console.error('Failed to connect to PostgreSQL', err);
    process.exit(1); // Si falla la conexión a la BD, detener el servidor
  });

// Endpoint de prueba para verificar si el servidor funciona
app.get('/test', (req, res) => {
  res.status(200).send('Server is running properly');
});

// Endpoint para generar recomendaciones basadas en géneros
app.post('/generate-recommendations', async (req, res) => {
  try {
    const { genres } = req.body;
    console.log("Received genres:", genres);

    if (!genres || !Array.isArray(genres) || genres.length === 0) {
      return res.status(400).json({ error: 'Invalid genres data. Please provide a valid list of genres.' });
    }

    if (!process.env.API_KEY_THEAUDIO) {
      console.error('API_KEY_THEAUDIO is not defined in environment variables.');
      return res.status(500).json({ error: 'Server configuration error. Please contact support.' });
    }

    const recommendations = [];

    for (let genre of genres) {
      console.log(`Fetching recommendations for genre: ${genre}`);

      const options = {
        method: 'GET',
        url: `https://www.theaudiodb.com/api/v1/json/${process.env.API_KEY_THEAUDIO}/searchalbum.php?s=${genre}`,
      };

      try {
        const response = await axios.request(options);

        // Verificar si la respuesta tiene álbumes
        if (response.data && response.data.album && response.data.album.length > 0) {
          const albums = response.data.album;
          albums.forEach(album => {
            recommendations.push({
              genre,
              album_name: album.strAlbum,
              artist_name: album.strArtist,
              release_year: album.intYearReleased,
              album_cover: album.strAlbumThumb,
            });
          });
        } else {
          console.warn(`No albums found for genre: ${genre}`);
        }
      } catch (error) {
        console.error(`Error fetching data for genre ${genre}:`, error.response ? error.response.data : error.message);
        return res.status(500).json({ error: `Error fetching data for genre ${genre}` });
      }
    }

    // Verificar si se encontraron recomendaciones
    if (recommendations.length === 0) {
      return res.status(404).json({ message: "No recommendations found for the selected genres." });
    }

    // Guardar las recomendaciones en PostgreSQL
    for (let rec of recommendations) {
      const { genre, album_name, artist_name, release_year, album_cover } = rec;

      try {
        await pgClient.query(
          'INSERT INTO recommendations (genre, album_name, artist_name, release_year, album_cover) VALUES ($1, $2, $3, $4, $5)',
          [genre, album_name, artist_name, release_year, album_cover]
        );
        console.log(`Inserted recommendation into PostgreSQL: ${album_name} by ${artist_name}`);
      } catch (error) {
        console.error('Error inserting into PostgreSQL:', error);
      }
    }

    // Devolver las recomendaciones al frontend
    res.status(200).json(recommendations);

  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
