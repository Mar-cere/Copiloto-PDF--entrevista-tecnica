FROM node:20-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema
RUN apk add --no-cache git

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias (incluyendo devDependencies para Vite)
RUN npm ci && npm cache clean --force

# Copiar código del frontend
COPY . .

# Exponer puerto
EXPOSE 3000

# Variables de entorno por defecto
ENV NODE_ENV=development
ENV VITE_API_URL=http://localhost:8000

# Comando por defecto
CMD ["sh", "-c", "npm run dev -- --host 0.0.0.0 --port 3000"]
