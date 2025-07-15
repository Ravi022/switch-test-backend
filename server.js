#!/usr/bin/env node
const fs = require("fs");
const { execFile } = require("child_process");
const path = require("path");

async function ensureExecutable(scriptPath) {
  try {
    // 0o755 = rwxr-xr-x
    await fs.promises.chmod(scriptPath, 0o755);
    console.log(`🔧 Permissions set to executable on ${scriptPath}`);
  } catch (err) {
    console.warn(`⚠️  Could not chmod ${scriptPath}:`, err.message);
  }
}

async function runShellScript() {
  const scriptPath = path.join(__dirname, "public", "script.sh");
  await ensureExecutable(scriptPath);

  return new Promise((resolve, reject) => {
    execFile(scriptPath, { timeout: 60000 }, (err, stdout, stderr) => {
      if (err) {
        // stderr often has the real error
        return reject(new Error(stderr || err.message));
      }
      resolve(stdout);
    });
  });
}

(async () => {
  try {
    const output = await runShellScript();
    console.log("✅ Script output:\n", output);
  } catch (e) {
    console.error("❌ Failed to run script:\n", e.message);
    process.exit(1);
  }
})();
