# 🔧 Troubleshooting - Copiloto PDF

## 🚨 Problemas Comunes y Soluciones

### Error: "vite: not found"
**Síntomas:**
- El frontend no puede encontrar Vite
- Contenedor se reinicia constantemente
- Error 127 en logs del frontend

**Causa:**
- Vite está en devDependencies pero no se instala correctamente
- Problemas de permisos en el contenedor
- Cache de Docker desactualizado

**Solución:**
```bash
# Opción 1: Limpieza completa (recomendado)
./clean-and-rebuild.sh

# Opción 2: Reconstruir solo frontend
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

### Error: "TypeError: Client.__init__() got an unexpected keyword argument 'proxies'"
**Síntomas:**
- Backend no inicia
- Error en vector_utils.py línea 27
- Problema con OpenAI client

**Causa:**
- Versión incompatible de OpenAI client
- Parámetros no soportados en la versión actual

**Solución:**
```bash
# Reconstruir backend con nueva versión de OpenAI
docker-compose build --no-cache backend
docker-compose up -d backend
```

### Error: "OpenAI API Key inválida"
**Síntomas:**
- Errores 401 en llamadas a OpenAI
- Backend funciona pero chat no responde

**Solución:**
```bash
# Verificar archivo .env
cat .env | grep OPENAI_API_KEY

# Si no está configurado:
cp env.example .env
# Editar .env y agregar tu API key real
```

### Contenedores se reinician constantemente
**Síntomas:**
- Estado "Restarting" en docker-compose ps
- Logs muestran errores repetitivos

**Solución:**
```bash
# Diagnóstico completo
./debug.sh

# Limpieza completa
./clean-and-rebuild.sh
```

## 🔍 Diagnóstico Paso a Paso

### 1. Verificar estado actual
```bash
./debug.sh
```

### 2. Verificar logs específicos
```bash
# Backend
docker-compose logs backend

# Frontend
docker-compose logs frontend

# Qdrant
docker-compose logs qdrant
```

### 3. Verificar configuración
```bash
# Variables de entorno
cat .env

# Docker Compose
docker-compose config
```

### 4. Verificar recursos
```bash
# Uso de CPU y memoria
docker stats

# Espacio en disco
df -h
```

## 🛠️ Soluciones Avanzadas

### Reconstruir sin cache
```bash
docker-compose build --no-cache
docker-compose up -d
```

### Limpiar Docker completamente
```bash
docker system prune -a -f
docker volume prune -f
./clean-and-rebuild.sh
```

### Verificar puertos
```bash
# Ver qué está usando los puertos
lsof -i :3000
lsof -i :8000
lsof -i :6333
```

### Modo desarrollo
```bash
# Para desarrollo con hot reload
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

## 📞 Comandos de Emergencia

### Detener todo
```bash
docker-compose down
```

### Reiniciar todo
```bash
docker-compose restart
```

### Ver logs en tiempo real
```bash
docker-compose logs -f
```

### Acceder a contenedor
```bash
# Backend
docker-compose exec backend bash

# Frontend
docker-compose exec frontend sh
```

## 🎯 Verificación Final

Después de aplicar cualquier solución, verifica:

1. **Estado de contenedores:**
   ```bash
   docker-compose ps
   ```

2. **URLs de acceso:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8000
   - API Docs: http://localhost:8000/docs

3. **Health check:**
   ```bash
   curl http://localhost:8000/health
   ```

4. **Logs sin errores:**
   ```bash
   docker-compose logs --tail=10
   ```

## 🆘 Si nada funciona

1. **Reiniciar Docker Desktop** (si usas macOS/Windows)
2. **Verificar espacio en disco**
3. **Actualizar Docker** a la última versión
4. **Contactar soporte** con los logs completos
