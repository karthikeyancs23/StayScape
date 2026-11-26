
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const pool = require("./config/db");
const hotelRoutes = require("./routes/hotelRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173"
}));

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

// Debug database connection
app.get("/api/debug-db", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                current_database() AS database_name,
                current_user AS username,
                inet_server_port() AS port,
                (SELECT COUNT(*) FROM public.hotels) AS total_hotels
        `);

        res.status(200).json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Debug database error:", error.message);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});



app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
);

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API route not found"
    });
});

// Global error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`StayScape server running on port ${PORT}`);
});
