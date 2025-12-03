import express from "express";
import bookRoutes from "./routes/bookRoutes";

const app = express();
app.use(express.json());
const PORT = 3000;

app.get("/", (req, res) => {
  res.send("Bookstore API is running");
});

app.use("/", bookRoutes); // bookRoutes already defines /books prefix

export default app; // for tests

// Start the server only when this file is executed directly. Tests import the
// `app` without starting the HTTP server.
const isMainModule = process.argv[1]?.endsWith('app.ts') || process.argv[1]?.endsWith('app.js');
if (isMainModule) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
