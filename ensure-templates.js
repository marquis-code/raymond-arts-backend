const fs = require('fs');
const path = require('path');

// Define the templates directory path
const templatesDir = path.join(__dirname, 'templates/emails');

// Create the directory if it doesn't exist
if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true });
  console.log(`Created templates directory at: ${templatesDir}`);
} else {
  console.log(`Templates directory already exists at: ${templatesDir}`);
}

// Create a basic layout template if it doesn't exist
const layoutPath = path.join(templatesDir, 'layout.hbs');
if (!fs.existsSync(layoutPath)) {
  const layoutTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 20px; background-color: #f8f4ef; }
    .content { padding: 20px; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #888; background-color: #f8f4ef; }
  </style>
</head>
<body>
  <div class="header">
    <img src="{{shopLogo}}" alt="{{shopName}}" style="max-width: 180px; height: auto;">
  </div>
  <div class="content">
    {{> @partial-block }}
  </div>
  <div class="footer">
    <p>{{shopAddress}}<br>{{shopPhone}} | {{shopEmail}}</p>
    <p>&copy; {{currentYear}} {{shopName}}. All rights reserved.</p>
  </div>
</body>
</html>`;

  fs.writeFileSync(layoutPath, layoutTemplate);
  console.log(`Created basic layout template at: ${layoutPath}`);
}

console.log('Template setup complete!');