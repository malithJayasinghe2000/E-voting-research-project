const { spawn } = require("child_process");

let pythonProcess = null; // Store the running process

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { start_date, end_date, finalQuery } = req.body;

    if (!start_date || !end_date || !finalQuery) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (pythonProcess) {
      return res.status(400).json({ error: "Tweet collection is already running." });
    }

    try {
      console.log("Starting tweet collection...");
      pythonProcess = spawn("python", ["collect_tweets.py", start_date, end_date, finalQuery]);

      pythonProcess.stdout.on("data", (data) => {
        console.log(`Python Output: ${data}`);
      });

      pythonProcess.stderr.on("data", (data) => {
        console.error(`Python Error: ${data}`);
      });

      pythonProcess.on("close", (code) => {
        console.log(`Python script exited with code ${code}`);
        pythonProcess = null;
      });

      res.json({ success: true, message: "Tweet collection started!" });
    } catch (error) {
      console.error("Error starting tweet collection:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else if (req.method === "DELETE") {
    // Stop collection
    if (pythonProcess) {
      pythonProcess.kill("SIGTERM"); // Gracefully terminate the process
      pythonProcess = null;
      console.log("Tweet collection stopped.");
      res.json({ success: true, message: "Tweet collection stopped!" });
    } else {
      res.status(400).json({ error: "No tweet collection is running." });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
