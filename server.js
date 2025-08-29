import express from "express";
import cors from "cors";
import connection from "./connection.js";
import env from "dotenv";
import router from "./router.js";
import path from "path";

env.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "100mb" }));
app.use("/api", router);

// Serve frontend (React build folder)
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Connect DB & start server
connection().then(() => {
  const PORT = process.env.PORT || 5000; // fallback for local dev
  app.listen(PORT, () => {
    console.log(`🚀 Server started on http://localhost:${PORT}`);
  });
});
