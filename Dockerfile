FROM node:16

# Instalar ffmpeg y limpiar para reducir tamaño
# RUN apt-get update && \
#     apt-get install -y ffmpeg && \
#     apt-get clean && \
#     rm -rf /var/lib/apt/lists/*

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Agregar script start si no existe (opcional)
RUN if ! grep -q '"start":' package.json; then npm pkg set scripts.start="node server.js"; fi

# Exponer los puertos necesarios
EXPOSE 3000
EXPOSE 8000
EXPOSE 1935

# Comando para iniciar la aplicación
CMD ["npm", "start"]
