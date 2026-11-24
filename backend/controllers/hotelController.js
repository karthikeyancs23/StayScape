
const pool = require("../config/db");
const fs = require("fs");
const path = require("path");

// Delete an uploaded image from the server
const deleteImageFile = (imagePath) => {
    if (!imagePath) return;

    const filename = path.basename(imagePath);
    const fullPath = path.join(__dirname, "..", "uploads", filename);

    if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
    }
};

// Validate hotel fields
const validateHotel = (data) => {
    const { title, description, latitude, longitude, price } = data;

    if (
        typeof title !== "string" ||
        !title.trim() ||
        title.trim().length > 150
    ) {
        return "Title is required and must be at most 150 characters";
    }

    if (typeof description !== "string" || !description.trim()) {
        return "Description is required";
    }

    const lat = Number(latitude);
    const lng = Number(longitude);
    const hotelPrice = Number(price);

    if (
        latitude === "" || latitude === undefined ||
        !Number.isFinite(lat) || lat < -90 || lat > 90
    ) {
        return "Enter a valid latitude";
    }

    if (
        longitude === "" || longitude === undefined ||
        !Number.isFinite(lng) || lng < -180 || lng > 180
    ) {
        return "Enter a valid longitude";
    }

    if (
        price === "" || price === undefined ||
        !Number.isFinite(hotelPrice) || hotelPrice <= 0
    ) {
        return "Price must be greater than zero";
    }

    return null;
};

// POST - Create hotel
const createHotel = async (req, res, next) => {
    try {
        const error = validateHotel(req.body);

        if (error) {
            if (req.file) deleteImageFile(req.file.filename);
            return res.status(400).json({
                success: false,
                message: error
            });
        }

        const {
            title,
            description,
            latitude,
            longitude,
            price
        } = req.body;

        const image = req.file
            ? `/uploads/${req.file.filename}`
            : null;

        const query = `
            INSERT INTO hotels
            (title, description, latitude, longitude, price, image)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;

        const values = [
            title.trim(),
            description.trim(),
            Number(latitude),
            Number(longitude),
            Number(price),
            image
        ];

        const result = await pool.query(query, values);

        res.status(201).json({
            success: true,
            message: "Hotel created successfully",
            data: result.rows[0]
        });

    } catch (error) {
        if (req.file) deleteImageFile(req.file.filename);
        next(error);
    }
};

// GET - Get all hotels with search, price filters and pagination
const getHotels = async (req, res, next) => {
    try {
        const {
            search = "",
            minPrice,
            maxPrice,
            page = 1,
            limit = 6
        } = req.query;

        const pageNumber = Number(page);
        const limitNumber = Number(limit);

        if (
            !Number.isInteger(pageNumber) || pageNumber < 1 ||
            !Number.isInteger(limitNumber) ||
            limitNumber < 1 || limitNumber > 100
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid page or limit"
            });
        }

        if (
            (minPrice !== undefined &&
                (minPrice === "" || !Number.isFinite(Number(minPrice)) || Number(minPrice) < 0)) ||
            (maxPrice !== undefined &&
                (maxPrice === "" || !Number.isFinite(Number(maxPrice)) || Number(maxPrice) < 0))
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid price filter"
            });
        }

        if (
            minPrice !== undefined &&
            maxPrice !== undefined &&
            Number(minPrice) > Number(maxPrice)
        ) {
            return res.status(400).json({
                success: false,
                message: "Minimum price cannot exceed maximum price"
            });
        }

        const conditions = [];
        const values = [];

        if (search.trim()) {
            values.push(`%${search.trim()}%`);
            conditions.push(`title ILIKE $${values.length}`);
        }

        if (minPrice !== undefined) {
            values.push(Number(minPrice));
            conditions.push(`price >= $${values.length}`);
        }

        if (maxPrice !== undefined) {
            values.push(Number(maxPrice));
            conditions.push(`price <= $${values.length}`);
        }

        const whereClause = conditions.length
            ? `WHERE ${conditions.join(" AND ")}`
            : "";

        const countQuery = `
            SELECT COUNT(*) AS total
            FROM hotels
            ${whereClause}
        `;

        const countResult = await pool.query(countQuery, values);
        const total = Number(countResult.rows[0].total);

        const offset = (pageNumber - 1) * limitNumber;

        const dataValues = [...values, limitNumber, offset];

        const dataQuery = `
            SELECT *
            FROM hotels
            ${whereClause}
            ORDER BY created_at DESC, id DESC
            LIMIT $${dataValues.length - 1}
            OFFSET $${dataValues.length}
        `;

        const result = await pool.query(dataQuery, dataValues);

        res.status(200).json({
            success: true,
            message: "Hotels retrieved successfully",
            data: result.rows,
            pagination: {
                total,
                page: pageNumber,
                limit: limitNumber,
                totalPages: Math.ceil(total / limitNumber)
            }
        });

    } catch (error) {
        next(error);
    }
};

// GET - Get one hotel by ID
const getHotelById = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid hotel ID"
            });
        }

        const result = await pool.query(
            "SELECT * FROM hotels WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Hotel not found"
            });
        }

        res.status(200).json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
};

// PUT - Update hotel
const updateHotel = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            if (req.file) deleteImageFile(req.file.filename);
            return res.status(400).json({
                success: false,
                message: "Invalid hotel ID"
            });
        }

        const error = validateHotel(req.body);

        if (error) {
            if (req.file) deleteImageFile(req.file.filename);
            return res.status(400).json({
                success: false,
                message: error
            });
        }

        const existing = await pool.query(
            "SELECT * FROM hotels WHERE id = $1",
            [id]
        );

        if (existing.rows.length === 0) {
            if (req.file) deleteImageFile(req.file.filename);
            return res.status(404).json({
                success: false,
                message: "Hotel not found"
            });
        }

        const oldHotel = existing.rows[0];

        const image = req.file
            ? `/uploads/${req.file.filename}`
            : oldHotel.image;

        const query = `
            UPDATE hotels
            SET
                title = $1,
                description = $2,
                latitude = $3,
                longitude = $4,
                price = $5,
                image = $6,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $7
            RETURNING *
        `;

        const values = [
            req.body.title.trim(),
            req.body.description.trim(),
            Number(req.body.latitude),
            Number(req.body.longitude),
            Number(req.body.price),
            image,
            id
        ];

        const result = await pool.query(query, values);

        if (req.file && oldHotel.image) {
            deleteImageFile(oldHotel.image);
        }

        res.status(200).json({
            success: true,
            message: "Hotel updated successfully",
            data: result.rows[0]
        });

    } catch (error) {
        if (req.file) deleteImageFile(req.file.filename);
        next(error);
    }
};

// DELETE - Delete hotel
const deleteHotel = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid hotel ID"
            });
        }

        const result = await pool.query(
            "DELETE FROM hotels WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Hotel not found"
            });
        }

        deleteImageFile(result.rows[0].image);

        res.status(200).json({
            success: true,
            message: "Hotel deleted successfully"
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    createHotel,
    getHotels,
    getHotelById,
    updateHotel,
    deleteHotel
};