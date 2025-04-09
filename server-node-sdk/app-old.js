const express = require("express");
const app = express();
const PORT = 5000;
const cors = require("cors");


app.use(express.json()); // Middleware to parse JSON

app.use(cors());
// Sample GET endpoint
app.get("/data", (req, res) => {
    res.json({ data: "Hello from Express API!" });
});

// Sample POST endpoint
app.post("/data", (req, res) => {
    const { name } = req.body;
    res.json({ message: `Received data for ${name}`});
});

// Start the server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
