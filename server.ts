import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const app = express();
const PORT = 3000;

// Increase payload limit for base64 images
app.use(express.json({ limit: '50mb' }));

// Setup SQLite
const dbDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}
const db = new Database(path.join(dbDir, "database.sqlite"));

db.exec(`
  CREATE TABLE IF NOT EXISTS history (
    id TEXT PRIMARY KEY,
    timestamp INTEGER,
    imageSrc TEXT,
    result TEXT,
    isFavorite INTEGER,
    savingsMode INTEGER
  )
`);

// API Routes
app.get("/api/history", (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM history ORDER BY timestamp DESC").all();
    const history = rows.map((row: any) => ({
      id: row.id,
      timestamp: row.timestamp,
      imageSrc: row.imageSrc,
      result: JSON.parse(row.result),
      isFavorite: Boolean(row.isFavorite),
      savingsMode: Boolean(row.savingsMode)
    }));
    res.json(history);
  } catch (error) {
    console.error("Failed to fetch history:", error);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

app.post("/api/history", (req, res) => {
  try {
    const { id, timestamp, imageSrc, result, isFavorite, savingsMode } = req.body;
    const stmt = db.prepare(`
      INSERT INTO history (id, timestamp, imageSrc, result, isFavorite, savingsMode)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, timestamp, imageSrc, JSON.stringify(result), isFavorite ? 1 : 0, savingsMode ? 1 : 0);
    res.json({ success: true });
  } catch (error) {
    console.error("Failed to save history:", error);
    res.status(500).json({ error: "Failed to save history" });
  }
});

app.put("/api/history/:id/favorite", (req, res) => {
  try {
    const { isFavorite } = req.body;
    const stmt = db.prepare("UPDATE history SET isFavorite = ? WHERE id = ?");
    stmt.run(isFavorite ? 1 : 0, req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error("Failed to update favorite status:", error);
    res.status(500).json({ error: "Failed to update favorite status" });
  }
});

app.delete("/api/history/:id", (req, res) => {
  try {
    const stmt = db.prepare("DELETE FROM history WHERE id = ?");
    stmt.run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error("Failed to delete history:", error);
    res.status(500).json({ error: "Failed to delete history" });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
