import express from 'express';
import axios from 'axios';
import { Client } from 'pg';  // Cambié la importación para usar la forma estándar
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const port = 3001;

// Configuración de CORS
app.use(cors({
  origin: 'https://probable-spork-757797rxvw52x446-3000.app.github.dev',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,  // Para permitir el paso de cookies si es necesario
}));

app.use(express.json());

// Middleware para solicitudes preflight
app.options('*', cors());

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
    process.exit(1); // Si falla la conexión, detener el servidor
  });

// Endpoint para generar recomendaciones
app.post('/generate-recommendations', async (req, res) => {
  try {
    const { genres } = req.body;

    // Validación de la entrada
    if (!genres || !Array.isArray(genres) || genres.length === 0) {
      return res.status(400).json({ error: 'Invalid genres data. Provide a valid list of genres.' });
    }

    const recommendations = [];

    // Obtener recomendaciones para cada género
    for (let genre of genres) {
      const options = {
        method: 'GET',
        url: `https://www.theaudiodb.com/api/v1/json/${process.env.API_KEY_THEAUDIO}/searchalbum.php?s=${genre}`,
      };

      try {
        const response = await axios.request(options);
        if (response.data && response.data.album) {
          response.data.album.forEach((album) => {
            recommendations.push({
              genre,
              album_name: album.strAlbum,
              artist_name: album.strArtist,
              release_year: album.intYearReleased,
              album_cover: album.strAlbumThumb,
            });
          });
        }
      } catch (error) {
        console.error(`Error fetching data for genre ${genre}:`, error.message);
      }
    }

    // Si no hay recomendaciones, se devuelve un mensaje
    if (recommendations.length === 0) {
      return res.status(404).json({ error: 'No recommendations found for the selected genres.' });
    }

    // Insertar las recomendaciones en la base de datos
    for (let rec of recommendations) {
      const { genre, album_name, artist_name, release_year, album_cover } = rec;

      try {
        // Verificar si la recomendación ya existe antes de insertar
        const existingRecommendation = await pgClient.query(
          'SELECT * FROM recommendations WHERE album_name = $1 AND artist_name = $2',
          [album_name, artist_name]
        );

        if (existingRecommendation.rows.length === 0) {
          await pgClient.query(
            'INSERT INTO recommendations (genre, album_name, artist_name, release_year, album_cover) VALUES ($1, $2, $3, $4, $5)',
            [genre, album_name, artist_name, release_year, album_cover]
          );
        }
      } catch (error) {
        console.error('Error inserting into PostgreSQL:', error);
      }
    }

    // Devolver las recomendaciones
    res.status(200).json(recommendations);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Backend is running on https://probable-spork-757797rxvw52x446-3001.app.github.dev`);
});
