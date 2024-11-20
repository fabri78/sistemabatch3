FROM node:18-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar el archivo package.json y package-lock.json
COPY package*.json ./

# Instalar las dependencias
RUN npm install

# Copiar el código del proyecto
COPY . .

# Exponer el puerto para el backend
EXPOSE 3001

# Comando para ejecutar la aplicación
CMD ["node", "index.js"]
