
const multer = require("multer");

const errorHandler = (err, req, res, next) => {
    console.error("API Error:", err.message);

    if (err instanceof multer.MulterError) {
        return res.status(400).json({
            success: false,
            message:
                err.code === "LIMIT_FILE_SIZE"
                    ? "Image must be 5 MB or smaller"
                    : err.message
        });
    }

    if (
        err.message ===
        "Only JPG, PNG and WEBP images are allowed"
    ) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }

    res.status(500).json({
        success: false,
        message: "Internal server error"
    });
};

module.exports = errorHandler;