const fs = require('fs');

const deleteTempFiles = (files) => {
  if (files) {
    for (let file of Object.values(files)) {
      if (Array.isArray(file)) {
        file.forEach(f => {
          fs.unlinkSync(f.path);  // Elimina el archivo
        });
      } else {
        fs.unlinkSync(file.path);  // Elimina el archivo
      }
    }
  }
};

module.exports = deleteTempFiles;
