FROM node:20-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema
RUN apk add --no-cache git

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias (incluyendo devDependencies para Vite)
RUN npm ci && npm cache clean --force

# Copiar código del frontend
COPY . .

# Cambiar permisos y propietario
RUN chown -R nextjs:nodejs /app
USER nextjs

# Exponer puerto
EXPOSE 3000

# Variables de entorno por defecto
ENV NODE_ENV=development
ENV VITE_API_URL=http://localhost:8000

# Comando por defecto
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]
