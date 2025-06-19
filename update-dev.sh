#!/bin/bash

# Colores para los mensajes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Iniciando actualización del frontend de desarrollo...${NC}"

# Navegar al directorio del proyecto
cd "$(dirname "$0")"
echo -e "${GREEN}Directorio actual: $(pwd)${NC}"

# Detener el contenedor de desarrollo
echo -e "${GREEN}Deteniendo contenedor de desarrollo...${NC}"
docker compose -f docker-compose.dev.yml down

# Actualizar el código
echo -e "${GREEN}Actualizando código desde main...${NC}"
git checkout main
git pull origin main

# Reconstruir y levantar el contenedor de desarrollo
echo -e "${GREEN}Reconstruyendo y levantando contenedor de desarrollo...${NC}"
docker compose -f docker-compose.dev.yml up -d --build

# Verificar que el contenedor esté corriendo
echo -e "${GREEN}Verificando estado del contenedor...${NC}"
docker ps | grep dentisysfront-frontend-dev

# Verificar logs del contenedor
echo -e "${GREEN}Mostrando logs del contenedor...${NC}"
docker logs dentisysfront-frontend-dev

# Verificar que la aplicación responda
echo -e "${GREEN}Verificando que la aplicación responda...${NC}"
sleep 10
if curl -s http://93.127.217.21:5173 > /dev/null; then
    echo -e "${GREEN}El frontend está respondiendo correctamente${NC}"
else
    echo -e "${RED}¡Advertencia! El frontend no está respondiendo${NC}"
fi

echo -e "${GREEN}¡Actualización del frontend completada!${NC}"
echo -e "El frontend está disponible en:"
echo -e "Desarrollo Frontend: http://93.127.217.21:5173"
