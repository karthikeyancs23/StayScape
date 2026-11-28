
const express = require("express");
const router = express.Router();

const {
    createHotel,
    getHotels,
    getHotelById,
    updateHotel,
    updateHotelImage,
    deleteHotel
} = require("../controllers/hotelController");

const upload = require("../middleware/upload");

// Get all hotels
router.get("/", getHotels);

// Create a hotel with image
router.post("/", upload.single("image"), createHotel);

// Get one hotel by ID
router.get("/:id", getHotelById);

// Update hotel details and image
router.put("/:id", upload.single("image"), updateHotel);

// Update only hotel image
router.patch("/:id/image", upload.single("image"), updateHotelImage);

// Delete hotel
router.delete("/:id", deleteHotel);

module.exports = router;
