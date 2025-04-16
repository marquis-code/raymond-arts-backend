const fs = require('fs');
const path = require('path');

// Source and destination directories
const sourceDir = path.join(__dirname, 'src/templates');
const destDir = path.join(__dirname, 'dist/templates');

// Create a function to copy directory recursively
function copyDir(src, dest) {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // Read all files in the source directory
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    // If it's a directory, recursively copy it
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      // Otherwise, copy the file
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied: ${srcPath} -> ${destPath}`);
    }
  }
}

// Execute the copy
try {
  copyDir(sourceDir, destDir);
  console.log('Templates copied successfully!');
} catch (error) {
  console.error('Error copying templates:', error);
}