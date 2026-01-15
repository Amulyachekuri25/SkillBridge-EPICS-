// 📁 Backend/Scraper/run_python_scraper.js
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

// Helper to run a Python scraper dynamically
function runPythonScript(scriptName) {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, scriptName);

    if (!fs.existsSync(pythonScript)) {
      return reject(new Error(`Python scraper not found: ${pythonScript}`));
    }

    const pythonBin = process.env.PYTHON_BIN || process.env.PYTHON || "python";
    console.log(`🐍 Running ${scriptName} using: ${pythonBin}`);

    const child = spawn(pythonBin, [pythonScript], { windowsHide: true });

    child.stdout.on("data", (data) => {
      console.log(`[${scriptName} OUTPUT]: ${data.toString().trim()}`);
    });

    child.stderr.on("data", (data) => {
      console.error(`[${scriptName} ERROR]: ${data.toString().trim()}`);
    });

    child.on("close", (code) => {
      if (code === 0) {
        console.log(`✅ ${scriptName} finished successfully`);
        resolve();
      } else {
        reject(new Error(`${scriptName} exited with code ${code}`));
      }
    });
  });
}

module.exports = { runPythonScript };
