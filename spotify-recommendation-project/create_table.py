import psycopg2
from dotenv import load_dotenv
import os

# Cargar las variables de entorno
load_dotenv()

# Configuración de la base de datos
PG_USER = os.getenv('PG_USER')
PG_PASSWORD = os.getenv('PG_PASSWORD')
PG_HOST = 'localhost'  # Usamos localhost para conectar desde fuera del contenedor
PG_DB = os.getenv('PG_DB')

try:
    # Conexión a la base de datos PostgreSQL
    conn = psycopg2.connect(
        dbname=PG_DB,
        user=PG_USER,
        password=PG_PASSWORD,
        host=PG_HOST,
        port="5432"
    )
    cur = conn.cursor()

    # Crear la tabla 'recommendations' si no existe
    cur.execute("""
        CREATE TABLE IF NOT EXISTS recommendations (
            id SERIAL PRIMARY KEY,
            track_name VARCHAR(255),
            artist_name VARCHAR(255)
        );
    """)
    conn.commit()

    print("Tabla 'recommendations' creada correctamente.")

except Exception as e:
    print(f"Error al conectar a la base de datos o al crear la tabla: {e}")

finally:
    if cur:
        cur.close()
    if conn:
        conn.close()
