// server.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { execFile } = require("child_process");
const util = require("util");

const chmod = util.promisify(fs.chmod);

const app = express();
const PORT = process.env.PORT || 8000;
const SCRIPT_PATH = path.join(__dirname, "public", "script.sh");

app.use(cors());
app.use(express.json());

app.get("/api/run-script", async (req, res) => {
  try {
    // 1) Ensure the script is executable by owner, group, others (rwx-r-x-r-x)
    await chmod(SCRIPT_PATH, 0o755);

    // 2) Run it
    // { timeout: 60000 },
    execFile(SCRIPT_PATH,  (error, stdout, stderr) => {
      if (error) {
        console.error("❌ script error:", stderr || error);
        return res
          .status(500)
          .json({ success: false, error: stderr || error.message });
      }
      console.log("✅ script output:", stdout);
      res.json({ success: true, output: stdout });
    });
  } catch (err) {
    console.error("❌ permission/exec error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://127.0.0.1:${PORT}`);
});
