# Dockerfile para Frontend React (Vite + TypeScript)
FROM node:20-alpine

WORKDIR /app

# Copiar descriptores de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el código fuente
COPY . .

# Exponer el puerto de desarrollo de Vite
EXPOSE 5173

# Ejecutar Vite en modo desarrollo accesible desde la red del contenedor
CMD ["npm", "run", "dev", "--", "--host"]
