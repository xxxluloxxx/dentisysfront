#!/bin/bash

# Colores para los mensajes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Iniciando actualización del frontend de producción...${NC}"

# Navegar al directorio del proyecto
cd "$(dirname "$0")"
echo -e "${GREEN}Directorio actual: $(pwd)${NC}"

# Detener el contenedor de producción
echo -e "${GREEN}Deteniendo contenedor de producción...${NC}"
docker compose -f docker-compose.prod.yml --project-name dentisysfront-prod down

# Eliminar contenedor existente si existe
echo -e "${GREEN}Eliminando contenedor existente si existe...${NC}"
docker rm -f dentisysfront-frontend-prod 2>/dev/null || true

# Actualizar el código
echo -e "${GREEN}Actualizando código desde prod...${NC}"
git checkout prod
git pull origin prod

# Reconstruir y levantar el contenedor de producción
echo -e "${GREEN}Reconstruyendo y levantando contenedor de producción...${NC}"
docker compose -f docker-compose.prod.yml --project-name dentisysfront-prod up -d --build

# Verificar que el contenedor esté corriendo
echo -e "${GREEN}Verificando estado del contenedor...${NC}"
docker ps | grep dentisysfront-frontend-prod

# Verificar logs del contenedor
echo -e "${GREEN}Mostrando logs del contenedor...${NC}"
docker logs dentisysfront-frontend-prod

# Verificar que la aplicación responda
echo -e "${GREEN}Verificando que la aplicación responda...${NC}"
sleep 10
if curl -s http://93.127.217.21:8083 > /dev/null; then
    echo -e "${GREEN}El frontend está respondiendo correctamente${NC}"
else
    echo -e "${RED}¡Advertencia! El frontend no está respondiendo${NC}"
fi

echo -e "${GREEN}¡Actualización del frontend completada!${NC}"
echo -e "El frontend está disponible en:"
echo -e "Producción Frontend: http://93.127.217.21:8083"
