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

    try {
      const { start_date, end_date, candidate_keywords, general_keywords } = req.body;

      // Input validation
      if (!start_date || !end_date || (!candidate_keywords && !general_keywords)) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Build query parameters
      const queryParts = [
        ...Object.entries(candidate_keywords).map(([name, keywords]) => 
          `(${name} ${keywords.split(',').join(' OR ')})`
        ),
        ...general_keywords.map(keyword => `(${keyword})`)
      ];
      
      const finalQuery = queryParts.join(' OR ');
      const scriptPath = path.resolve(process.cwd(), 'pages/api/Candidates/collect_tweets.py');

      // Create new process
      activeProcess = spawn('python', [
        scriptPath,
        start_date,
        end_date,
        finalQuery
      ]);

      // Set up response timeout
      const responseTimeout = setTimeout(() => {
        if (!res.headersSent) {
          res.status(202).json({ 
            message: 'Collection started successfully',
            warning: 'Process may take longer to complete'
          });
        }
      }, 5000); // Send initial response after 5 seconds

      // Handle process output
      let output = [];
      activeProcess.stdout.on('data', (data) => {
        console.log(`Python Output: ${data}`);
        output.push(data.toString());
      });

      activeProcess.stderr.on('data', (data) => {
        console.error(`Python Error: ${data}`);
        output.push(`ERROR: ${data.toString()}`);
      });

      // Handle process completion
      activeProcess.on('close', (code) => {
        clearTimeout(responseTimeout);
        activeProcess = null;
        
        if (!res.headersSent) {
          if (code === 0) {
            res.status(200).json({ 
              success: true,
              message: 'Collection completed',
              output: output.join('\n')
            });
          } else {
            res.status(500).json({ 
              error: 'Process failed',
              output: output.join('\n')
            });
          }
        }
      });

    } catch (error) {
      console.error('Initialization error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  } else if (req.method === 'DELETE') {
    // Handle process termination
    if (activeProcess) {
      activeProcess.kill();
      activeProcess = null;
      res.status(200).json({ message: 'Collection stopped' });
    } else {
      res.status(404).json({ message: 'No active collection' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}