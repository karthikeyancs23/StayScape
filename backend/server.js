const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const pool = require("./config/db");
const hotelRoutes = require("./routes/hotelRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Allowed frontend origins
const allowedOrigins = [
    "http://localhost:5173",
    process.env.FRONTEND_URL
].filter(Boolean);

// CORS configuration
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
    }
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded hotel images
app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
);

// Root route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Welcome to StayScape API"
    });
});

// Health check
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "StayScape backend is running"
    });
});

// Database test
app.get("/api/db-test", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT NOW() AS current_time, current_database() AS database_name"
        );

        res.status(200).json({
            success: true,
            message: "PostgreSQL connected successfully",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Database error:", error.message);

        res.status(500).json({
            success: false,
            message: "Database connection failed"
        });
    }
});

// Hotel APIs
app.use("/api/hotels", hotelRoutes);

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API route not found"
    });
});

// Global error handler
app.use(errorHandler);

// Render provides the PORT environment variable
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`StayScape server running on port ${PORT}`);
});