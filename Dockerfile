# Etapa de construcción
FROM node:20-alpine as build-stage

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Construir la aplicación
RUN npm run build

# Paso de depuración: mostrar el contenido de dist y el tamaño de index.html
RUN echo "\n--- CONTENIDO DE /app/dist ---" && ls -lh /app/dist && echo "\n--- CONTENIDO DE /app/dist/index.html ---" && cat /app/dist/index.html

# Etapa de producción
FROM nginx:stable-alpine as production-stage

# Copiar la configuración de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos construidos (asegurando el copiado correcto del contenido de dist)
COPY --from=build-stage /app/dist/ /usr/share/nginx/html/

# Cambiar propietario y permisos para Nginx
RUN chown -R nginx:nginx /usr/share/nginx/html && chmod -R 755 /usr/share/nginx/html

# Exponer el puerto 80
EXPOSE 80

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
