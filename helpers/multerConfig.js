// multerConfig.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de Multer para almacenar los archivos temporalmente
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads/temp');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir); // La carpeta donde se almacenarán los archivos temporalmente
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Asigna un nombre único a cada archivo
  }
});

const upload = multer({ storage });

// Exportar el middleware para usar en las rutas
module.exports = upload;
