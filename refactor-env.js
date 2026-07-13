const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      if (!dirFile.includes('node_modules') && !dirFile.includes('.git')) {
        filelist = walkSync(dirFile, filelist);
      }
    } else {
      if (file.endsWith('.html') || file.endsWith('.js') || file.endsWith('.jsx')) {
        filelist.push(dirFile);
      }
    }
  });
  return filelist;
};

// 1. Process WordPress Widgets
const wpFiles = walkSync(path.join(__dirname, 'wordpress-widgets'));
wpFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace hardcoded localhost API links (in fetch/axios calls)
  if (content.includes("'http://localhost:5000/api/contact'")) {
    content = content.replace("'http://localhost:5000/api/contact'", "window.GW_API_URL + '/contact'");
  }
  
  // Replace direct frontend links
  content = content.replace(/http:\/\/localhost:5173/g, 'https://portal.gwealthrepublic.com');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated WP Widget:', file);
  }
});

// 2. Process React Frontend
const reactFiles = walkSync(path.join(__dirname, 'portal-frontend', 'src'));
reactFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace 'http://localhost:5000/api/...' or http://localhost:5000/api/...
  // with '/api/...'
  content = content.replace(/['"]http:\/\/localhost:5000(\/api\/[^'"]+)['"]/g, (match, p1) => {
     // match is something like 'http://localhost:5000/api/users'
     // p1 is /api/users
     // We should keep the quotes that surrounded it.
     const quote = match[0];
     // Wait, if it's a template literal like http://localhost:5000/api/users/, it works too.
     return quote + p1 + match[match.length - 1];
  });

  // Specifically handle the weird template literals
  // e.g. http://localhost:5000/api/users//status -> /api/users//status
  // It is covered by the above replace because p1 will be /api/users//status

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated React File:', file);
  }
});

console.log('Refactoring complete.');
