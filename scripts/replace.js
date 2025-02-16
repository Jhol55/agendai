/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');


const distDir = path.join(__dirname, '../dist');
const originalCode = `(e = l.createElement("div")).innerHTML = "<script></script>", e = e.removeChild(e.firstChild);`;
const replacementCode = `
  e=l.createElement("script");
  e.type="text/javascript";
  l.head.appendChild(e);
`;

fs.readdir(distDir, (err, files) => {
  if (err) throw err;

  files.forEach(file => {
    const filePath = path.join(distDir, file);

    if (file.endsWith('.html')) {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) throw err;

        const result = data
          .replace(originalCode, replacementCode)
          .replace(/self\.__next_f\.push\(\[2,null\]\),self\.__next_f\.push\(\[1,'1:HL\["\.\/_next\/static\/css\/([a-f0-9]{16})\.css","style"\]\\n'\]\),/, "")
          .replace(/<link rel="preload" as="script" fetchPriority="low" href="\/main-app-c21308caf311ba69\.b000e48e\.js">/, "")
          .replace(/\["\$","link","0",\{"rel":"stylesheet","href":"\.\/_next\/static\/css\/([a-f0-9]{16})\.css","precedence":"next","crossOrigin":"\$undefined"\}\]/, "")

        fs.writeFile(filePath, result, 'utf8', (err) => {
          if (err) throw err;
          console.log(`File ${file} updated successfully.`);
        });
      });
    } else if (file.endsWith('.js') || file.endsWith('.css')) {
      fs.unlink(filePath, err => {
        if (err) throw err;
        console.log(`Deleted file: ${file}`);
      });
    }
  });
});
