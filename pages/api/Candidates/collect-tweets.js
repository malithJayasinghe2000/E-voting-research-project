// pages/api/Candidates/collect-tweets.js
import { spawn } from 'child_process';
import path from 'path';

let activeProcess = null;

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Kill any existing process
    if (activeProcess) {
      activeProcess.kill();
      activeProcess = null;
    }
  
    const { start_date, end_date, candidate_keywords, general_keywords } = req.body;
  
    if (!start_date || !end_date || (!candidate_keywords && !general_keywords)) {
      return res.status(400).json({ error: "Missing required fields" });
    }
  
    const queryParts = [
      ...Object.entries(candidate_keywords).map(([name, data]) =>
        `(${name} ${data.keywords.split(',').join(' OR ')})`
      ),
      ...general_keywords.map(keyword => `(${keyword})`)
    ];
  
    const finalQuery = queryParts.join(' OR ');
    const scriptPath = path.resolve(process.cwd(), 'pages/api/Candidates/collect_tweets.py');
  
    // Start subprocess
    activeProcess = spawn('python', [
      scriptPath,
      start_date,
      end_date,
      finalQuery
    ]);
  
    // ✅ Respond immediately before waiting for Python
    res.status(202).json({ message: 'Collection started successfully' });
  
    // Background handling
    let output = [];
    activeProcess.stdout.on('data', (data) => {
      console.log(`Python Output: ${data}`);
      output.push(data.toString());
    });
  
    activeProcess.stderr.on('data', (data) => {
      console.error(`Python Error: ${data}`);
      output.push(`ERROR: ${data.toString()}`);
    });
  
    activeProcess.on('close', (code) => {
      activeProcess = null;
      console.log(`Process finished with code ${code}`);
      // Optional: Save output somewhere (e.g., DB, log file)
    });
  
  } 
}  