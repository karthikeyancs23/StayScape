
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getHotelById, updateHotel } from "../services/hotelService";
import { ArrowLeft, Save, Upload } from "lucide-react";
import "./HotelForm.css";

const IMAGE_BASE_URL = "http://localhost:5000";

function EditHotel() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        latitude: "",
        longitude: "",
        price: ""
    });

    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        const loadHotel = async () => {
            try {
                const response = await getHotelById(id);
                const hotel = response.data;

                if (!active) return;

                setFormData({
                    title: hotel.title || "",
                    description: hotel.description || "",
                    latitude: hotel.latitude ?? "",
                    longitude: hotel.longitude ?? "",
                    price: hotel.price ?? ""
                });

                setPreview(
                    hotel.image
                        ? `${IMAGE_BASE_URL}${hotel.image}`
                        : ""
                );
            } catch (err) {
                if (active) {
                    setError(
                        err.response?.data?.message ||
                        "Unable to load hotel details."
                    );
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        loadHotel();

        return () => {
            active = false;
        };
    }, [id]);

    useEffect(() => {
        if (!image) return;

        const imageUrl = URL.createObjectURL(image);
        setPreview(imageUrl);

        return () => URL.revokeObjectURL(imageUrl);
    }, [image]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setError("Please select a valid image.");
            e.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("Image size must be less than 5 MB.");
            e.target.value = "";
            return;
        }

        setError("");
        setImage(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const { title, description, latitude, longitude, price } = formData;

        if (!title.trim() || !description.trim()) {
            setError("Title and description are required.");
            return;
        }

        if (
            latitude.trim() === "" ||
            !Number.isFinite(Number(latitude)) ||
            Number(latitude) < -90 ||
            Number(latitude) > 90
        ) {
            setError("Enter a valid latitude between -90 and 90.");
            return;
        }

        if (
            longitude.trim() === "" ||
            !Number.isFinite(Number(longitude)) ||
            Number(longitude) < -180 ||
            Number(longitude) > 180
        ) {
            setError("Enter a valid longitude between -180 and 180.");
            return;
        }

        if (
            price.trim() === "" ||
            !Number.isFinite(Number(price)) ||
            Number(price) <= 0
        ) {
            setError("Price must be greater than zero.");
            return;
        }

        const data = new FormData();

        data.append("title", title.trim());
        data.append("description", description.trim());
        data.append("latitude", latitude);
        data.append("longitude", longitude);
        data.append("price", price);

        // Only send a new image if the user selected one
        if (image) {
            data.append("image", image);
        }

        try {
            setSaving(true);

            await updateHotel(id, data);

            navigate("/", {
                state: { message: "Hotel updated successfully!" }
            });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to update hotel. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="hotel-form-page">
                <p>Loading hotel details...</p>
            </div>
        );
    }

    return (
        <div className="hotel-form-page">
            <div className="hotel-form-heading">
                <button
                    type="button"
                    className="back-button"
                    onClick={() => navigate("/")}
                >
                    <ArrowLeft size={17} />
                    Back to hotels
                </button>

                <p className="form-eyebrow">STAYSCAPE MANAGEMENT</p>
                <h1>Edit Hotel</h1>
                <p className="form-subtitle">
                    Update your property information.
                </p>
            </div>

            <form className="hotel-form" onSubmit={handleSubmit}>
                <div className="form-section">
                    <h2>Hotel Information</h2>

                    <div className="form-group">
                        <label htmlFor="title">Hotel Name *</label>
                        <input
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            maxLength={150}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description *</label>
                        <textarea
                            id="description"
                            name="description"
                            rows="5"
                            value={formData.description}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="form-section">
                    <h2>Hotel Location</h2>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="latitude">Latitude *</label>
                            <input
                                id="latitude"
                                type="number"
                                step="any"
                                name="latitude"
                                value={formData.latitude}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="longitude">Longitude *</label>
                            <input
                                id="longitude"
                                type="number"
                                step="any"
                                name="longitude"
                                value={formData.longitude}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h2>Pricing</h2>

                    <div className="form-group">
                        <label htmlFor="price">Price per Night (₹) *</label>
                        <input
                            id="price"
                            type="number"
                            step="0.01"
                            min="0.01"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="form-section">
                    <h2>Hotel Image</h2>

                    <label className="image-upload-area" htmlFor="image">
                        {preview ? (
                            <div className="image-preview-container">
                                <img
                                    src={preview}
                                    alt="Hotel preview"
                                    className="image-preview"
                                />
                                <span className="change-image-text">
                                    Click to change image
                                </span>
                            </div>
                        ) : (
                            <div className="upload-placeholder">
                                <Upload size={35} />
                                <h3>Upload a new image</h3>
                                <p>Leave unchanged to keep the current image.</p>
                            </div>
                        )}
                    </label>

                    <input
                        id="image"
                        className="hidden-file-input"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                </div>

                {error && (
                    <div className="form-alert error-alert">
                        {error}
                    </div>
                )}

                <div className="form-actions">
                    <button
                        type="button"
                        className="cancel-button"
                        onClick={() => navigate("/")}
                        disabled={saving}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="submit-button"
                        disabled={saving}
                    >
                        <Save size={18} />
                        {saving ? "Updating..." : "Update Hotel"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditHotel;