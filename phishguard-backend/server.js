// server.js
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000; // Use environment variable for port

// Middleware to parse JSON
app.use(bodyParser.json());

// Endpoint to handle phishing reports
app.post("/report", (req, res) => {
  const { sender, subject, body } = req.body;

  // Log the report to a file (or save it to a database)
  const report = `Sender: ${sender}\nSubject: ${subject}\nBody: ${body}\n\n`;
  fs.appendFileSync("phishing_reports.txt", report);

  console.log("Phishing report received:", { sender, subject, body });

  // Respond to the client
  res.status(200).json({ success: true, message: "Phishing report received." });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});