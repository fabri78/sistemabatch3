import redis
import psycopg2
import json
import os

# Cargar variables de entorno
PG_USER = os.getenv('PG_USER', 'user')
PG_PASSWORD = os.getenv('PG_PASSWORD', 'password')
PG_DB = os.getenv('PG_DB', 'spotify_db')
PG_HOST = os.getenv('PG_HOST', 'spotify-recommendation-postgres')

# Conexión a Redis
redis_client = redis.Redis(host='spotify-recommendation-redis', port=6379)

# Conexión a PostgreSQL con credenciales desde el archivo .env
conn = psycopg2.connect(dbname=PG_DB, user=PG_USER, password=PG_PASSWORD, host=PG_HOST)
cursor = conn.cursor()

# Lógica de recomendación (aquí puedes agregar el modelo real)
def generate_recommendations():
    recommendations = [
        {"album_name": "Album A", "artist_name": "Artist A", "genre": "pop", "release_year": 2020, "album_cover": "https://example.com/album_a.jpg"},
        {"album_name": "Album B", "artist_name": "Artist B", "genre": "rock", "release_year": 2019, "album_cover": "https://example.com/album_b.jpg"}
    ]

    # Guardar en Redis
    redis_client.set('recommendations', json.dumps(recommendations))

    # Guardar en PostgreSQL
    for rec in recommendations:
        cursor.execute(
            "INSERT INTO recommendations (album_name, artist_name, genre, release_year, album_cover) VALUES (%s, %s, %s, %s, %s)",
            (rec['album_name'], rec['artist_name'], rec['genre'], rec['release_year'], rec['album_cover'])
        )
    conn.commit()

if __name__ == "__main__":
    generate_recommendations()
    print("Recomendaciones generadas y almacenadas.")
