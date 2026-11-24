
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createHotel } from "../services/hotelService";
import { Upload, X, ArrowLeft, Save } from "lucide-react";
import "./HotelForm.css";

function AddHotel() {
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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Create and clean up image preview URL
    useEffect(() => {
        if (!image) {
            setPreview("");
            return;
        }

        const imageUrl = URL.createObjectURL(image);
        setPreview(imageUrl);

        return () => URL.revokeObjectURL(imageUrl);
    }, [image]);

    // Handle text and number inputs
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    // Handle image selection
    const handleImageChange = (e) => {
        const selectedFile = e.target.files?.[0];

        if (!selectedFile) return;

        if (!selectedFile.type.startsWith("image/")) {
            setError("Please select a valid image file.");
            e.target.value = "";
            return;
        }

        if (selectedFile.size > 5 * 1024 * 1024) {
            setError("Image size must be less than 5 MB.");
            e.target.value = "";
            return;
        }

        setError("");
        setImage(selectedFile);
    };

    const validateForm = () => {
        const { title, description, latitude, longitude, price } = formData;

        if (!title.trim()) return "Hotel title is required.";
        if (!description.trim()) return "Hotel description is required.";
        if (!image) return "Please upload a hotel image.";

        if (latitude.trim() === "" || !Number.isFinite(Number(latitude))) {
            return "Please enter a valid latitude.";
        }

        if (Number(latitude) < -90 || Number(latitude) > 90) {
            return "Latitude must be between -90 and 90.";
        }

        if (longitude.trim() === "" || !Number.isFinite(Number(longitude))) {
            return "Please enter a valid longitude.";
        }

        if (Number(longitude) < -180 || Number(longitude) > 180) {
            return "Longitude must be between -180 and 180.";
        }

        if (price.trim() === "" || !Number.isFinite(Number(price)) || Number(price) <= 0) {
            return "Price must be greater than zero.";
        }

        return "";
    };

    // Submit hotel to backend
    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        const validationError = validateForm();

        if (validationError) {
            setError(validationError);
            return;
        }

        const data = new FormData();

        data.append("title", formData.title.trim());
        data.append("description", formData.description.trim());
        data.append("latitude", formData.latitude);
        data.append("longitude", formData.longitude);
        data.append("price", formData.price);
        data.append("image", image);

        try {
            setLoading(true);

            const response = await createHotel(data);

            setSuccess(response.message || "Hotel added successfully!");

            setTimeout(() => {
                navigate("/");
            }, 1200);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to add hotel. Please check your backend connection."
            );
        } finally {
            setLoading(false);
        }
    };

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
                <h1>Add a New Hotel</h1>
                <p className="form-subtitle">
                    Add your property details and make it available
                    for discovery.
                </p>
            </div>

            <form className="hotel-form" onSubmit={handleSubmit}>

                <div className="form-section">
                    <h2>Hotel Information</h2>
                    <p className="section-description">
                        Enter the basic details of your property.
                    </p>

                    <div className="form-group">
                        <label htmlFor="title">Hotel Name *</label>
                        <input
                            id="title"
                            type="text"
                            name="title"
                            placeholder="Example: Grand Palace Resort"
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
                            placeholder="Describe your hotel, facilities and experience..."
                            value={formData.description}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="form-section">
                    <h2>Hotel Location</h2>
                    <p className="section-description">
                        Enter the geographical coordinates of your property.
                    </p>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="latitude">Latitude *</label>
                            <input
                                id="latitude"
                                type="number"
                                name="latitude"
                                step="any"
                                min="-90"
                                max="90"
                                placeholder="Example: 11.6643"
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
                                name="longitude"
                                step="any"
                                min="-180"
                                max="180"
                                placeholder="Example: 78.1460"
                                value={formData.longitude}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <p className="field-hint">
                        You can get these coordinates from Google Maps.
                    </p>
                </div>

                <div className="form-section">
                    <h2>Pricing</h2>
                    <p className="section-description">
                        Set the price for one night.
                    </p>

                    <div className="form-group">
                        <label htmlFor="price">Price per Night (₹) *</label>
                        <input
                            id="price"
                            type="number"
                            name="price"
                            min="0.01"
                            step="0.01"
                            placeholder="Example: 3500"
                            value={formData.price}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="form-section">
                    <h2>Hotel Image</h2>
                    <p className="section-description">
                        Upload an attractive image of your property.
                    </p>

                    <label className="image-upload-area" htmlFor="image">
                        {preview ? (
                            <div className="image-preview-container">
                                <img
                                    src={preview}
                                    alt="Selected hotel preview"
                                    className="image-preview"
                                />

                                <span className="change-image-text">
                                    Click to change image
                                </span>
                            </div>
                        ) : (
                            <div className="upload-placeholder">
                                <Upload size={35} />
                                <h3>Upload Hotel Image</h3>
                                <p>Click here to browse your files</p>
                                <span>JPG, PNG or WEBP · Maximum 5 MB</span>
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

                    {image && (
                        <div className="selected-file">
                            <span>{image.name}</span>

                            <button
                                type="button"
                                onClick={() => setImage(null)}
                                aria-label="Remove selected image"
                            >
                                <X size={17} />
                            </button>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="form-alert error-alert">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="form-alert success-alert">
                        {success}
                    </div>
                )}

                <div className="form-actions">
                    <button
                        type="button"
                        className="cancel-button"
                        onClick={() => navigate("/")}
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="submit-button"
                        disabled={loading}
                    >
                        <Save size={18} />
                        {loading ? "Saving Hotel..." : "Save Hotel"}
                    </button>
                </div>

            </form>
        </div>
    );
}

export default AddHotel;
