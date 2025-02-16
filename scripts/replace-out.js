/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '../out');

fs.readdir(outDir, (err, files) => {
  if (err) throw err;

  files.forEach(file => {
    const filePath = path.join(outDir, file);

    if (file.endsWith('.html')) {

      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) throw err;

        const result = data
          .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
            String.fromCharCode(parseInt(code, 16))
          )

        fs.writeFile(filePath, result, 'utf8', (err) => {
          if (err) throw err;
          console.log(`File ${file} updated successfully.`);
        });
      });
    }
  });


});
