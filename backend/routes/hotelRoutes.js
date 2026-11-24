
const express = require("express");
const router = express.Router();

const pool = require("../config/db");

const {
    createHotel,
    getHotels,
    getHotelById,
    updateHotel,
    deleteHotel
} = require("../controllers/hotelController");

const upload = require("../middleware/upload");

// Get all hotels
router.get("/", getHotels);

// Create a hotel with image
router.post("/", upload.single("image"), createHotel);

// Get one hotel
router.get("/:id", getHotelById);

// Update hotel
router.put("/:id", upload.single("image"), updateHotel);

// Update only hotel image
router.patch("/:id/image", upload.single("image"), async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please select an image"
            });
        }

        const imagePath = `/uploads/${req.file.filename}`;

        const result = await pool.query(
            `UPDATE hotels
             SET image = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2
             RETURNING *`,
            [imagePath, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Hotel not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Hotel image updated successfully",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Image update error:", error.message);

        res.status(500).json({
            success: false,
            message: "Image update failed"
        });
    }
});

// Delete hotel
router.delete("/:id", deleteHotel);

module.exports = router;
