import express from "express"
import { scrapeUrl } from "./scraper.js"
import puppeteer from "puppeteer";
import cors from "cors"

const app = express();
app.use(express.json());
app.use(cors());
 app.use((req, res, next) => {
  res.on("finish", () => {
    if (global.gc) {
      global.gc(); // Force garbage collection after each request
      console.log("Manual garbage collection triggered");
    }
  });
  next();
});
app.post("/scrape", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL is required" });
  const   browser = await puppeteer.launch({
    headless: true,
    timeout: 90000, // Run in headless mode for faster and lighter operation
    args:[
        '--no-sandbox', // Disables the sandbox for resource efficiency
        '--disable-setuid-sandbox', // Required for non-root environments like Cloud Run
        '--disable-dev-shm-usage', // Use /tmp instead of shared memory for large pages
        '--disable-accelerated-2d-canvas', // Disable hardware acceleration for 2D
        '--disable-gpu', // Disable GPU for headless operation
        '--no-zygote', // Minimizes browser processes
        '--no-first-run', // Avoids unnecessary startup processes
        '--disable-background-networking', // Reduces background network traffic
        '--disable-default-apps', // Saves resources by not loading default apps
        '--disable-extensions', // Prevents loading unnecessary browser extensions
        '--disable-sync', // Avoids syncing data to a Google account
        '--disable-translate', // Disables translation services
        '--hide-scrollbars', // Improves rendering performance
        '--mute-audio', // Disables audio playback to save resources
    ],
    // executablePath: process.env.CHROME_BIN || null, // Use Google-provided Chrome in environments like Cloud Run
  });
  
  try {
    
    let data = await scrapeUrl(url, browser)
     await browser.close()
     if(!browser.connected){
      console.log("Disconnected Browser")
     }
        res.json(data)
  } catch (error) {
    await browser.close()
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 8081; 
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));