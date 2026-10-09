import fs from "fs";
import path from "path";
import process from "node:process";
import { Buffer } from "node:buffer";

// Define the root directory and the path for the gas folder
const rootDir = process.cwd(); // Current working directory (root)
const gasDir = path.join(rootDir, "gas"); // Path to the gas folder
const distDir = path.join(rootDir, "dist"); // Path to the dist directory
const assetsDir = path.join(distDir, "assets"); // Path to the assets directory

// Check if the gas directory exists, create if it doesn't
if (!fs.existsSync(gasDir)) {
  fs.mkdirSync(gasDir);
  console.log("Created gas directory.");
}

// Function to find the latest .js or .css file in the assets directory
const findLatestFile = (dir, ext) => {
  const files = fs.readdirSync(dir);
  const latestFile = files
    .filter((file) => file.endsWith(ext))
    .sort()
    .pop(); // Get the latest file
  return latestFile ? path.join(dir, latestFile) : null;
};

// Find the latest index.js and index.css files in the assets directory
const jsFile = findLatestFile(assetsDir, ".js");
const cssFile = findLatestFile(assetsDir, ".css");

if (!jsFile || !cssFile) {
  console.error("JavaScript or CSS file not found in the assets directory.");
  process.exit(1);
}

// Read the content of the files
const cssContent = fs.readFileSync(cssFile, "utf8");
let jsContent = fs.readFileSync(jsFile, "utf8");

// Remove any ES module export syntax if present
jsContent = jsContent.replace(/\bexport\s+default\s+[^;]+;?/g, "");
jsContent = jsContent.replace(/\bexport\s*\{[^}]*\};?/g, "");

// Validate syntax before packaging to prevent "Unexpected token 'export'" or other runtime syntax errors
try {
  new Function(jsContent);
  console.log("Syntax validation passed: JS bundle is valid for classic script execution.");
} catch (err) {
  console.error("Syntax error detected in bundled JS:", err.message);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// GAS-safe JS delivery
//
// Google Apps Script strips /* ... */ comments when serving HtmlService
// content. Its stripper is not string-aware, so a `/*` that merely appears
// inside a string literal pairs up with a later real `*/` and swallows every
// character in between (it removed ~300KB of real code from this bundle,
// including a `catch` clause, producing
// "SyntaxError: Missing catch or finally after try" and a blank page).
//
// To make that impossible we never hand GAS the raw bundle: the file it
// serves only contains base64 (A–Z a–z 0–9 + / =) — no comment delimiters at
// all — and the browser rebuilds the original source with TextDecoder before
// evaluating it. There is no CSP on the userCodeAppPanel origin, so
// `new Function` is allowed.
// ---------------------------------------------------------------------------
const b64 = Buffer.from(jsContent, "utf8").toString("base64");
const loader =
  "try{" +
  `new Function(new TextDecoder().decode(Uint8Array.from(atob("${b64}"),function(c){return c.charCodeAt(0)})))()` +
  "}catch(e){console.error(e);var p=document.createElement('pre');p.style.cssText='padding:16px;color:#c00;background:#fff1f0;border:1px solid #ffa39e;margin:20px;border-radius:6px;white-space:pre-wrap;font-family:monospace;';p.textContent='PDF editor failed to start: '+(e&&(e.stack||e.message)||e);document.body.appendChild(p)}";

if (loader.includes("/*") || loader.includes("*/")) {
  console.error("Loader still contains comment markers — aborting.");
  process.exit(1);
}

// Create HTML files for JavaScript and CSS in the gas directory
const jsHtmlPath = path.join(gasDir, "js.html");
const cssHtmlPath = path.join(gasDir, "css.html");

fs.writeFileSync(jsHtmlPath, `<script>${loader}</script>`);
fs.writeFileSync(cssHtmlPath, `<style>${cssContent}</style>`);

console.log(
  `Created js.html (base64-wrapped, ${b64.length} chars) and css.html in the gas directory successfully!`
);
