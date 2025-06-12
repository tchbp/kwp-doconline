// scripts/addPage.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Helper to get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Boilerplate template for new pages
const pageTemplate = (name) => `

const ${name} = () => {
  return <div>${name} Page</div>;
}

export default ${name};
`;

// Function to add route to routes.js
const updateRoutesFile = (name) => {
  const routesPath = path.join(__dirname, "../src/routes.js");
  const newRoute = `{
    title: "${name}",
    url: "/${name.toLowerCase()}",
    component: ${name},
  },`;

  let fileContent = fs.readFileSync(routesPath, "utf-8");

  // Import statement
  const importStatement = `import ${name} from "./pages/${name}";\n`;
  fileContent = importStatement + fileContent;

  // Append route inside the array
  const routesArrayIndex = fileContent.indexOf("export const routes = [");
  const routesArrayEndIndex = fileContent.indexOf("];", routesArrayIndex);
  fileContent = `${fileContent.slice(
    0,
    routesArrayEndIndex
  )}  ${newRoute}\n${fileContent.slice(routesArrayEndIndex)}`;

  fs.writeFileSync(routesPath, fileContent, "utf-8");
  console.log(`✅ Updated routes.js with ${name} route.`);
};

// Main function to create a new page
const createNewPage = (name) => {
  const pagesDir = path.join(__dirname, "../src/pages");
  const pagePath = path.join(pagesDir, `${name}.jsx`);

  if (fs.existsSync(pagePath)) {
    console.log(`❌ Page ${name} already exists.`);
    return;
  }

  // Create the new page file
  fs.writeFileSync(pagePath, pageTemplate(name), "utf-8");
  console.log(`✅ Created ${name}.jsx in pages folder.`);

  // Update routes.js
  updateRoutesFile(name);
};

// CLI command usage: node scripts/addPage.js Contact
const [, , pageName] = process.argv;
if (!pageName) {
  console.log("Please provide a page name.");
  process.exit(1);
}

createNewPage(pageName);
