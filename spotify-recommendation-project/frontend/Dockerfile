# Dockerfile para el Frontend (React)
FROM node:14

WORKDIR /app

# Copiar package.json y package-lock.json para instalar dependencias
COPY package*.json ./

RUN npm install

# Copiar los archivos del frontend
COPY . ./

EXPOSE 3000

CMD ["npm", "start"]
