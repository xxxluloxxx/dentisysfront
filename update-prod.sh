#!/bin/bash

# Colores para los mensajes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Iniciando actualización del entorno de producción...${NC}"

# Navegar al directorio del proyecto
cd "$(dirname "$0")"

# Hacer backup de la base de datos antes de actualizar
echo -e "${GREEN}Realizando backup de la base de datos...${NC}"
docker exec dentisys-prod pg_dump -U postgres dentisys > backup_$(date +%Y%m%d_%H%M%S).sql

# Detener el contenedor de producción
echo -e "${GREEN}Deteniendo contenedor de producción...${NC}"
docker compose -f docker-compose.prod.yml down

# Actualizar el código
echo -e "${GREEN}Actualizando código desde prod...${NC}"
git checkout prod
git pull origin prod

# Reconstruir y levantar el contenedor de producción
echo -e "${GREEN}Reconstruyendo y levantando contenedor de producción...${NC}"
docker compose -f docker-compose.prod.yml up -d --build

# Verificar que el contenedor esté corriendo
echo -e "${GREEN}Verificando estado del contenedor...${NC}"
docker ps | grep dentisysfront-frontend

# Verificar logs del contenedor
echo -e "${GREEN}Mostrando logs del contenedor...${NC}"
docker logs dentisysfront-frontend-1

# Verificar que la aplicación responda
echo -e "${GREEN}Verificando que la aplicación responda...${NC}"
sleep 10
if curl -s http://93.127.217.21:8083 > /dev/null; then
    echo -e "${GREEN}La aplicación está respondiendo correctamente${NC}"
else
    echo -e "${RED}¡Advertencia! La aplicación no está respondiendo${NC}"
fi

echo -e "${GREEN}¡Actualización completada!${NC}"
echo -e "La aplicación está disponible en:"
echo -e "Producción Frontend: http://93.127.217.21:8083"
echo -e "Producción Backend: http://93.127.217.21:8080"
